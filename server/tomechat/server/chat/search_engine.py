from langchain_community.utilities.searx_search import SearxSearchWrapper
from langchain_core.documents import Document
from langchain_tavily import TavilySearch

from tomechat.settings import Settings


def searx_search(text: str, config: dict, top_k: int):
    search = SearxSearchWrapper(
        searx_host=config["host"],
        engines=config["engines"],
        categories=config["categories"],
    )
    search.params["language"] = config.get("language", "zh-CN")
    return search.results(text, top_k)


def tavily_search(text: str, config: dict, top_k: int):
    # api_key 未传时 TavilySearch 自动读 TAVILY_API_KEY 环境变量
    tool = TavilySearch(max_results=top_k, topic=config.get("topic", "general"))
    raw = tool.invoke({"query": text})
    return [
        {
            "snippet": r.get("content", ""),
            "link": r.get("url", ""),
            "title": r.get("title", ""),
        }
        for r in raw.get("results", [])
    ]


SEARCH_ENGINES = {
    "tavily": tavily_search,
    "searx": searx_search,
}


def search_result_to_documents(search_results) -> list[Document]:
    return [
        Document(
            page_content=result.get("snippet", ""),
            metadata={
                "source": result.get("link", ""),
                "filename": result.get("title", ""),
            },
        )
        for result in search_results
    ]


def search_engine(
    query: str,
    top_k: int = 0,
    engine_name: str = "",
    config: dict | None = None,
):
    config = config or Settings.kb_settings.SEARCH_ENGINE_CONFIG
    top_k = top_k if top_k > 0 else Settings.kb_settings.SEARCH_ENGINE_TOP_K
    engine_name = engine_name or Settings.kb_settings.DEFAULT_SEARCH_ENGINE
    results = SEARCH_ENGINES[engine_name](
        text=query,
        config=config[engine_name],
        top_k=top_k,
    )
    docs = [doc for doc in search_result_to_documents(results) if doc.page_content and doc.page_content.strip()]
    return {"docs": docs, "search_engine": engine_name}
