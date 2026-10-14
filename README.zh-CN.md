# Tomechat

基于 Langchain 框架与远程大语言模型 API 实现的 RAG 知识库问答应用。

[English](README.md) | [简体中文](README.zh-CN.md)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Python](https://img.shields.io/badge/Python-3.10%2B-blue) ![Node](https://img.shields.io/badge/Node-20%2B-green)

![Tomechat 界面截图](docs/screenshot.png)

---

## 目录

* [概述](#概述)
* [功能介绍](#功能介绍)
* [快速上手](#快速上手)
    * [源码安装部署](#源码安装部署)
    * [Docker 部署](#docker-部署)
* [协议](#协议)

## 概述

本项目是一个 chatbot 应用：通过 OpenAI-compatible API（或 Google Gemini 原生 SDK，`MODEL_PLATFORM_TYPE=gemini`）接入远程模型服务，基于 Langchain 框架实现知识库 RAG（检索增强生成）问答，使用 FAISS 向量检索。

架构组成：

- **FastAPI 后端**：模型代理、RAG、知识库管理、数据库
- **Next.js 前端**：唯一 WebUI，通过后端 API 访问服务
- **SQLite + FAISS**：知识库元数据存储与向量检索

模型调用边界：FastAPI 是唯一模型网关，Next.js 前端不直连服务商、不持有服务商密钥。

## 功能介绍

| 功能 | 说明 |
|------|------|
| LLM 对话 | 通过 OpenAI-compatible API（或 Gemini 原生 SDK）调用远程 LLM |
| 知识库 RAG | 基于 FAISS 向量检索的本地知识库问答 |
| 搜索引擎对话 | Tavily（或自托管 SearxNG）搜索引擎检索增强 |
| 知识库管理 | 增删改查、文档向量化、FAISS 索引 |

### 模型服务

通过 OpenAI-compatible API（或 Google Gemini 原生 SDK）接入远程模型服务。**LLM 服务与 Embedding 服务相互独立配置，可以使用不同供应商**（见 `.env.example`）：

**LLM 服务**

- `MODEL_API_BASE` / `MODEL_API_KEY` — 模型服务商 API Base URL 与 API Key
- `MODEL_CHAT_MODEL` — 默认 Chat 模型
- `MODEL_PLATFORM_TYPE` — `openai`（默认）或 `gemini`（Google 原生 SDK；因 Gemini 3 思考模型在兼容端点上缺少 `thought_signature` 回传会报 400）
- `MODEL_API_PROXY` — HTTP 代理，留空直连

**Embedding 服务**

- `MODEL_EMBEDDING_MODEL` — 默认 Embedding 模型
- `MODEL_EMBEDDING_API_BASE` / `MODEL_EMBEDDING_API_KEY` / `MODEL_EMBEDDING_API_PROXY` — 可指向不同供应商；未设置的项回退到 LLM 服务配置

> 注意：设置了上述任一 `MODEL_*` 变量时，环境变量配置会**整体接管**平台列表（单平台部署），`model_settings.yaml` 的平台配置被忽略。多平台场景请将 `MODEL_*` 变量全部留空，改用 `model_settings.yaml` 配置。

不部署本地模型、模型权重或 GPU 运行时。不保留 Reranker 和多模态能力。

## 快速上手

### 源码安装部署

#### 0. 软硬件要求

- Python 3.10+
- Node.js 20+（Node 22，见 `frontend/.nvmrc`），pnpm
- [uv](https://docs.astral.sh/uv/)

#### 1. 安装后端

```shell
uv sync --group test
```

#### 2. 配置环境变量

```shell
# 设置数据根目录（可选，默认使用当前目录）
export TOMECHAT_ROOT=/path/to/tomechat_data

# LLM 服务
export MODEL_API_KEY=your-api-key
export MODEL_API_BASE=https://api.openai.com/v1
export MODEL_CHAT_MODEL=gpt-4o-mini

# Embedding 服务（可使用不同供应商；未设置的 MODEL_EMBEDDING_API_* 项回退到上方 LLM 服务配置）
export MODEL_EMBEDDING_MODEL=text-embedding-3-small

# 可选：搜索引擎对话（Tavily）
export TAVILY_API_KEY=your-tavily-key
```

数据目录和知识库数据库 Schema 会在 `tomechat start` 启动时自动创建，无需手动初始化。

#### 3. 启动后端

```shell
uv run tomechat start --api
```

#### 4. 启动前端

```shell
cd frontend
cp .env.example .env
pnpm install
pnpm run dev
```

前端 `.env` 默认指向 `http://localhost:7861` 的后端。前后端都启动后，访问 <http://localhost:3010>。

### Docker 部署

```shell
docker compose -f docker/docker-compose.yaml build
docker compose -f docker/docker-compose.yaml up -d
```

详细说明参考 [Docker 部署指南](docs/install/README_docker.md)。

## 协议

本项目基于 [MIT](LICENSE) 协议开源。
