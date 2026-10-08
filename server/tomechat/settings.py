from __future__ import annotations

import logging
import os
import sys
import typing as t
from pathlib import Path

import nltk

from tomechat import __version__

logger = logging.getLogger(__name__)

# tomechat data dir, must be set via env var. Falls back to the current directory if unset.
TOMECHAT_ROOT = Path(os.environ.get("TOMECHAT_ROOT", ".")).resolve()

# Load .env (template in .env.example): prefer TOMECHAT_ROOT/.env, otherwise search upward from cwd
# (cwd may be a server/ subdirectory); real environment variables take precedence over .env
from dotenv import (
    find_dotenv,
    load_dotenv,
)

if not load_dotenv(TOMECHAT_ROOT / ".env"):
    load_dotenv(find_dotenv(usecwd=True))

from tomechat.pydantic_settings_file import (
    BaseFileSettings,
    MyBaseModel,
    SettingsConfigDict,
    SettingsDescriptor,
    cached_property,
    settings_property,
)


class BasicSettings(BaseFileSettings):
    """
    Basic server configuration.
    Only log_verbose/HTTPX_DEFAULT_TIMEOUT take effect immediately after modification.
    All other settings require a server restart; do not modify while the service is running.
    """

    model_config = SettingsConfigDict(yaml_file=TOMECHAT_ROOT / "basic_settings.yaml")

    version: str = __version__
    """Project code version that generated this config template. If this value doesn't match the actual program version, rebuilding the config template is recommended."""

    log_verbose: bool = False
    """Whether to enable verbose logging."""

    HTTPX_DEFAULT_TIMEOUT: float = 300
    """Default httpx request timeout (seconds). Increase if model loading or chat is slow and timing out."""

    @cached_property
    def PACKAGE_ROOT(self) -> Path:
        """Code root directory"""
        return Path(__file__).parent

    @cached_property
    def DATA_PATH(self) -> Path:
        """User data root directory"""
        p = TOMECHAT_ROOT / "data"
        return p

    @cached_property
    def NLTK_DATA_PATH(self) -> Path:
        """nltk model storage path"""
        p = self.DATA_PATH / "nltk_data"
        return p

    @cached_property
    def LOG_PATH(self) -> Path:
        """Log storage path"""
        p = self.DATA_PATH / "logs"
        return p

    @cached_property
    def MEDIA_PATH(self) -> Path:
        """Storage location for model-generated content (images, videos, audio, etc.)"""
        p = self.DATA_PATH / "media"
        return p

    @cached_property
    def BASE_TEMP_DIR(self) -> Path:
        """Temp file directory, mainly for file-based chat"""
        p = self.DATA_PATH / "temp"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @cached_property
    def DB_ROOT_PATH(self) -> Path:
        """Default sqlite database storage path. For other databases, modify SQLALCHEMY_DATABASE_URI directly."""
        p = Path(self.KB_ROOT_PATH) / "info.db"
        return p

    KB_ROOT_PATH: str = str(TOMECHAT_ROOT / "data/knowledge_base")
    """Default knowledge base storage path"""

    SQLALCHEMY_DATABASE_URI: str = "sqlite:///" + str(TOMECHAT_ROOT / "data/knowledge_base/info.db")
    """Knowledge base info database connection URI"""

    OPEN_CROSS_DOMAIN: bool = False
    """Whether to enable CORS for the API"""

    DEFAULT_BIND_HOST: str = "0.0.0.0" if sys.platform != "win32" else "127.0.0.1"
    """Default server bind host."""

    API_SERVER: dict = {"host": DEFAULT_BIND_HOST, "port": 7861, "public_host": "127.0.0.1", "public_port": 7861}
    """API server address. public_host is used to generate cloud public access links (e.g. KB document links)"""

    LANG_SMITH: dict = {"OPEN_LANGSMITH": False, "LANGCHAIN_API_KEY": "lsv2_sk_xxx", "LANGCHAIN_PROJECT": ""}
    """Whether LangSmith is enabled"""

    def make_dirs(self):
        """Create all data directories"""
        for p in [
            self.DATA_PATH,
            self.NLTK_DATA_PATH,
            self.MEDIA_PATH,
            self.LOG_PATH,
            self.BASE_TEMP_DIR,
        ]:
            p.mkdir(parents=True, exist_ok=True)
        for n in ["image", "audio", "video"]:
            (self.MEDIA_PATH / n).mkdir(parents=True, exist_ok=True)
        Path(self.KB_ROOT_PATH).mkdir(parents=True, exist_ok=True)
        ensure_nltk_data()


