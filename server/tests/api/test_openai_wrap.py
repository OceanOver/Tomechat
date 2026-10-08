import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

import openai

from tomechat.server.model_factory import get_default_llm
from tomechat.server.utils import api_address

api_base_url = f"{api_address()}/v1"
client = openai.Client(
    api_key="EMPTY",
    base_url=api_base_url,
)


def test_chat():
    resp = client.chat.completions.create(
        messages=[{"role": "user", "content": "你是谁"}],
        model=get_default_llm(),
    )
    print(resp)
    assert hasattr(resp, "choices") and len(resp.choices) > 0
