from collections.abc import Callable, Generator, Iterator
from contextlib import contextmanager
from functools import wraps
from typing import Concatenate, ParamSpec, TypeVar

from sqlalchemy.orm import Session

from tomechat.server.db.base import SessionLocal


@contextmanager
def session_scope() -> Generator[Session]:
    """上下文管理器用于自动获取 Session, 避免错误"""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


_P = ParamSpec("_P")
_R = TypeVar("_R")


def with_session(f: Callable[Concatenate[Session, _P], _R]) -> Callable[_P, _R]:
    @wraps(f)
    def wrapper(*args: _P.args, **kwargs: _P.kwargs) -> _R:
        with session_scope() as session:
            try:
                result = f(session, *args, **kwargs)
                session.commit()
                return result
            except:
                session.rollback()
                raise

    return wrapper


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db0() -> Session:
    db: Session = SessionLocal()
    return db
