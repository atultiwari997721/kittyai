import os
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from sidecar.python.config import settings

logger = logging.getLogger("kittyai.memory")

MEMORY_FILE_PATH = Path(__file__).resolve().parent.parent / "memory_store.json"

class PersonalMemoryEngine:
    def __init__(self):
        self.memory_store: Dict[str, Dict[str, Any]] = {}
        self._load_local_store()

    def _load_local_store(self):
        if MEMORY_FILE_PATH.exists():
            try:
                data = json.loads(MEMORY_FILE_PATH.read_text(encoding="utf-8"))
                self.memory_store = data
                logger.info(f"Loaded {len(self.memory_store)} personal memory records from disk.")
            except Exception as e:
                logger.warning(f"Could not load memory file: {e}")
                self.memory_store = {}
        else:
            # Seed with common sensible default structures
            self.memory_store = {}
            self._save_local_store()

    def _save_local_store(self):
        try:
            MEMORY_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            MEMORY_FILE_PATH.write_text(
                json.dumps(self.memory_store, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )
        except Exception as e:
            logger.error(f"Failed to persist memory store: {e}")

    def set_memory(
        self,
        key: str,
        value: Any,
        category: str = "entity",
        description: str = "",
        source: str = "user_chat"
    ) -> Dict[str, Any]:
        """
        Stores or updates a memory record.
        Examples:
          key: "team"
          value: {"members": ["Alice", "Bob"], "emails": ["alice@company.com", "bob@company.com"], "whatsapp": ["+1234567890"]}
          category: "entity"
        """
        normalized_key = key.lower().strip()
        record = {
            "key": normalized_key,
            "displayKey": key.strip(),
            "value": value,
            "category": category, # entity, contact, preference, project, rule
            "description": description or f"Personal record for '{key}'",
            "source": source,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "createdAt": self.memory_store.get(normalized_key, {}).get("createdAt", datetime.now(timezone.utc).isoformat())
        }
        self.memory_store[normalized_key] = record
        self._save_local_store()
        logger.info(f"Learned personal memory: '{normalized_key}' -> {value}")
        return record

    def get_memory(self, key: str) -> Optional[Dict[str, Any]]:
        normalized_key = key.lower().strip()
        return self.memory_store.get(normalized_key)

    def resolve_entity(self, entity_name: str) -> Optional[Any]:
        """Looks up an entity in memory and returns its structured value."""
        norm = entity_name.lower().strip()
        if norm in self.memory_store:
            return self.memory_store[norm].get("value")
        
        # Check partial matching (e.g. 'the team' -> 'team')
        for k, v in self.memory_store.items():
            if k in norm or norm in k:
                return v.get("value")
        return None

    def delete_memory(self, key: str) -> bool:
        normalized_key = key.lower().strip()
        if normalized_key in self.memory_store:
            del self.memory_store[normalized_key]
            self._save_local_store()
            logger.info(f"Deleted personal memory: '{normalized_key}'")
            return True
        return False

    def get_all_memories(self) -> List[Dict[str, Any]]:
        return list(self.memory_store.values())

    def search_memories(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower().strip()
        results = []
        for k, v in self.memory_store.items():
            val_str = json.dumps(v.get("value", "")).lower()
            desc = v.get("description", "").lower()
            if q in k or q in val_str or q in desc:
                results.append(v)
        return results

    def get_relevant_context(self, prompt: str) -> str:
        """
        Scans prompt and finds all matching entities or preferences in memory,
        formatting them as concise context for the LLM prompt.
        """
        prompt_lower = prompt.lower()
        matched = []

        for k, record in self.memory_store.items():
            # Check if key or word boundary is in prompt
            pattern = r'\b' + re.escape(k) + r'\b'
            if re.search(pattern, prompt_lower) or k in prompt_lower:
                val = record.get("value")
                matched.append(f"- {record.get('displayKey', k)} ({record.get('category')}): {json.dumps(val)}")

        if not matched:
            return ""

        return "\n--- KNOWN USER PERSONAL RECORDS & MEMORY ---\n" + "\n".join(matched) + "\n---------------------------------------------\n"

    def extract_from_clarification(self, entity_name: str, user_response: str) -> Dict[str, Any]:
        """
        Extracts emails, phone numbers, and names from user's clarification answer.
        E.g. "team is alice@xyz.com and bob@xyz.com phone +123456789"
        """
        # Find all emails
        emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', user_response)
        
        # Find potential phone numbers
        phones = re.findall(r'\+?[0-9]{1,3}?[-. ]?\(?[0-9]{2,4}?\)?[-. ]?[0-9]{3,4}[-. ]?[0-9]{3,4}', user_response)
        phones = [p.strip() for p in phones if len(re.sub(r'\D', '', p)) >= 8]

        extracted = {
            "rawText": user_response.strip(),
            "emails": emails,
            "phones": phones,
            "members": []
        }

        # Attempt to extract names if formatted as Name (email) or Name: email
        name_matches = re.findall(r'([A-Z][a-zA-Z]+)(?:\s*[:\(]\s*([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-.]+))?', user_response)
        members = []
        for m in name_matches:
            name = m[0]
            if name.lower() not in ["email", "emails", "whatsapp", "phone", "team", "meet", "send", "at", "and"]:
                members.append(name)
        extracted["members"] = members

        return extracted

personal_memory = PersonalMemoryEngine()
