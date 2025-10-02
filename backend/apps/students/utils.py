import re
import unicodedata
from typing import Optional

from django.conf import settings


def slugify_given_name(name: str) -> str:
    """
    Convert a Vietnamese given name (Tên) to a lowercase ASCII slug without spaces.
    - Keep only a-z characters
    - Remove accents and special characters
    - Convert đ/Đ to d
    """
    if not name:
        return ""
    s = str(name).strip()
    # Normalize accents
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.lower()
    # Keep only letters a-z
    s = re.sub(r"[^a-z]+", "", s)
    return s


def build_student_email(given_name: str, student_id: str, domain: Optional[str] = None) -> str:
    """
    Build email in the format: {lowercase_given_name}{MSSV}@{domain}
    - Only the given name is lowercased and normalized (no accents)
    - MSSV is appended as-is (to match your requirement)
    - Domain defaults to settings.STUDENT_EMAIL_DOMAIN
    """
    dom = (domain or getattr(settings, "STUDENT_EMAIL_DOMAIN", "student.nctu.edu.vn")).strip().lower()
    slug = slugify_given_name(given_name) or "sv"
    sid = (student_id or "").strip()
    return f"{slug}{sid}@{dom}"
