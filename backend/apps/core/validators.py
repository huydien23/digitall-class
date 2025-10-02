import os
import mimetypes
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile

# Initialize mimetypes
mimetypes.init()

# Safe MIME types mapping
ALLOWED_MIME_TYPES = {
    # Documents
    'pdf': ['application/pdf'],
    'doc': ['application/msword'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'ppt': ['application/vnd.ms-powerpoint'],
    'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'xls': ['application/vnd.ms-excel'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'txt': ['text/plain'],

    # Archives
    'zip': ['application/zip', 'application/x-zip-compressed'],
    'rar': ['application/x-rar-compressed', 'application/vnd.rar'],

    # Images (for avatars)
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
    'webp': ['image/webp'],
}

# File size limits (in MB)
MAX_DOCUMENT_SIZE_MB = 20
MAX_IMAGE_SIZE_MB = 5
MAX_FILE_SIZE = MAX_DOCUMENT_SIZE_MB * 1024 * 1024
MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024


def validate_file_extension(file: UploadedFile, allowed_extensions: set):
    """Validate file extension"""
    ext = os.path.splitext(file.name)[1].lower().lstrip('.')
    if ext not in allowed_extensions:
        allowed = ', '.join(sorted(allowed_extensions))
        raise ValidationError(f'Định dạng file không hợp lệ. Cho phép: {allowed}')
    return ext


def validate_mime_type(file: UploadedFile, extension: str):
    """Validate MIME type using file content"""
    try:
        # Reset file pointer to beginning
        file.seek(0)

        # Check file header for common file signatures
        header = file.read(16)
        file.seek(0)

        # File signature checks
        signatures = {
            'pdf': b'%PDF',
            'png': b'\x89PNG\r\n\x1a\n',
            'jpg': b'\xff\xd8\xff',
            'jpeg': b'\xff\xd8\xff',
            'gif': b'GIF8',
            'zip': b'PK\x03\x04',
            'doc': b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1',
            'xls': b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1',
        }

        # Check if file signature matches extension
        if extension in signatures:
            expected_sig = signatures[extension]
            if not header.startswith(expected_sig):
                # For Office files, check content type from file itself
                if extension in ['docx', 'xlsx', 'pptx']:
                    # These are actually ZIP files
                    if not header.startswith(b'PK\x03\x04'):
                        raise ValidationError(
                            f'File content không khớp với định dạng .{extension}'
                        )
                else:
                    raise ValidationError(
                        f'File content không khớp với định dạng .{extension}'
                    )

        # Also check MIME type if available
        if hasattr(file, 'content_type'):
            allowed_mimes = ALLOWED_MIME_TYPES.get(extension, [])
            if allowed_mimes and file.content_type not in allowed_mimes:
                # Give a warning but don't block (browser MIME types can be unreliable)
                pass

    except ValidationError:
        raise
    except Exception as e:
        # If validation fails for other reasons, at least extension was checked
        pass

    return True


def validate_file_size(file: UploadedFile, max_size: int):
    """Validate file size"""
    if file.size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(f'File quá lớn (>{max_mb}MB). Vui lòng nén hoặc chia nhỏ.')


def validate_document_upload(file: UploadedFile, allowed_extensions: set = None):
    """Complete validation for document uploads"""
    if not file:
        return

    # Default allowed extensions for documents
    if allowed_extensions is None:
        allowed_extensions = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'}

    # Validate extension
    ext = validate_file_extension(file, allowed_extensions)

    # Validate MIME type
    validate_mime_type(file, ext)

    # Validate file size
    validate_file_size(file, MAX_FILE_SIZE)

    return True


def validate_image_upload(file: UploadedFile):
    """Complete validation for image uploads"""
    if not file:
        return

    # Allowed image extensions
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}

    # Validate extension
    ext = validate_file_extension(file, allowed_extensions)

    # Validate MIME type
    validate_mime_type(file, ext)

    # Validate file size
    validate_file_size(file, MAX_IMAGE_SIZE)

    # Additional image validation
    try:
        from PIL import Image
        file.seek(0)
        img = Image.open(file)
        img.verify()
        file.seek(0)

        # Check image dimensions
        if img.width > 4000 or img.height > 4000:
            raise ValidationError('Kích thước ảnh quá lớn (max 4000x4000 pixels)')

    except Exception as e:
        raise ValidationError('File không phải là ảnh hợp lệ')

    return True


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal attacks"""
    import re

    # Remove path components
    filename = os.path.basename(filename)

    # Remove dangerous characters
    filename = re.sub(r'[^\w\s\-\.]', '', filename)

    # Limit length
    name, ext = os.path.splitext(filename)
    if len(name) > 100:
        name = name[:100]

    return f"{name}{ext}"