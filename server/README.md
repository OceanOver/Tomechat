### 项目简介


**Tomechat** — 基于 Langchain 框架与远程 OpenAI-compatible API 的 RAG 知识库问答后端。

### 安装

```shell
uv sync --group test
```

### 配置

```shell
# 设置数据根目录（可选，默认使用当前目录）
export TOMECHAT_ROOT=/path/to/tomechat_data

# 模型服务配置
export MODEL_API_KEY=your-api-key
export MODEL_API_BASE=https://api.openai.com/v1
export MODEL_CHAT_MODEL=gpt-4o-mini
export MODEL_EMBEDDING_MODEL=text-embedding-3-small
```

数据目录和知识库数据库 Schema 会在 `tomechat start` 启动时自动创建。如需 `yaml` 配置文件，运行 `python -m tomechat.settings` 生成默认模板。

### 启动服务

```shell
uv run tomechat start --api
```

更多命令通过 `tomechat --help` 查看。
