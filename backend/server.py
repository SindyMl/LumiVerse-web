from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]
# This app intentionally has no login. All personal data is isolated to one server-side owner.
SINGLE_USER_ID = os.environ.get('SINGLE_USER_ID', 'lumiverse-owner')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Models ---
class Section(BaseModel):
    id: str
    name: str
    color: str
    accent: str
    intro: str
    book_count: int

class Book(BaseModel):
    abbrev: str
    name: str
    section_id: str
    chapter_count: int
    order: int

class Verse(BaseModel):
    number: int
    text: str

class Chapter(BaseModel):
    book_abbrev: str
    book_name: str
    chapter_number: int
    section_id: str
    verses: List[Verse]

class DailyVerse(BaseModel):
    book_name: str
    book_abbrev: str
    chapter: int
    verse_number: int
    text: str
    section_id: str

class UserCreate(BaseModel):
    display_name: Optional[str] = Field(default="Anonymous", max_length=80)

    model_config = {"str_strip_whitespace": True}

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    display_name: str = "Anonymous"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PathCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=120)
    description: Optional[str] = Field(default="", max_length=1000)
    items: List[dict] = Field(default_factory=list, max_length=200)

class PathModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str = ""
    items: List[dict] = []
    current_index: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PathUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    items: Optional[List[dict]] = Field(default=None, max_length=200)
    current_index: Optional[int] = Field(default=None, ge=0, le=200)

class NoteCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    book_abbrev: str = Field(min_length=1, max_length=20)
    chapter_number: int = Field(ge=1, le=200)
    verse_number: int = Field(ge=1, le=200)
    text: str = Field(min_length=1, max_length=10000)
    tags: List[str] = Field(default_factory=list, max_length=20)

class NoteModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_abbrev: str
    book_name: str = ""
    chapter_number: int
    verse_number: int
    text: str
    tags: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class NoteUpdate(BaseModel):
    text: Optional[str] = Field(default=None, min_length=1, max_length=10000)
    tags: Optional[List[str]] = Field(default=None, max_length=20)

class HighlightCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    book_abbrev: str = Field(min_length=1, max_length=20)
    chapter_number: int = Field(ge=1, le=200)
    verse_number: int = Field(ge=1, le=200)
    color: str = Field(default="#FFD700", pattern=r"^#[0-9A-Fa-f]{6}$")

class HighlightModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_abbrev: str
    book_name: str = ""
    chapter_number: int
    verse_number: int
    color: str = "#FFD700"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# --- Bible Endpoints ---
@api_router.get("/")
async def root():
    return {"message": "LumiVerse API"}

@api_router.get("/sections", response_model=List[Section])
async def get_sections():
    sections = await db.sections.find({}, {"_id": 0}).to_list(100)
    return sections

@api_router.get("/books", response_model=List[Book])
async def get_books(section_id: Optional[str] = None):
    query = {}
    if section_id:
        query["section_id"] = section_id
    books = await db.books.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return books

@api_router.get("/books/{abbrev}", response_model=Book)
async def get_book(abbrev: str):
    book = await db.books.find_one({"abbrev": abbrev}, {"_id": 0})
    if not book:
        raise HTTPException(404, "Book not found")
    return book

@api_router.get("/chapters/{book_abbrev}/{chapter_number}", response_model=Chapter)
async def get_chapter(book_abbrev: str, chapter_number: int):
    chapter = await db.chapters.find_one(
        {"book_abbrev": book_abbrev, "chapter_number": chapter_number},
        {"_id": 0}
    )
    if not chapter:
        raise HTTPException(404, "Chapter not found")
    return chapter

@api_router.get("/verse/daily", response_model=DailyVerse)
async def get_daily_verse():
    total = await db.chapters.count_documents({})
    skip = random.randint(0, max(0, total - 1))
    chapter = await db.chapters.find({}, {"_id": 0}).skip(skip).limit(1).to_list(1)
    if not chapter:
        raise HTTPException(404, "No verses found")
    ch = chapter[0]
    verse_idx = random.randint(0, len(ch["verses"]) - 1)
    verse = ch["verses"][verse_idx]
    return DailyVerse(
        book_name=ch["book_name"],
        book_abbrev=ch["book_abbrev"],
        chapter=ch["chapter_number"],
        verse_number=verse["number"],
        text=verse["text"],
        section_id=ch["section_id"]
    )

