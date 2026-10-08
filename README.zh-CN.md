# Tomechat

基于 Langchain 框架与远程大语言模型 API 实现的 RAG 知识库问答应用。

[English](README.md) | [简体中文](README.zh-CN.md)

---

## 目录

* [概述](#概述)
* [功能介绍](#功能介绍)
* [快速上手](#快速上手)
    * [源码安装部署](#源码安装部署)
    * [Docker 部署](#docker-部署)
* [协议](#协议)

## 概述

本项目通过 OpenAI-compatible API 接入远程模型服务，基于 Langchain 框架实现知识库 RAG 问答。

架构组成：

- **FastAPI 后端**：模型代理、RAG、知识库管理、数据库
- **Next.js 前端**：唯一 WebUI，通过后端 API 访问服务
- **SQLite + FAISS**：知识库元数据存储与向量检索

模型调用边界：FastAPI 是唯一模型网关，Next.js 前端不直连服务商、不持有服务商密钥。

## 功能介绍

| 功能 | 说明 |
|------|------|
| LLM 对话 | 通过 OpenAI-compatible API 调用远程 LLM |
| 知识库 RAG | 基于 FAISS 向量检索的本地知识库问答 |
| 搜索引擎对话 | Tavily 搜索引擎检索增强 |
| 文件对话 | 临时文件上传与对话 |
| 知识库管理 | 增删改查、文档向量化、FAISS 索引 |

### 模型服务

仅支持通过 OpenAI-compatible API 接入远程模型服务。通过环境变量配置（见 `.env.example`）：

- 模型服务商 API Base URL
- API Key
- Chat 模型名称和 Embedding 模型名称

不部署本地模型、模型权重或 GPU 运行时。不保留 Reranker 和多模态能力。

## 快速上手

### 源码安装部署

#### 0. 软硬件要求

- Python 3.10+
- Node.js 18+，pnpm
- [uv](https://docs.astral.sh/uv/)

#### 1. 安装后端

```shell
uv sync --group test
```

#### 2. 配置环境变量

```shell
# 设置数据根目录（可选，默认使用当前目录）
export TOMECHAT_ROOT=/path/to/tomechat_data

# 模型服务配置
export MODEL_API_KEY=your-api-key
export MODEL_API_BASE=https://api.openai.com/v1
export MODEL_CHAT_MODEL=gpt-4o-mini
export MODEL_EMBEDDING_MODEL=text-embedding-3-small
```

数据目录和知识库数据库 Schema 会在 `tomechat start` 启动时自动创建，无需手动初始化。

#### 3. 启动后端

```shell
uv run tomechat start --api
```

#### 4. 启动前端

```shell
cd frontend
pnpm install --frozen-lockfile
pnpm run dev
```

### Docker 部署

```shell
docker compose -f docker/docker-compose.yaml build
docker compose -f docker/docker-compose.yaml up -d
```

详细说明参考 [Docker 部署指南](docs/install/README_docker.md)。

## 协议

本项目基于 [MIT](LICENSE) 协议开源。
