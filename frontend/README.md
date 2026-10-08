# Tomechat

Tomechat is a web application for everyday chatting and knowledge-base RAG
(retrieval-augmented generation), built with Next.js.

The frontend never talks to model providers directly — all requests are proxied
through a [FastAPI](https://fastapi.tiangolo.com) backend, so API keys stay
server-side.

## Features

- **Chat** — streaming conversations with tool awareness, message editing,
  re-generation, branching (thread replies), and topic organization
- **Knowledge-base RAG** — create knowledge bases, upload documents, and chat
  over them with retrieval scoring controls
- **Sessions** — organize chats into sessions and groups, pin/favorite, inbox
- **Agent settings** — per-session system prompt, model parameters
  (temperature, top_p, …), and auto-generated metadata
- **Local-first storage** — sessions, messages, and topics live in IndexedDB
  (via Dexie); no account required
- **i18n** — English and Simplified Chinese

## Tech Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS v3 + shadcn/ui (Radix primitives)
- Zustand for state management
- Dexie (IndexedDB) for client-side persistence
- assistant-ui for the conversation runtime
- Vitest for testing

## Getting Started

Requirements: Node.js 18 (see `.nvmrc`) and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env   # adjust the backend endpoints if needed
pnpm dev               # http://localhost:3010
```

### Environment Variables

| Variable              | Description                                       | Default                          |
| --------------------- | ------------------------------------------------- | -------------------------------- |
| `TOMECHAT_PROXY_URL`  | Chat backend (OpenAI-compatible API) endpoint      | `http://localhost:7861/v1`       |
| `KNOWLEDGE_PROXY_URL` | Knowledge-base service endpoint                    | `http://localhost:7861/knowledge_base` |

## Scripts

```bash
pnpm dev          # start the dev server on port 3010
pnpm build        # production build
pnpm test         # vitest (watch mode)
pnpm lint         # eslint + stylelint + type-check + circular-import check
pnpm type-check   # tsc --noEmit
```

## Project Structure

```
src/
├── agent-runtime/   # model provider adapters (OpenAI-compatible runtime)
├── app/             # Next.js App Router pages & API routes
├── chains/          # LLM utility chains (title/summary/translate/…)
├── components/      # shared UI components
├── config/          # provider & model configuration
├── const/           # shared constants
├── database/        # Dexie (IndexedDB) schemas, models, and core
├── features/        # feature modules (conversation, agent settings, …)
├── hooks/           # shared React hooks
├── locales/         # i18n resources
├── services/        # backend API clients
├── store/           # Zustand stores (chat, session, global, file, knowledge)
└── utils/           # shared utilities
```

## License

[MIT](./LICENSE)
