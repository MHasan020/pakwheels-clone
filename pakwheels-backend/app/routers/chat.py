import os
import time
from typing import List

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user
from app.models.models import User

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

router = APIRouter(prefix="/chat", tags=["Chat"])

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
MAX_HISTORY = 10
MAX_CHARS = 1000
MAX_ATTEMPTS = 2
REQUEST_TIMEOUT = 60
UNAVAILABLE_MESSAGE = "The chatbot is unavailable right now. Please try again."
TIMEOUT_MESSAGE = "The chatbot is taking too long to answer. Please try again in a minute."

SYSTEM_PROMPT = """You are the PakWheels Assistant, a friendly helper on PakWheels, a car marketplace website in Pakistan where people buy and sell used and new cars.

How the website works:
- Anyone can browse approved ads on the home page and use search and filters (brand, city, price).
- Buyers can register, save favorites and message sellers. Buyers cannot post ads.
- Sellers can post ads with photos, edit them, add or delete photos, and see them under My Ads.
- Every new ad is reviewed by an admin first. It stays pending until approved, and it appears on the home page only after approval. Rejected or removed ads do not appear.
- If someone forgot their password, they can use the Forgot password link on the Login page.

Rules:
- Reply in the same language and style the user writes in (English, Urdu or Roman Urdu).
- Write plain text only. Do not use markdown symbols such as asterisks, hashes or backticks. For steps, write 1., 2., 3. on separate lines.
- Keep answers short and clear.
- Only help with PakWheels and topics about buying, selling, owning or maintaining cars. If asked about anything else, politely say you can only help with car and PakWheels questions.
- You may give general car buying and selling advice (what to check in a used car, paperwork, test drives, fair pricing tips). Say clearly when something is only general advice.
- You cannot see or change anyone's account, ads, messages or payments, and you cannot search the listings. Never invent car listings, prices or seller details. If a question needs a person, tell the user to contact the website admin.
- Do not give legal or financial guarantees. For transfer or legal paperwork, suggest checking with the relevant authority or a professional."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/")
def chat(data: ChatRequest, current_user: User = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="The chatbot is not set up yet.")

    messages = [
        {"role": m.role, "content": m.content[:MAX_CHARS]}
        for m in data.messages[-MAX_HISTORY:]
        if m.role in ("user", "assistant") and m.content.strip()
    ]
    while messages and messages[0]["role"] != "user":
        messages.pop(0)
    if not messages or messages[-1]["role"] != "user":
        raise HTTPException(status_code=400, detail="Please type a message.")

    # Gemini mein assistant ko "model" kehte hain
    contents = [
        {
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}],
        }
        for m in messages
    ]

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 1000},
    }

    response = None
    for attempt in range(MAX_ATTEMPTS):
        try:
            response = requests.post(
                API_URL,
                headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
                json=payload,
                timeout=REQUEST_TIMEOUT,
            )
        except requests.Timeout:
            print(f"Gemini timeout (attempt {attempt + 1} of {MAX_ATTEMPTS})")
            if attempt < MAX_ATTEMPTS - 1:
                continue
            raise HTTPException(status_code=504, detail=TIMEOUT_MESSAGE)
        except requests.RequestException as e:
            print("Gemini request error:", e)
            raise HTTPException(status_code=502, detail=UNAVAILABLE_MESSAGE)

        # Google busy ho (429, 500, 503) to thodi der ruk kar dobara koshish karo
        if response.status_code in (429, 500, 503) and attempt < MAX_ATTEMPTS - 1:
            print(f"Gemini busy ({response.status_code}), retrying...")
            time.sleep(2 * (attempt + 1))
            continue
        break

    if response.status_code != 200:
        # Asli wajah sirf terminal mein dikhegi, user ko aam message milega
        print("Gemini API error:", response.status_code, response.text)
        raise HTTPException(status_code=502, detail=UNAVAILABLE_MESSAGE)

    reply = ""
    try:
        parts = response.json()["candidates"][0]["content"]["parts"]
        reply = "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError, TypeError, ValueError):
        print("Gemini unexpected response:", response.text)

    if not reply:
        reply = "Sorry, I could not answer that. Please try asking in a different way."
    return {"reply": reply}