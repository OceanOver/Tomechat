# Tomechat

RAG knowledge-base chat application built on the LangChain framework and remote LLM APIs.

[English](README.md) | [简体中文](README.zh-CN.md)

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Quick Start](#quick-start)
    * [Install from Source](#install-from-source)
    * [Docker Deployment](#docker-deployment)
* [License](#license)

## Overview

Tomechat connects to remote model services through OpenAI-compatible APIs and implements knowledge-base RAG chat on top of the LangChain framework.

Architecture:

- **FastAPI backend** — model proxy, RAG, knowledge-base management, database
- **Next.js frontend** — the only WebUI; talks to the backend API
- **SQLite + FAISS** — knowledge-base metadata storage and vector retrieval

Model call boundary: FastAPI is the only model gateway. The Next.js frontend never talks to model providers directly and never holds provider keys.

## Features

| Feature | Description |
|---------|-------------|
| LLM chat | Call remote LLMs through OpenAI-compatible APIs |
| Knowledge-base RAG | Local knowledge-base Q&A based on FAISS vector retrieval |
| Search engine chat | Tavily web search–augmented chat |
| File chat | Temporary file upload and chat |
| Knowledge-base management | CRUD, document vectorization, FAISS index |

### Model Services

Remote model services are accessed via OpenAI-compatible APIs only. Configure in environment variables (see `.env.example`):

- Model provider API base URL
- API key
- Chat model name and embedding model name

No local models, model weights, or GPU runtimes are deployed. Reranker and multimodal capabilities are not included.

## Quick Start

### Install from Source

#### 0. Requirements

- Python 3.10+
- Node.js 18+, pnpm
- [uv](https://docs.astral.sh/uv/)

#### 1. Install the backend

```shell
uv sync --group test
```

#### 2. Configure environment variables

```shell
# Data root directory (optional, defaults to the current directory)
export TOMECHAT_ROOT=/path/to/tomechat_data

# Model service configuration
export MODEL_API_KEY=your-api-key
export MODEL_API_BASE=https://api.openai.com/v1
export MODEL_CHAT_MODEL=gpt-4o-mini
export MODEL_EMBEDDING_MODEL=text-embedding-3-small
```

The data directory and knowledge-base database schema are created automatically at `tomechat start` — no manual initialization needed.

#### 3. Start the backend

```shell
uv run tomechat start --api
```

#### 4. Start the frontend

```shell
cd frontend
pnpm install --frozen-lockfile
pnpm run dev
```

### Docker Deployment

```shell
docker compose -f docker/docker-compose.yaml build
docker compose -f docker/docker-compose.yaml up -d
```

See the [Docker deployment guide](docs/install/README_docker.md) for details.

## License

This project is open-sourced under the [MIT](LICENSE) license.