class KBSettings(BaseFileSettings):
    """Knowledge base related configuration"""

    model_config = SettingsConfigDict(yaml_file=TOMECHAT_ROOT / "kb_settings.yaml")

    DEFAULT_KNOWLEDGE_BASE: str = ""
    """Default knowledge base to use"""

    DEFAULT_VS_TYPE: t.Literal["faiss"] = "faiss"
    """Default vector store / full-text search engine type"""

    CACHED_VS_NUM: int = 1
    """Number of cached vector stores (for FAISS)"""

    CHUNK_SIZE: int = 750
    """Length of a single text chunk in the KB (not applicable to MarkdownHeaderTextSplitter)"""

    OVERLAP_SIZE: int = 150
    """Overlap length between adjacent text chunks in the KB (not applicable to MarkdownHeaderTextSplitter)"""

    VECTOR_SEARCH_TOP_K: int = 3
    """Number of vectors matched from the KB (also the default top_k for the agent kb_search tool)"""

    SCORE_THRESHOLD: float = 0.3
    """KB match relevance threshold, range 0-2. Lower score = more relevant; 2 means no filtering.
    Note: langchain normalizes as score = 1 - sqrt(1 - cosine); 0.3 corresponds to roughly cosine 0.51,
    while 0.7 requires cosine 0.91, so relevant content will mostly fail to pass."""

    DEFAULT_SEARCH_ENGINE: t.Literal["tavily", "searx"] = "tavily"
    """Default search engine"""

    SEARCH_ENGINE_TOP_K: int = 3
    """Number of search engine match results"""

    SEARCH_ENGINE_CONFIG: dict[str, t.Any] = {
        "tavily": {"topic": "general"},
        "searx": {
            "host": "https://metasearx.com",
            "engines": [],
            "categories": [],
            "language": "zh-CN",
        },
    }
    """Search engine connection configuration."""

    ZH_TITLE_ENHANCE: bool = False
    """Whether to enable Chinese title enhancement, plus related config for the enhancement"""

    ADAPTIVE_DOCUMENTS: bool = False
    """Whether to enable LLM pre-generation self-assessment to filter retrieved documents"""

    SELF_VERIFY_EVIDENCE: bool = False
    """Whether to enable LLM post-generation self-verification to filter retrieved evidence"""

    PDF_OCR_THRESHOLD: tuple[float, float] = (0.6, 0.6)
    """
    PDF OCR control: only OCR images whose width/height exceed a given fraction of the page
    (image width/page width, image height/page height). This avoids interference from small
    images in the PDF and speeds up processing of non-scanned PDFs.
    """

    KB_INFO: dict[str, str] = {}
    """Initial introduction for each knowledge base."""

    kbs_config: dict[str, dict] = {"faiss": {}}
    """FAISS vector store configuration"""

    text_splitter_dict: dict[str, dict[str, t.Any]] = {
        "ChineseRecursiveTextSplitter": {
            "source": "",
            "tokenizer_name_or_path": "",
        },
        "SpacyTextSplitter": {
            "source": "huggingface",
            "tokenizer_name_or_path": "gpt2",
        },
        "RecursiveCharacterTextSplitter": {
            "source": "tiktoken",
            "tokenizer_name_or_path": "cl100k_base",
        },
        "MarkdownHeaderTextSplitter": {
            "headers_to_split_on": [
                ("#", "head1"),
                ("##", "head2"),
                ("###", "head3"),
                ("####", "head4"),
            ]
        },
    }
    """
    TextSplitter config. If you don't understand what these mean, don't modify them.
    If source is set to tiktoken, OpenAI's method is used; "huggingface" otherwise.
    """

    TEXT_SPLITTER_NAME: str = "ChineseRecursiveTextSplitter"
    """TEXT_SPLITTER name"""

    EMBEDDING_KEYWORD_FILE: str = "embedding_keywords.txt"
    """Custom vocabulary file for the embedding model"""


