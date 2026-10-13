### Tomechat 容器化部署指引

> 提示: 此指引为在 Linux 环境下编写完成, 其他环境下暂未测试, 理论上可行.

#### 一. 部署准备

##### 1. 安装 Docker 和 Docker Compose
寻找适合你环境的 Docker 和 Docker Compose 版本, 请参考 [Docker 官方文档](https://docs.docker.com/get-docker/).

##### 2. 准备模型服务商凭据
本项目仅支持通过 OpenAI-compatible API 接入远程模型服务（gemini 原生 SDK 除外）。你需要准备:
- 模型服务商 API Base URL（如 `https://api.openai.com/v1`）
- API Key
- Chat 模型名称和 Embedding 模型名称

#### 二. 构建与启动

Compose 包含两个服务:

| 服务 | 说明 | 端口 |
|------|------|------|
| `tomechat` | FastAPI 后端（API + 知识库） | 7861 |
| `tomechat-web` | Next.js 前端（经服务端路由代理后端 API） | 3210 |

##### 1. 构建镜像
```shell
cd Tomechat
docker compose -f docker/docker-compose.yaml build
```

##### 2. 配置环境变量
在 `docker/` 目录创建 `.env` 文件（compose 自动读取），或在 shell 中 export:

| 环境变量 | 必填 | 默认值 | 说明 |
|----------|------|--------|------|
| **LLM 服务** | | | |
| `MODEL_API_BASE` | 否 | `https://api.openai.com/v1` | LLM 平台 API 地址 |
| `MODEL_API_KEY` | **是** | - | LLM 平台 API Key |
| `MODEL_CHAT_MODEL` | 否 | `gpt-4o-mini` | 默认 Chat 模型 |
| `MODEL_PLATFORM_TYPE` | 否 | 空 | 平台类型: `openai` 或 `gemini`，留空走 openai 兼容路由 |
| `MODEL_API_PROXY` | 否 | 空 | LLM API 代理地址（如 `http://127.0.0.1:7890`） |
| **Embedding 服务** | | | |
| `MODEL_EMBEDDING_MODEL` | 否 | `text-embedding-3-small` | 默认 Embedding 模型 |
| `MODEL_EMBEDDING_API_BASE` / `_API_KEY` / `_API_PROXY` | 否 | 空 | Embedding 独立供应商配置（可指向不同平台；未设置项回退到 LLM 服务配置） |
| **前端** | | | |
| `ACCESS_CODE` | 否 | 空 | 前端访问口令，逗号分隔多个，留空不启用 |

```shell
export MODEL_API_BASE=https://api.openai.com/v1
export MODEL_API_KEY=your-api-key
export MODEL_CHAT_MODEL=gpt-4o-mini
export MODEL_EMBEDDING_MODEL=text-embedding-3-small
```

> 注意: 设置了任一 `MODEL_*` 变量时, 环境变量配置会**整体接管**模型平台列表（单平台部署），`model_settings.yaml` 的平台配置被忽略。如需多平台配置（如多个 LLM 供应商）, 请使用源码部署并通过 `model_settings.yaml` 配置。LLM 服务与 Embedding 服务相互独立, 可通过 `MODEL_EMBEDDING_API_*` 指向不同供应商。

##### 3. 启动服务
```shell
docker compose -f docker/docker-compose.yaml up -d
```

前端容器会等待后端健康检查通过后再启动，并自动通过容器网络访问后端（`TOMECHAT_PROXY_URL=http://tomechat:7861/v1`）。

##### 4. 检查服务启动情况
```shell
docker compose -f docker/docker-compose.yaml ps
```
```text
NAME                IMAGE                    ...   STATUS                    PORTS
docker-tomechat-1   ...                      ...   Up 3 minutes (healthy)    0.0.0.0:7861->7861/tcp
docker-tomechat-web-1 ...                    ...   Up 2 minutes              0.0.0.0:3210->3210/tcp
```

服务已正常启动后:
- 前端界面: `http://<your_ip>:3210`
- 后端 API 文档: `http://<your_ip>:7861/docs`

#### 三. 数据持久化

Compose 已为后端配置 `tomechat_data` 命名卷（挂载到容器内 `/data`），知识库、SQLite 数据库、日志、NLTK 数据均持久化在其中。如需挂载到本地目录:

```yaml
services:
  tomechat:
    volumes:
      - /path/to/data:/data
```

#### 四. 配置文件

首次启动时容器会自动创建空数据目录和数据库 Schema，并可通过环境变量注入模型配置。如需更细粒度的配置（`basic_settings.yaml` / `kb_settings.yaml` / `model_settings.yaml` / `prompt_settings.yaml`），将宿主机目录挂载到 `/data` 后，参照源码部署文档（项目根目录 `README.md`）手动放置或由模板生成对应 yaml 文件，重启容器生效。
