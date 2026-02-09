"""Seed Bible data into MongoDB from KJV JSON."""
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SECTIONS = [
    {
        "id": "law",
        "name": "Law & Foundations",
        "color": "#00008B",
        "accent": "#FFD700",
        "intro": "The five books of Moses lay the foundation of God's covenant with humanity—creation, fall, promise, and law.",
        "book_abbrevs": ["gn", "ex", "lv", "nm", "dt"]
    },
    {
        "id": "history",
        "name": "History",
        "color": "#8B4513",
        "accent": "#F4A460",
        "intro": "From conquest to exile, these books chronicle Israel's journey through kings, judges, and the faithfulness of God.",
        "book_abbrevs": ["js", "jud", "rt", "1sm", "2sm", "1kgs", "2kgs", "1ch", "2ch", "ezr", "ne", "et"]
    },
    {
        "id": "poetry",
        "name": "Wisdom & Poetry",
        "color": "#228B22",
        "accent": "#EEE8AA",
        "intro": "Songs, proverbs, and reflections on the human condition—where faith meets the beauty of language.",
        "book_abbrevs": ["job", "ps", "prv", "ec", "so"]
    },
    {
        "id": "prophets",
        "name": "Prophets",
        "color": "#4B0082",
        "accent": "#FF4500",
        "intro": "Voices crying in the wilderness—warnings, visions, and the promise of a coming Messiah.",
        "book_abbrevs": ["is", "jr", "lm", "ez", "dn", "ho", "jl", "am", "ob", "jn", "mi", "na", "hk", "zp", "hg", "zc", "ml"]
    },
    {
        "id": "gospels",
        "name": "Gospels",
        "color": "#DC143C",
        "accent": "#FFFFFF",
        "intro": "Four accounts of the life, death, and resurrection of Jesus Christ—the heart of the Christian faith.",
        "book_abbrevs": ["mt", "mk", "lk", "jo"]
    },
    {
        "id": "acts",
        "name": "Early Church",
        "color": "#87CEEB",
        "accent": "#FFD700",
        "intro": "The birth of the Church and the spread of the Gospel through the power of the Holy Spirit.",
        "book_abbrevs": ["act"]
    },
    {
        "id": "epistles",
        "name": "Letters",
        "color": "#008080",
        "accent": "#FFFFFF",
        "intro": "Apostolic letters to early churches—theology, encouragement, and practical guidance for Christian living.",
        "book_abbrevs": ["rm", "1co", "2co", "gl", "eph", "ph", "cl", "1ts", "2ts", "1tm", "2tm", "tt", "phm", "hb", "jm", "1pe", "2pe", "1jo", "2jo", "3jo", "jd"]
    },
    {
        "id": "revelation",
        "name": "Revelation",
        "color": "#301934",
        "accent": "#FF0000",
        "intro": "A prophetic vision of the end times—cosmic battles, divine judgment, and the ultimate triumph of God.",
        "book_abbrevs": ["re"]
    }
]

async def seed():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]

    # Check if already seeded
    count = await db.books.count_documents({})
    if count >= 66:
        print("Bible data already seeded. Skipping.")
        client.close()
        return

    print("Seeding Bible data...")

    # Load Bible JSON
    bible_path = ROOT_DIR / 'bible_kjv.json'
    with open(bible_path, encoding='utf-8-sig') as f:
        bible_data = json.load(f)

    # Build abbrev-to-section mapping
    abbrev_to_section = {}
    for section in SECTIONS:
        for abbrev in section["book_abbrevs"]:
            abbrev_to_section[abbrev] = section["id"]

    # Clear existing data
    await db.sections.delete_many({})
    await db.books.delete_many({})
    await db.chapters.delete_many({})

    # Insert sections
    section_docs = []
    for s in SECTIONS:
        section_docs.append({
            "id": s["id"],
            "name": s["name"],
            "color": s["color"],
            "accent": s["accent"],
            "intro": s["intro"],
            "book_count": len(s["book_abbrevs"])
        })
    await db.sections.insert_many(section_docs)
    print(f"Inserted {len(section_docs)} sections")

    # Insert books and chapters
    book_docs = []
    chapter_docs = []
    for idx, book in enumerate(bible_data):
        abbrev = book["abbrev"]
        section_id = abbrev_to_section.get(abbrev, "unknown")
        book_docs.append({
            "abbrev": abbrev,
            "name": book["name"],
            "section_id": section_id,
            "chapter_count": len(book["chapters"]),
            "order": idx
        })
        for ch_idx, chapter_verses in enumerate(book["chapters"]):
            verses = []
            for v_idx, text in enumerate(chapter_verses):
                verses.append({
                    "number": v_idx + 1,
                    "text": text
                })
            chapter_docs.append({
                "book_abbrev": abbrev,
                "book_name": book["name"],
                "chapter_number": ch_idx + 1,
                "section_id": section_id,
                "verses": verses
            })

    await db.books.insert_many(book_docs)
    print(f"Inserted {len(book_docs)} books")

    # Insert chapters in batches
    batch_size = 100
    for i in range(0, len(chapter_docs), batch_size):
        batch = chapter_docs[i:i+batch_size]
        await db.chapters.insert_many(batch)
    print(f"Inserted {len(chapter_docs)} chapters")

    # Create indexes
    await db.books.create_index("abbrev")
    await db.books.create_index("section_id")
    await db.chapters.create_index([("book_abbrev", 1), ("chapter_number", 1)])
    await db.sections.create_index("id")
    print("Created indexes")

    client.close()
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
