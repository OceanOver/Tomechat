import json
import sys
from pathlib import Path
from uuid import uuid4

import pytest
import requests

sys.path.append(str(Path(__file__).parent.parent.parent))
from pprint import pprint

from tomechat.server.model_factory import get_default_llm
from tomechat.server.utils import api_address

api_base_url = api_address()
api = "/v1/chat/completions"
url = f"{api_base_url}{api}"
llm_model = get_default_llm()


def dump_input(d, title):
    print("\n")
    print("=" * 30 + title + "  input " + "=" * 30)
    pprint(d)


def dump_output(r, title):
    print("\n")
    print("=" * 30 + title + "  output" + "=" * 30)
    for line in r.iter_content(None, decode_unicode=True):
        print(line, end="", flush=True)


headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
}


@pytest.fixture(scope="module")
def runtime_kb(request):
    kb_name = f"kb_stream_{uuid4().hex}"
    create_url = f"{api_base_url}/knowledge_base/create_knowledge_base"
    delete_url = f"{api_base_url}/knowledge_base/delete_knowledge_base"
    response = requests.post(create_url, json={"knowledge_base_name": kb_name})
    create_data = response.json()

    def cleanup():
        if create_data.get("code") == 200:
            cleanup_data = requests.post(delete_url, json=kb_name).json()
            assert cleanup_data["code"] == 200, cleanup_data

    request.addfinalizer(cleanup)
    assert create_data["code"] == 200
    return kb_name


def test_llm_chat():
    data = {
        "model": llm_model,
        "messages": [
            {"role": "user", "content": "你好"},
            {"role": "assistant", "content": "你好，我是人工智能大模型"},
            {"role": "user", "content": "请用100字左右的文字介绍自己"},
        ],
        "stream": True,
        "temperature": 0.7,
    }

    dump_input(data, "LLM Chat")
    response = requests.post(url, headers=headers, json=data, stream=True)
    dump_output(response, "LLM Chat")
    assert response.status_code == 200


def test_agent_chat():
    tools = list(requests.get(f"{api_base_url}/tools").json()["data"])
    data = {
        "model": llm_model,
        "messages": [
            {"role": "user", "content": "37+48=？"},
        ],
        "stream": True,
        "temperature": 0.7,
        "tools": tools,
    }

    dump_input(data, "Agent Chat")
    response = requests.post(url, headers=headers, json=data, stream=True)
    dump_output(response, "Agent Chat")
    assert response.status_code == 200


def test_kb_chat_auto():
    data = {
        "messages": [
            {"role": "user", "content": "如何提问以获得高质量答案"},
        ],
        "model": llm_model,
        "tool_choice": "search_local_knowledgebase",
        "stream": True,
    }
    dump_input(data, "KB Chat (auto parameters)")
    response = requests.post(url, headers=headers, json=data, stream=True)
    print("\n")
    print("=" * 30 + "KB Chat (auto parameters)" + "  output" + "=" * 30)
    for line in response.iter_content(None, decode_unicode=True):
        if line.startswith("data: "):
            data = json.loads(line[6:])
            pprint(data)
    assert response.status_code == 200


def test_kb_chat_mannual(runtime_kb):
    data = {
        "messages": [
            {"role": "user", "content": "如何提问以获得高质量答案"},
        ],
        "model": llm_model,
        "tool_choice": "search_local_knowledgebase",
        "extra_body": {
            "tool_input": {
                "database": runtime_kb,
                "query": "这个知识库包含什么内容",
            }
        },
        "stream": True,
    }
    dump_input(data, "KB Chat (mannual parameters)")
    response = requests.post(url, headers=headers, json=data, stream=True)
    print("\n")
    print("=" * 30 + "KB Chat (mannual parameters)" + "  output" + "=" * 30)
    for line in response.iter_content(None, decode_unicode=True):
        if line.startswith("data: "):
            data = json.loads(line[6:])
            pprint(data)
    assert response.status_code == 200


def test_search_engine_chat():
    # 旧 /knowledge_base/{mode}/{param}/chat/completions 已删除，联网搜索走 /v1 的 search_engine 开关
    url = f"{api_base_url}/v1/chat/completions"
    data = {
        "messages": [
            {"role": "user", "content": "介绍一下tomechat"},
        ],
        "model": llm_model,
        "search_engine": True,
        "stream": True,
    }
    dump_input(data, "Search Engine Chat")
    response = requests.post(url, headers=headers, json=data, stream=True)
    print("\n")
    print("=" * 30 + "Search Engine Chat" + "  output" + "=" * 30)
    for line in response.iter_content(None, decode_unicode=True):
        if line.startswith("data: "):
            data = json.loads(line[6:])
            pprint(data)
    assert response.status_code == 200
