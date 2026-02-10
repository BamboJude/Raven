"""
Export API endpoints.
Handles exporting conversation data in various formats.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
import csv
import io
import json

from app.services.database import db

router = APIRouter()


@router.get("/{business_id}/conversations")
async def export_conversations(
    business_id: str,
    format: str = "csv",
    conversation_id: str = None
):
    """
    Export conversations for a business.
    Supports CSV and JSON formats.
    Can export all conversations or a specific one.
    """
    # Verify business exists
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Get conversations
    if conversation_id:
        conversations = [db.get_conversation(conversation_id)]
        if not conversations[0]:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversations = db.get_business_conversations(business_id)

    # Prepare export data
    export_data = []
    for conv in conversations:
        messages = db.get_conversation_messages(conv["id"])
        for msg in messages:
            export_data.append({
                "conversation_id": conv["id"],
                "channel": conv.get("channel", "widget"),
                "visitor_id": conv.get("visitor_id", ""),
                "started_at": conv.get("started_at", ""),
                "message_role": msg.get("role", ""),
                "message_content": msg.get("content", ""),
                "message_timestamp": msg.get("created_at", ""),
            })

    if format == "json":
        # Return JSON
        return {
            "business_id": business_id,
            "business_name": business["name"],
            "exported_at": datetime.utcnow().isoformat(),
            "total_messages": len(export_data),
            "data": export_data
        }

    elif format == "csv":
        # Generate CSV
        output = io.StringIO()
        if export_data:
            writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
        else:
            writer = csv.writer(output)
            writer.writerow(["No conversations found"])

        output.seek(0)

        filename = f"raven_export_{business['name']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'csv' or 'json'")


@router.get("/{business_id}/summary")
async def export_summary(business_id: str):
    """
    Export a summary report for a business.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    conversations = db.get_business_conversations(business_id)

    # Calculate stats
    total_conversations = len(conversations)
    total_messages = 0
    widget_count = 0
    whatsapp_count = 0

    for conv in conversations:
        messages = db.get_conversation_messages(conv["id"])
        total_messages += len(messages)
        if conv.get("channel") == "whatsapp":
            whatsapp_count += 1
        else:
            widget_count += 1

    return {
        "business_id": business_id,
        "business_name": business["name"],
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "avg_messages_per_conversation": round(total_messages / total_conversations, 1) if total_conversations > 0 else 0,
            "channels": {
                "widget": widget_count,
                "whatsapp": whatsapp_count
            }
        }
    }
