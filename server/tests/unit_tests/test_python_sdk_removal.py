import subprocess
from pathlib import Path

SERVER_ROOT = Path(__file__).parents[2]
REPOSITORY_ROOT = SERVER_ROOT.parent
SDK_PATH = Path("libs") / ("python" + "-sdk")
SDK_TERMS = (
    "open_" + "tomechat",
    (Path("libs") / ("python" + "-sdk")).as_posix(),
    "python" + "-sdk",
)


def _is_within(path: Path, parent: Path) -> bool:
    return path.parts[: len(parent.parts)] == parent.parts


def test_python_sdk_directory_is_removed():
    assert not (REPOSITORY_ROOT / SDK_PATH).exists()


def test_repository_has_no_python_sdk_references():
    result = subprocess.run(
        ["git", "ls-files", "-co", "--exclude-standard", "-z"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
    )
    offenders = []

    for raw_path in result.stdout.split(b"\0"):
        if not raw_path:
            continue
        relative_path = Path(raw_path.decode())
        if _is_within(relative_path, SDK_PATH):
            continue
        if _is_within(relative_path, Path(".superpowers") / "sdd"):
            continue

        file_path = REPOSITORY_ROOT / relative_path
        if not file_path.is_file():
            continue
        contents = file_path.read_bytes()
        if any(term.encode() in contents for term in SDK_TERMS):
            offenders.append(relative_path.as_posix())

    assert offenders == []
