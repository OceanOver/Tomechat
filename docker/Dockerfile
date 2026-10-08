# 多阶段构建：第一阶段安装依赖，第二阶段运行服务
FROM python:3.11-slim AS builder

LABEL maintainer="Tomechat"

WORKDIR /build

# 系统依赖
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        git libgl1 libglib2.0-0 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# 复制项目文件
COPY pyproject.toml uv.lock /build/
COPY server/ /build/server/

# 安装生产依赖（不含 dev/test 等可选组）
RUN uv sync --frozen --no-dev

# ---- 运行阶段 ----
FROM python:3.11-slim

LABEL maintainer="Tomechat"

# 运行时系统依赖
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 从 builder 阶段复制虚拟环境
COPY --from=builder /build/.venv /app/.venv

# 复制后端源码
COPY server/ /app/server/

# 环境变量
ENV TOMECHAT_ROOT=/data \
    PYTHONPATH="/app/server:${PYTHONPATH}" \
    PATH="/app/.venv/bin:${PATH}" \
    TZ=Asia/Shanghai

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app/server

# 使用非 root 用户运行
RUN useradd -m -u 1000 tomechat && \
    mkdir -p /data && chown -R tomechat:tomechat /data /app
USER tomechat

EXPOSE 7861

# 健康检查：仅检查本地进程
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import httpx; r=httpx.get('http://127.0.0.1:7861/docs', timeout=5); exit(0 if r.status_code<500 else 1)"

ENTRYPOINT ["python", "-m", "tomechat.cli", "start", "--api"]
