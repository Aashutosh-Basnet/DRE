from __future__ import annotations

from pathlib import Path
from fastapi import HTTPException, status

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None 


TEXT_EXTENSIONS = {".txt"}
PDF_EXTENSIONS = {".pdf"}
DOCX_EXTENSIONS = {".docx"}
HTML_EXTENSIONS = {".html", ".htm"}

def extract_text(path: Path, content_type: str | None = None) -> str:
    """Extract text from supported document types."""

    suffix = path.suffix.lower()
    if suffix in TEXT_EXTENSIONS or (content_type or "").startswith("text/plain"):
        return path.read_text(encoding="utf-8", errors="ignore").strip()

    if suffix in PDF_EXTENSIONS or (content_type or "").endswith("pdf"):
        return _parse_pdf(path)

    if suffix in DOCX_EXTENSIONS or (content_type or "").endswith("msword"):
        return _parse_docx(path)

    if suffix in HTML_EXTENSIONS or (content_type or "").endswith("html"):
        return _parse_html(path)

    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Unsupported file format. Allowed formats: PDF, TXT, DOCX, HTML.",
    )

def _parse_pdf(path: Path) -> str:
    if PdfReader is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PyPDF2 is required to process PDF files. Please install it.",
        )

    reader = PdfReader(str(path))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()

def _parse_docx(path: Path) -> str:
    if DocxDocument is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="python-docx is required to process DOCX files. Please install it.",
        )

    doc = DocxDocument(str(path))
    paragraphs = [para.text for para in doc.paragraphs]
    return "\n".join(paragraphs).strip()

def _parse_html(path: Path) -> str:
    if BeautifulSoup is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="beautifulsoup4 is required to process HTML files. Please install it.",
        )

    content = path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(content, "html.parser")
    return soup.get_text(separator="\n").strip()