class PlatformConfig(MyBaseModel):
    """OpenAI-compatible remote model service configuration"""

    platform_name: str = "openai-compatible"
    """Platform name"""

    platform_type: t.Literal["openai", "gemini"] = "openai"
    """Platform type. gemini = Google native SDK route (tool calls support thought_signature round-trip),
    everything else goes through OpenAI-compatible endpoints"""

    api_base_url: str = os.environ.get("MODEL_API_BASE", "https://api.openai.com/v1")
    """openai api url"""

    api_key: str = os.environ.get("MODEL_API_KEY", "")
    """api key if available"""

    api_proxy: str = os.environ.get("MODEL_API_PROXY", "")
    """API proxy, e.g. http://127.0.0.1:7890"""

    api_concurrencies: int = 5
    """Max concurrency per model on this platform"""

    auto_detect_model: bool = False
    """Whether to auto-fetch the platform's available model list. When True, the model types below can be auto-detected"""

    llm_models: t.Literal["auto"] | list[str] = []
    """LLMs supported by this platform, auto-detected when auto_detect_model is True"""

    embed_models: t.Literal["auto"] | list[str] = []
    """Embedding models supported by this platform, auto-detected when auto_detect_model is True"""


class ApiModelSettings(BaseFileSettings):
    """Model configuration"""

    model_config = SettingsConfigDict(yaml_file=TOMECHAT_ROOT / "model_settings.yaml")

    def model_post_init(self, __context: t.Any) -> None:
        # Env vars take precedence over yaml config, so model service info (incl. nested MODEL_PLATFORMS) can be injected via env
        if llm_model := os.environ.get("MODEL_CHAT_MODEL"):
            self.DEFAULT_LLM_MODEL = llm_model
        if embed_model := os.environ.get("MODEL_EMBEDDING_MODEL"):
            self.DEFAULT_EMBEDDING_MODEL = embed_model

        if api_base := os.environ.get("MODEL_API_BASE"):
            for platform in self.MODEL_PLATFORMS:
                platform.api_base_url = api_base
        if api_key := os.environ.get("MODEL_API_KEY"):
            for platform in self.MODEL_PLATFORMS:
                platform.api_key = api_key
        if api_proxy := os.environ.get("MODEL_API_PROXY"):
            for platform in self.MODEL_PLATFORMS:
                platform.api_proxy = api_proxy
        if platform_type := os.environ.get("MODEL_PLATFORM_TYPE"):
            if platform_type in t.get_args(PlatformConfig.model_fields["platform_type"].annotation):
                for platform in self.MODEL_PLATFORMS:
                    platform.platform_type = t.cast(t.Literal["openai", "gemini"], platform_type)

        # Embedding may use a different platform than the LLM (base_url/key/proxy configured independently; falls back to the LLM platform when unset)
        embed_base = os.environ.get("MODEL_EMBEDDING_API_BASE")
        embed_key = os.environ.get("MODEL_EMBEDDING_API_KEY")
        embed_proxy = os.environ.get("MODEL_EMBEDDING_API_PROXY")
        if embed_base or embed_key or embed_proxy:
            embed_model = self.DEFAULT_EMBEDDING_MODEL
            for platform in self.MODEL_PLATFORMS:
                embed_list = platform.embed_models if isinstance(platform.embed_models, list) else []
                if embed_model not in embed_list:
                    continue
                if platform.llm_models:
                    # Same platform hosts both LLM and embedding: split out a standalone embedding platform if endpoints differ
                    platform.embed_models = []
                    self.MODEL_PLATFORMS.append(
                        PlatformConfig(
                            platform_name=f"{platform.platform_name}-embedding",
                            api_base_url=embed_base or platform.api_base_url,
                            api_key=embed_key or platform.api_key,
                            api_proxy=embed_proxy or platform.api_proxy,
                            embed_models=[embed_model],
                        )
                    )
                else:
                    if embed_base:
                        platform.api_base_url = embed_base
                    if embed_key:
                        platform.api_key = embed_key
                    if embed_proxy:
                        platform.api_proxy = embed_proxy
                break

        return super().model_post_init(__context)

    DEFAULT_LLM_MODEL: str = os.environ.get("MODEL_CHAT_MODEL", "gpt-4o-mini")
    """Default LLM name"""

    DEFAULT_EMBEDDING_MODEL: str = os.environ.get("MODEL_EMBEDDING_MODEL", "text-embedding-3-small")
    """Default embedding model name"""

    HISTORY_LEN: int = 10
    """Default number of conversation history turns"""

    MAX_TOKENS: int | None = None
    """Max length supported by the model. If unset, the model's own default max is used; if set, it is used as the user-defined max length"""

    TEMPERATURE: float = 0.7
    """Generic LLM chat parameter"""
    MODEL_PLATFORMS: list[PlatformConfig] = [
        PlatformConfig(
            llm_models=[os.environ.get("MODEL_CHAT_MODEL", "gpt-4o-mini")],
            embed_models=[os.environ.get("MODEL_EMBEDDING_MODEL", "text-embedding-3-small")],
        )
    ]
    """Model platform configuration"""