@api_router.get("/search")
async def search_bible(q: str = Query(min_length=2, max_length=100), limit: int = Query(default=20, ge=1, le=50)):
    safe_query = re.escape(q.strip())
    if not safe_query:
        raise HTTPException(400, "Search query is required")
    pipeline = [
        {"$unwind": "$verses"},
        {"$match": {"verses.text": {"$regex": safe_query, "$options": "i"}}},
        {"$limit": limit},
        {"$project": {
            "_id": 0,
            "book_name": 1,
            "book_abbrev": 1,
            "chapter_number": 1,
            "section_id": 1,
            "verse_number": "$verses.number",
            "text": "$verses.text"
        }}
    ]
    results = await db.chapters.aggregate(pipeline).to_list(limit)
    return results

# --- Auth Endpoints ---
@api_router.post("/auth/anonymous", response_model=User)
async def create_anonymous_user(input_data: UserCreate = None):
    existing = await db.users.find_one({"id": SINGLE_USER_ID}, {"_id": 0})
    if existing:
        return User(**existing)
    user = User(id=SINGLE_USER_ID, display_name=input_data.display_name if input_data else "Anonymous")
    await db.users.insert_one(user.model_dump())
    return user

# --- Path Endpoints ---
@api_router.get("/paths")
async def get_paths(user_id: str):
    paths = await db.paths.find({"user_id": SINGLE_USER_ID}, {"_id": 0}).to_list(100)
    return paths

@api_router.post("/paths", response_model=PathModel)
async def create_path(data: PathCreate):
    path = PathModel(**data.model_dump(exclude={"user_id"}), user_id=SINGLE_USER_ID)
    path_dict = path.model_dump()
    await db.paths.insert_one({**path_dict})
    return path

@api_router.put("/paths/{path_id}")
async def update_path(path_id: str, data: PathUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.paths.update_one({"id": path_id, "user_id": SINGLE_USER_ID}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Path not found")
    updated = await db.paths.find_one({"id": path_id}, {"_id": 0})
    return updated

@api_router.delete("/paths/{path_id}")
async def delete_path(path_id: str):
    result = await db.paths.delete_one({"id": path_id, "user_id": SINGLE_USER_ID})
    if result.deleted_count == 0:
        raise HTTPException(404, "Path not found")
    return {"status": "deleted"}

# --- Note Endpoints ---
@api_router.get("/notes")
async def get_notes(user_id: str):
    notes = await db.notes.find({"user_id": SINGLE_USER_ID}, {"_id": 0}).to_list(500)
    return notes

@api_router.post("/notes", response_model=NoteModel)
async def create_note(data: NoteCreate):
    book = await db.books.find_one({"abbrev": data.book_abbrev}, {"_id": 0})
    note = NoteModel(**data.model_dump(exclude={"user_id"}), user_id=SINGLE_USER_ID, book_name=book["name"] if book else "")
    note_dict = note.model_dump()
    await db.notes.insert_one({**note_dict})
    return note

@api_router.put("/notes/{note_id}")
async def update_note(note_id: str, data: NoteUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.notes.update_one({"id": note_id, "user_id": SINGLE_USER_ID}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Note not found")
    updated = await db.notes.find_one({"id": note_id}, {"_id": 0})
    return updated

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    result = await db.notes.delete_one({"id": note_id, "user_id": SINGLE_USER_ID})
    if result.deleted_count == 0:
        raise HTTPException(404, "Note not found")
    return {"status": "deleted"}

# --- Highlight Endpoints ---
@api_router.get("/highlights")
async def get_highlights(user_id: str):
    highlights = await db.highlights.find({"user_id": SINGLE_USER_ID}, {"_id": 0}).to_list(1000)
    return highlights

@api_router.post("/highlights", response_model=HighlightModel)
async def create_highlight(data: HighlightCreate):
    existing = await db.highlights.find_one({
        "user_id": SINGLE_USER_ID,
        "book_abbrev": data.book_abbrev,
        "chapter_number": data.chapter_number,
        "verse_number": data.verse_number
    })
    if existing:
        await db.highlights.update_one(
            {"id": existing["id"]},
            {"$set": {"color": data.color, "created_at": datetime.now(timezone.utc).isoformat()}}
        )
        updated = await db.highlights.find_one({"id": existing["id"]}, {"_id": 0})
        return HighlightModel(**updated)
    book = await db.books.find_one({"abbrev": data.book_abbrev}, {"_id": 0})
    highlight = HighlightModel(**data.model_dump(exclude={"user_id"}), user_id=SINGLE_USER_ID, book_name=book["name"] if book else "")
    h_dict = highlight.model_dump()
    await db.highlights.insert_one({**h_dict})
    return highlight

@api_router.delete("/highlights/{highlight_id}")
async def delete_highlight(highlight_id: str):
    result = await db.highlights.delete_one({"id": highlight_id, "user_id": SINGLE_USER_ID})
    if result.deleted_count == 0:
        raise HTTPException(404, "Highlight not found")
    return {"status": "deleted"}

# Include router
app.include_router(api_router)

allowed_origins = [origin.strip() for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:8081,http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
