"""守卫测试：断言源码中不存在 langchain 0.2 时代的遗留 import / 废弃 API。

langchain 1.x 移除了顶层 langchain.schema / langchain.chains / langchain.prompts 等模块
及 LLMChain、AsyncIteratorCallbackHandler 等废弃 API。此测试防止回归。
"""

from pathlib import Path

import pytest

SERVER_ROOT = Path(__file__).parent.parent.parent / "tomechat"

# 允许的例外：匹配到这些上下文的行不算违规（如注释）
FORBIDDEN_PATTERNS = [
    "from langchain.",  # 顶层 langchain 包(1.x 中仅剩 agents/tools 等新式入口,另行显式审查)
    "import langchain.",  # 同上
    "AsyncIteratorCallbackHandler",
    "LLMChain",
    "StuffDocumentsChain",
    "MapReduceDocumentsChain",
    "openai_api_base=",
    "openai_api_key=",
    "openai_proxy=",
]

# langchain 1.x 中合法的顶层 langchain.* 入口(如需使用须显式加进白名单)
ALLOWED_LANGCHAIN_SUBMODULES = ("langchain.agents", "langchain.tools")


@pytest.mark.parametrize("pattern", FORBIDDEN_PATTERNS)
def test_no_legacy_langchain_usage(pattern):
    offenders = []
    for py_file in SERVER_ROOT.rglob("*.py"):
        text = py_file.read_text(encoding="utf-8", errors="ignore")
        for line_no, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()
            if stripped.startswith("#"):
                continue
            if pattern not in line:
                continue
            # 顶层 langchain.* 白名单
            if pattern.startswith("from langchain.") or pattern.startswith("import langchain."):
                module = stripped.replace("from ", "").replace("import ", "").split()[0].split(" ")[0]
                if any(module == a or module.startswith(a + ".") for a in ALLOWED_LANGCHAIN_SUBMODULES):
                    continue
            offenders.append(f"{py_file.relative_to(SERVER_ROOT)}:{line_no}: {stripped}")
    assert not offenders, f"发现遗留的 langchain 用法 {pattern!r}:\n" + "\n".join(offenders)
