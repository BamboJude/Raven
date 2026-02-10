"""
File upload API endpoints.
Handles image and file uploads for chat messages.
"""

import os
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | {"application/pdf", "text/plain"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image for chat messages.
    Returns the URL to access the uploaded image.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size: 10MB")

    # Generate unique filename
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    # Save file
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "filename": filename,
        "url": f"/api/uploads/files/{filename}",
        "content_type": file.content_type,
        "size": len(contents),
    }


@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file for chat messages.
    Returns the URL to access the uploaded file.
    """
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_FILE_TYPES)}"
        )

    # Check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size: 10MB")

    # Generate unique filename (preserve original name for display)
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "bin"
    unique_name = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / unique_name

    # Save file
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "filename": unique_name,
        "original_name": file.filename,
        "url": f"/api/uploads/files/{unique_name}",
        "content_type": file.content_type,
        "size": len(contents),
    }


@router.get("/files/{filename}")
async def get_file(filename: str):
    """
    Retrieve an uploaded file.
    """
    # Sanitize filename to prevent directory traversal
    safe_filename = os.path.basename(filename)
    filepath = UPLOAD_DIR / safe_filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(filepath)