class PromptSettings(BaseFileSettings):
    """Prompt templates for plain chat and RAG."""

    model_config = SettingsConfigDict(yaml_file=TOMECHAT_ROOT / "prompt_settings.yaml", extra="allow")

    llm_model: dict = {
        "default": "{{input}}",
        "with_history": (
            "The following is a friendly conversation between a human and an AI.\n"
            "The AI is talkative and provides lots of specific details from its context.\n"
            "If the AI does not know the answer to a question, it truthfully says it does not know.\n\n"
            "Current conversation:\n"
            "{{history}}\n"
            "Human: {{input}}\n"
            "AI:"
        ),
    }
    """Template for plain LLM chat"""

    rag: dict = {
        "default": (
            "[Instruction] Answer the question concisely and professionally based on the known information. "
            'If the answer cannot be derived from it, say "The question cannot be answered based on the known information"; '
            "fabrication is not allowed in the answer. Please answer in Chinese.\n\n"
            "[Known information] {{context}}\n\n"
            "[Question] {{question}}\n"
        ),
        "empty": ("Please answer my question:\n{{question}}"),
    }
    """Template for RAG; usable for KB chat, file chat, and search engine chat"""


class SettingsContainer:
    TOMECHAT_ROOT = TOMECHAT_ROOT

    basic_settings: SettingsDescriptor[BasicSettings] = settings_property(BasicSettings())
    kb_settings: SettingsDescriptor[KBSettings] = settings_property(KBSettings())
    model_settings: SettingsDescriptor[ApiModelSettings] = settings_property(ApiModelSettings())
    prompt_settings: SettingsDescriptor[PromptSettings] = settings_property(PromptSettings())

    def createl_all_templates(self):
        def create_if_missing(settings, **kwargs):
            path = Path(settings.model_config["yaml_file"])
            if not path.exists():
                settings.create_template_file(write_file=True, **kwargs)

        create_if_missing(self.basic_settings)
        create_if_missing(self.kb_settings)
        create_if_missing(
            self.model_settings,
            sub_comments={
                "MODEL_PLATFORMS": {
                    "model_obj": PlatformConfig(),
                    "is_entire_comment": True,
                }
            },
        )
        create_if_missing(self.prompt_settings)


Settings = SettingsContainer()
nltk.data.path.append(str(Settings.basic_settings.NLTK_DATA_PATH))


# Data required by nltk tokenization/tagging, downloaded on demand to the runtime dir on first startup
NLTK_RESOURCES = ["tokenizers/punkt", "taggers/averaged_perceptron_tagger", "corpora/cmudict"]


def ensure_nltk_data():
    for res in NLTK_RESOURCES:
        try:
            nltk.data.find(res)
        except LookupError:
            try:
                nltk.download(
                    res.split("/", 1)[1], download_dir=str(Settings.basic_settings.NLTK_DATA_PATH), quiet=True
                )
            except Exception as e:
                logger.warning(f"failed to download nltk data ({res}): {e}")


if __name__ == "__main__":
    Settings.createl_all_templates()
