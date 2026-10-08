import json
import sys
from pathlib import Path
from uuid import uuid4

import pytest
import requests

sys.path.append(str(Path(__file__).parent.parent.parent))
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pprint import pprint

from tomechat.server.model_factory import get_default_llm
from tomechat.server.utils import api_address

api_base_url = api_address()
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


@pytest.fixture
def runtime_kb(request):
    kb_name = f"kb_stream_thread_{uuid4().hex}"
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


def llm_chat():
    url = f"{api_base_url}/v1/chat/completions"
    data = {
        "model": llm_model,
        "messages": [
            {"role": "user", "content": "你好"},
            {"role": "assistant", "content": "你好，我是人工智能大模型"},
            {"role": "user", "content": "请用100字左右的文字介绍自己"},
        ],
        "stream": False,
        "temperature": 0.7,
    }

    dump_input(data, "LLM Chat")
    response = requests.post(url, headers=headers, json=data, stream=True)
    dump_output(response, "LLM Chat")
    assert response.status_code == 200


def kb_chat_mannual(kb_name):
    url = f"{api_base_url}/v1/chat/completions"
    data = {
        "messages": [
            {"role": "user", "content": "如何提问以获得高质量答案"},
        ],
        "model": llm_model,
        "tool_choice": "search_local_knowledgebase",
        "extra_body": {
            "tool_input": {
                "database": kb_name,
                "query": "这个知识库包含什么内容",
            }
        },
        "stream": False,
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


def test_thread(runtime_kb):
    for func in [llm_chat, lambda: kb_chat_mannual(runtime_kb)]:
        threads = []
        times = []
        start = time.time()
        with ThreadPoolExecutor() as pool:
            for _ in range(10):
                threads.append(pool.submit(func))

            for result in as_completed(threads):
                end = time.time()
                times.append(end - start)
                print("\nResult:\n")
                pprint(result.result())

        print("\nTime used:\n")
        for elapsed in times:
            print(f"{elapsed}")
