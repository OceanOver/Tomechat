from pathlib import Path

import pytest
import tomllib
from click.testing import CliRunner

from tomechat.startup import main as startup_main

SERVER_ROOT = Path(__file__).parents[2]
REPOSITORY_ROOT = SERVER_ROOT.parents[1]


def test_api_client_is_removed():
    assert not (SERVER_ROOT / "tomechat" / "server" / "api_client.py").exists()


def test_streamlit_runtime_files_are_removed():
    assert not (SERVER_ROOT / "tomechat" / "webui.py").exists()
    assert not (SERVER_ROOT / "tomechat" / "webui_pages").exists()


def test_start_help_only_exposes_explicit_api_mode():
    result = CliRunner().invoke(startup_main, ["--help"])

    assert result.exit_code == 0
    assert "--api" in result.output
    assert "--webui" not in result.output
    assert "--all" not in result.output


@pytest.mark.parametrize("legacy_option", ["--webui", "--all", "-w", "-a"])
def test_start_rejects_legacy_webui_options(legacy_option):
    result = CliRunner().invoke(startup_main, [legacy_option])

    assert result.exit_code == 2
    assert "No such option" in result.output


def test_streamlit_settings_are_removed():
    source = (SERVER_ROOT / "tomechat" / "settings.py").read_text(encoding="utf-8")

    assert "WEBUI_SERVER" not in source
    assert "USE_RICH_MARKDOWN" not in source


def test_streamlit_dependencies_are_removed():
    pyproject = (SERVER_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    assert "streamlit" not in pyproject.lower()


def test_rich_is_an_explicit_backend_dependency():
    pyproject = tomllib.loads((SERVER_ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    assert any(dep.startswith("rich") for dep in pyproject["project"]["dependencies"])
