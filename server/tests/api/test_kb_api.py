import json
import sys
from contextlib import ExitStack
from pathlib import Path
from uuid import uuid4

import pytest
import requests

root_path = Path(__file__).parent.parent.parent
sys.path.append(str(root_path))
from pprint import pprint

from tomechat.server.utils import api_address
from tomechat.settings import Settings

api_base_url = api_address()


kb = ""
test_files = {
    "minimal.txt": str(root_path / "tests" / "fixtures" / "knowledge_base" / "minimal.txt"),
}

print("\n\n直接url访问\n")


@pytest.fixture(scope="module", autouse=True)
def runtime_kb(request):
    global kb
    kb = f"kb_api_{uuid4().hex}"
    create_url = api_base_url + "/knowledge_base/create_knowledge_base"
    delete_url = api_base_url + "/knowledge_base/delete_knowledge_base"
    response = requests.post(create_url, json={"knowledge_base_name": kb})
    create_data = response.json()

    def cleanup():
        if create_data.get("code") == 200:
            cleanup_data = requests.post(delete_url, json=kb).json()
            assert cleanup_data["code"] == 200, cleanup_data

    request.addfinalizer(cleanup)
    assert create_data["code"] == 200
    return kb


def test_runtime_kb_exists(runtime_kb):
    url = api_base_url + "/knowledge_base/list_knowledge_bases"
    r = requests.get(url)
    data = r.json()
    assert data["code"] == 200
    assert runtime_kb in data["data"]


def test_create_kb_rejects_empty_and_duplicate_names(runtime_kb, api="/knowledge_base/create_knowledge_base"):
    url = api_base_url + api

    print("\n尝试用空名称创建知识库：")
    r = requests.post(url, json={"knowledge_base_name": " "})
    data = r.json()
    pprint(data)
    assert data["code"] == 404
    assert data["msg"] == "知识库名称不能为空，请重新填写知识库名称"

    print(f"\n尝试创建同名知识库： {runtime_kb}")
    r = requests.post(url, json={"knowledge_base_name": runtime_kb})
    data = r.json()
    pprint(data)
    assert data["code"] == 404
    assert data["msg"] == f"已存在同名知识库 {runtime_kb}"


def test_list_kbs(api="/knowledge_base/list_knowledge_bases"):
    url = api_base_url + api
    print("\n获取知识库列表：")
    r = requests.get(url)
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert isinstance(data["data"], list) and len(data["data"]) > 0
    assert kb in data["data"]


def test_upload_docs(api="/knowledge_base/upload_docs"):
    url = api_base_url + api

    print("\n上传知识文件")
    data = {"knowledge_base_name": kb, "override": True}
    with ExitStack() as stack:
        files = [("files", (name, stack.enter_context(Path(path).open("rb")))) for name, path in test_files.items()]
        r = requests.post(url, data=data, files=files)
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert len(data["data"]["failed_files"]) == 0

    print("\n尝试重新上传知识文件， 不覆盖")
    data = {"knowledge_base_name": kb, "override": False}
    with ExitStack() as stack:
        files = [("files", (name, stack.enter_context(Path(path).open("rb")))) for name, path in test_files.items()]
        r = requests.post(url, data=data, files=files)
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert len(data["data"]["failed_files"]) == len(test_files)

    print("\n尝试重新上传知识文件， 覆盖，自定义docs")
    docs = {
        "minimal.txt": [
            {
                "page_content": "Tomechat provides local knowledge-base retrieval.",
                "metadata": {},
            }
        ]
    }
    data = {"knowledge_base_name": kb, "override": True, "docs": json.dumps(docs)}
    with ExitStack() as stack:
        files = [("files", (name, stack.enter_context(Path(path).open("rb")))) for name, path in test_files.items()]
        r = requests.post(url, data=data, files=files)
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert len(data["data"]["failed_files"]) == 0


def test_list_files(api="/knowledge_base/list_files"):
    url = api_base_url + api
    print("\n获取知识库中文件列表：")
    r = requests.get(url, params={"knowledge_base_name": kb})
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert isinstance(data["data"], list)
    for name in test_files:
        assert name in data["data"]


def test_search_docs(api="/knowledge_base/search_docs"):
    url = api_base_url + api
    query = "介绍一下tomechat项目"
    print("\n检索知识库：")
    print(query)
    r = requests.post(url, json={"knowledge_base_name": kb, "query": query})
    data = r.json()
    pprint(data)
    assert isinstance(data, list) and data
    assert len(data) <= Settings.kb_settings.VECTOR_SEARCH_TOP_K
    assert any("Tomechat" in doc["page_content"] for doc in data)


def test_update_info(api="/knowledge_base/update_info"):
    url = api_base_url + api
    print("\n更新知识库介绍")
    r = requests.post(url, json={"knowledge_base_name": kb, "kb_info": "测试知识库"})
    data = r.json()
    pprint(data)
    assert data["code"] == 200


def test_update_docs(api="/knowledge_base/update_docs"):
    url = api_base_url + api

    print("\n更新知识文件")
    r = requests.post(url, json={"knowledge_base_name": kb, "file_names": list(test_files)})
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert len(data["data"]["failed_files"]) == 0


def test_delete_docs(api="/knowledge_base/delete_docs"):
    url = api_base_url + api

    print("\n删除知识文件")
    r = requests.post(url, json={"knowledge_base_name": kb, "file_names": list(test_files)})
    data = r.json()
    pprint(data)
    assert data["code"] == 200
    assert len(data["data"]["failed_files"]) == 0

    url = api_base_url + "/knowledge_base/search_docs"
    query = "介绍一下tomechat项目"
    print("\n尝试检索删除后的检索知识库：")
    print(query)
    r = requests.post(url, json={"knowledge_base_name": kb, "query": query})
    data = r.json()
    pprint(data)
    assert isinstance(data, list) and len(data) == 0


def test_recreate_vs(api="/knowledge_base/recreate_vector_store"):
    url = api_base_url + api
    print("\n重建知识库：")
    r = requests.post(url, json={"knowledge_base_name": kb}, stream=True)
    for chunk in r.iter_content(None):
        data = json.loads(chunk[6:])
        assert isinstance(data, dict)
        assert data["code"] == 200
        print(data["msg"])

    url = api_base_url + "/knowledge_base/search_docs"
    query = "本项目支持哪些文件格式?"
    print("\n尝试检索重建后的检索知识库：")
    print(query)
    r = requests.post(url, json={"knowledge_base_name": kb, "query": query})
    data = r.json()
    pprint(data)
    assert isinstance(data, list) and data
    assert len(data) <= Settings.kb_settings.VECTOR_SEARCH_TOP_K
    assert any("Tomechat" in doc["page_content"] for doc in data)


def test_runtime_kb_is_left_for_fixture_cleanup(runtime_kb):
    url = api_base_url + "/knowledge_base/list_knowledge_bases"
    r = requests.get(url)
    data = r.json()
    assert data["code"] == 200
    assert runtime_kb in data["data"]
