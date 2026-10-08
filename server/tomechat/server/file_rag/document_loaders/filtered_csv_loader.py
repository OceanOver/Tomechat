## 指定制定列的csv文件加载器

import csv
from io import TextIOWrapper

from langchain_community.document_loaders import CSVLoader
from langchain_community.document_loaders.helpers import detect_file_encodings
from langchain_core.documents import Document


class FilteredCSVLoader(CSVLoader):
    def __init__(
        self,
        file_path: str,
        columns_to_read: list[str],
        source_column: str | None = None,
        metadata_columns: list[str] | None = None,
        csv_args: dict | None = None,
        encoding: str | None = None,
        autodetect_encoding: bool = False,
    ):
        super().__init__(
            file_path=file_path,
            source_column=source_column,
            metadata_columns=metadata_columns or [],
            csv_args=csv_args,
            encoding=encoding,
            autodetect_encoding=autodetect_encoding,
        )
        self.columns_to_read = columns_to_read

    def load(self) -> list[Document]:
        """Load data into document objects."""

        docs = []
        try:
            with open(self.file_path, newline="", encoding=self.encoding) as csvfile:
                docs = self.__read_file(csvfile)
        except UnicodeDecodeError as e:
            if self.autodetect_encoding:
                detected_encodings = detect_file_encodings(self.file_path)
                for encoding in detected_encodings:
                    try:
                        with open(self.file_path, newline="", encoding=encoding.encoding) as csvfile:
                            docs = self.__read_file(csvfile)
                            break
                    except UnicodeDecodeError:
                        continue
            else:
                raise RuntimeError(f"Error loading {self.file_path}") from e
        except Exception as e:
            raise RuntimeError(f"Error loading {self.file_path}") from e

        return docs

    def __read_file(self, csvfile: TextIOWrapper) -> list[Document]:
        docs = []
        csv_reader = csv.DictReader(csvfile, **self.csv_args)  # type: ignore
        for i, row in enumerate(csv_reader):
            content = []
            for col in self.columns_to_read:
                if col in row:
                    content.append(f"{col}:{row[col]!s}")
                else:
                    raise ValueError(f"Column '{self.columns_to_read[0]}' not found in CSV file.")
            content = "\n".join(content)
            # Extract the source if available
            source = row.get(self.source_column, None) if self.source_column is not None else self.file_path
            metadata = {"source": source, "row": i}

            for col in self.metadata_columns:
                if col in row:
                    metadata[col] = row[col]

            doc = Document(page_content=content, metadata=metadata)
            docs.append(doc)

        return docs
