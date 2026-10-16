import json
import base64
from typing import Optional
from fastapi import Header

def get_current_user_id(authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extracts authenticated user_id from Supabase Bearer JWT token or X-User-ID header.
    Allows fallback for demo/anonymous users.
    """
    if x_user_id:
        return x_user_id.strip()

    if not authorization:
        return None

    try:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            # Decode JWT payload without external library dependencies
            token_parts = token.split(".")
            if len(token_parts) == 3:
                payload_b64 = token_parts[1]
                # Fix padding
                payload_b64 += "=" * (-len(payload_b64) % 4)
                decoded_bytes = base64.urlsafe_b64decode(payload_b64)
                payload = json.loads(decoded_bytes)
                sub = payload.get("sub") or payload.get("user_id")
                if sub:
                    return str(sub)
            if token and len(token) > 5:
                return token[:36]
    except Exception:
        pass
    return None

