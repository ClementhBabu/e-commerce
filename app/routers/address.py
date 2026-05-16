from fastapi import APIRouter, Request, HTTPException
from app.database import get_connection
from app.schemas import AddressCreate, AddressUpdate
import urllib.request
import json
import asyncio

router = APIRouter()


@router.get("")
async def get_addresses(request: Request):
    conn = get_connection()
    addresses = conn.execute(
        "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
        (request.state.user_id,)
    ).fetchall()
    conn.close()
    return {"addresses": [dict(a) for a in addresses]}


@router.get("/default")
async def get_default_address(request: Request):
    conn = get_connection()
    address = conn.execute(
        "SELECT * FROM addresses WHERE user_id = ? AND is_default = 1 LIMIT 1",
        (request.state.user_id,)
    ).fetchone()
    if not address:
        address = conn.execute(
            "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (request.state.user_id,)
        ).fetchone()
    conn.close()
    return {"address": dict(address) if address else None}


@router.post("")
async def create_address(request: Request, data: AddressCreate):
    conn = get_connection()

    if data.is_default:
        conn.execute("UPDATE addresses SET is_default = 0 WHERE user_id = ?", (request.state.user_id,))

    cursor = conn.execute(
        """INSERT INTO addresses (user_id, full_name, phone, street_address, city, state, pincode, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (request.state.user_id, data.full_name, data.phone, data.street_address,
         data.city, data.state, data.pincode, 1 if data.is_default else 0)
    )
    conn.commit()
    address_id = cursor.lastrowid
    conn.close()
    return {"success": True, "address_id": address_id, "message": "Address saved successfully"}


@router.put("/{address_id}")
async def update_address(request: Request, address_id: int, data: AddressUpdate):
    conn = get_connection()

    address = conn.execute(
        "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
        (address_id, request.state.user_id)
    ).fetchone()

    if not address:
        conn.close()
        raise HTTPException(status_code=404, detail="Address not found")

    if data.is_default:
        conn.execute("UPDATE addresses SET is_default = 0 WHERE user_id = ?", (request.state.user_id,))

    fields = []
    values = []
    for field in ["full_name", "phone", "street_address", "city", "state", "pincode"]:
        val = getattr(data, field, None)
        if val is not None:
            fields.append(f"{field} = ?")
            values.append(val)

    fields.append("is_default = ?")
    values.append(1 if data.is_default else 0)
    values.extend([address_id, request.state.user_id])

    conn.execute(
        f"UPDATE addresses SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
        values
    )
    conn.commit()
    conn.close()
    return {"success": True, "message": "Address updated successfully"}


@router.delete("/{address_id}")
async def delete_address(request: Request, address_id: int):
    conn = get_connection()
    conn.execute(
        "DELETE FROM addresses WHERE id = ? AND user_id = ?",
        (address_id, request.state.user_id)
    )
    conn.commit()
    conn.close()
    return {"success": True, "message": "Address deleted successfully"}


@router.post("/geocode")
async def reverse_geocode(request: Request):
    try:
        body = await request.json()
        lat = body.get("lat")
        lng = body.get("lng")

        if not lat or not lng:
            return {"success": False, "message": "Latitude and longitude required"}

        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18&addressdetails=1"

        def fetch():
            req = urllib.request.Request(url, headers={"User-Agent": "ShopHub-ECommerce/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                return json.loads(resp.read().decode())

        data = await asyncio.get_event_loop().run_in_executor(None, fetch)
        addr = data.get("address", {})

        return {
            "success": True,
            "address": {
                "street_address": f"{addr.get('road', '')} {addr.get('house_number', '')}".strip() or addr.get("neighbourhood", ""),
                "city": addr.get("city", addr.get("town", addr.get("village", ""))),
                "state": addr.get("state", ""),
                "pincode": addr.get("postcode", ""),
            }
        }
    except Exception:
        return {"success": False, "message": "Geocoding service unavailable"}
