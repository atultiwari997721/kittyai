import json
import logging
import httpx
from typing import List, Dict, Any, Optional, AsyncGenerator
from sidecar.python.config import settings
from sidecar.python.core.models import ModelInfoModel

logger = logging.getLogger("kittyai.orchestrator")

class LLMOrchestrator:
    def __init__(self):
        self.active_provider: str = settings.AI_DEFAULT_PROVIDER
        self.active_model_id: str = settings.DEFAULT_LOCAL_MODEL
        self._cached_models: List[ModelInfoModel] = []

    async def list_available_models(self) -> List[ModelInfoModel]:
        models: List[ModelInfoModel] = []
        
        # 1. Probe Local Ollama
        ollama_online = False
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{settings.OLLAMA_HOST}/api/tags")
                if res.status_code == 200:
                    ollama_online = True
                    data = res.json()
                    for m in data.get("models", []):
                        name = m.get("name", "unknown")
                        models.append(ModelInfoModel(
                            id=f"ollama:{name}",
                            name=f"Ollama - {name}",
                            provider="ollama",
                            isLocal=True,
                            supportsVision="llava" in name or "vision" in name or "qwen2.5" in name,
                            description="Local on-device inference via Ollama (Zero latency, 100% private)"
                        ))
        except Exception as e:
            logger.debug(f"Ollama probe not reachable: {e}")

        # If Ollama is offline or has no models, provide standard Ollama references
        if not ollama_online:
            models.append(ModelInfoModel(
                id="ollama:qwen2.5:latest",
                name="Ollama - Qwen 2.5 (Offline)",
                provider="ollama",
                isLocal=True,
                supportsVision=True,
                description="Ollama daemon is not running on 127.0.0.1:11434. Start Ollama to activate."
            ))

        # 2. Cloud Providers
        # Google Gemini
        models.append(ModelInfoModel(
            id="gemini:gemini-2.0-flash",
            name="Google Gemini 2.0 Flash",
            provider="gemini",
            isLocal=False,
            supportsVision=True,
            description="Ultra-fast cloud multimodal model for screen analysis & reasoning"
        ))
        models.append(ModelInfoModel(
            id="gemini:gemini-1.5-pro",
            name="Google Gemini 1.5 Pro",
            provider="gemini",
            isLocal=False,
            supportsVision=True,
            description="Deep reasoning & complex code refactoring"
        ))

        # Groq (Free / High Speed)
        models.append(ModelInfoModel(
            id="groq:llama-3.3-70b-versatile",
            name="Groq - Llama 3.3 70B Versatile",
            provider="groq",
            isLocal=False,
            supportsVision=False,
            description="Super-fast cloud inference with Llama 3.3"
        ))
        models.append(ModelInfoModel(
            id="groq:deepseek-r1-distill-llama-70b",
            name="Groq - DeepSeek R1 Distill",
            provider="groq",
            isLocal=False,
            supportsVision=False,
            description="Reasoning model running at 300+ tokens/sec on Groq LPUs"
        ))

        # OpenAI
        models.append(ModelInfoModel(
            id="openai:gpt-4o",
            name="OpenAI GPT-4o",
            provider="openai",
            isLocal=False,
            supportsVision=True,
            description="Flagship multimodal model by OpenAI"
        ))
        models.append(ModelInfoModel(
            id="openai:gpt-4o-mini",
            name="OpenAI GPT-4o Mini",
            provider="openai",
            isLocal=False,
            supportsVision=True,
            description="Lightweight and efficient model"
        ))

        # NVIDIA NIM Cloud APIs
        models.append(ModelInfoModel(
            id="nvidia:meta/llama-3.3-70b-instruct",
            name="Nvidia NIM - Llama 3.3 70B",
            provider="nvidia",
            isLocal=False,
            supportsVision=False,
            description="Accelerated inference via Nvidia NIM API"
        ))
        models.append(ModelInfoModel(
            id="nvidia:deepseek-ai/deepseek-r1",
            name="Nvidia NIM - DeepSeek R1",
            provider="nvidia",
            isLocal=False,
            supportsVision=False,
            description="Frontier reasoning running on Nvidia cloud infrastructure"
        ))

        self._cached_models = models
        return models

    async def is_ollama_ready(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{settings.OLLAMA_HOST}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def set_active_model(self, model_id: str, provider: Optional[str] = None):
        self.active_model_id = model_id
        if provider:
            self.active_provider = provider
        elif ":" in model_id:
            self.active_provider = model_id.split(":")[0]
        logger.info(f"Active model switched to: {self.active_model_id} (Provider: {self.active_provider})")

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        image_base64: Optional[str] = None,
        json_mode: bool = False
    ) -> str:
        """
        Executes completion with automatic fallback:
        1. Local Ollama (if active or if ollama is available)
        2. Gemini API
        3. Groq API
        4. OpenAI API
        5. Heuristic fallback
        """
        # Determine provider sequence
        providers_to_try = []
        if self.active_provider == "ollama":
            providers_to_try = ["ollama", "nvidia", "gemini", "groq", "openai"]
        elif self.active_provider == "nvidia":
            providers_to_try = ["nvidia", "ollama", "gemini", "groq", "openai"]
        elif self.active_provider == "gemini":
            providers_to_try = ["gemini", "nvidia", "ollama", "groq", "openai"]
        elif self.active_provider == "groq":
            providers_to_try = ["groq", "nvidia", "gemini", "openai", "ollama"]
        elif self.active_provider == "openai":
            providers_to_try = ["openai", "nvidia", "gemini", "groq", "ollama"]
        else:
            providers_to_try = ["ollama", "nvidia", "gemini", "groq", "openai"]

        last_error = None
        for prov in providers_to_try:
            try:
                if prov == "ollama":
                    if await self.is_ollama_ready():
                        res = await self._generate_ollama(prompt, system_prompt, image_base64, json_mode)
                        if res:
                            return res
                elif prov == "nvidia" and settings.NVIDIA_API_KEY:
                    res = await self._generate_nvidia(prompt, system_prompt, json_mode)
                    if res:
                        return res
                elif prov == "gemini" and settings.GEMINI_API_KEY:
                    res = await self._generate_gemini(prompt, system_prompt, image_base64, json_mode)
                    if res:
                        return res
                elif prov == "groq" and settings.GROQ_API_KEY:
                    res = await self._generate_groq(prompt, system_prompt, json_mode)
                    if res:
                        return res
                elif prov == "openai" and settings.OPENAI_API_KEY:
                    res = await self._generate_openai(prompt, system_prompt, image_base64, json_mode)
                    if res:
                        return res
            except Exception as e:
                logger.warning(f"Provider {prov} failed: {e}. Trying next fallback...")
                last_error = e

        # If all providers fail or are unconfigured, return a structured fallback response
        logger.warning(f"All configured LLM providers failed or unconfigured. Last error: {last_error}")
        return self._generate_fallback(prompt, json_mode)

    async def _generate_ollama(
        self,
        prompt: str,
        system_prompt: Optional[str],
        image_base64: Optional[str],
        json_mode: bool
    ) -> Optional[str]:
        model_name = self.active_model_id.replace("ollama:", "")
        url = f"{settings.OLLAMA_HOST}/api/generate"
        payload: Dict[str, Any] = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
        }
        if system_prompt:
            payload["system"] = system_prompt
        if image_base64:
            payload["images"] = [image_base64]
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data.get("response", "")
        return None

    async def _generate_gemini(
        self,
        prompt: str,
        system_prompt: Optional[str],
        image_base64: Optional[str],
        json_mode: bool
    ) -> Optional[str]:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Pick model
        model_name = "gemini-2.0-flash" if "2.0" in self.active_model_id else "gemini-1.5-flash"
        gen_config = {}
        if json_mode:
            gen_config["response_mime_type"] = "application/json"

        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt if system_prompt else None,
            generation_config=gen_config
        )

        contents = []
        if image_base64:
            import base64
            image_bytes = base64.b64decode(image_base64)
            contents.append({"mime_type": "image/png", "data": image_bytes})
        contents.append(prompt)

        response = await model.generate_content_async(contents)
        return response.text

    async def _generate_nvidia(
        self,
        prompt: str,
        system_prompt: Optional[str],
        json_mode: bool
    ) -> Optional[str]:
        model_name = self.active_model_id.replace("nvidia:", "") if self.active_model_id.startswith("nvidia:") else "meta/llama-3.3-70b-instruct"
        async with httpx.AsyncClient(timeout=35.0) as client:
            headers = {
                "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": 2048
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            res = await client.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
        return None

    async def _generate_groq(
        self,
        prompt: str,
        system_prompt: Optional[str],
        json_mode: bool
    ) -> Optional[str]:
        async with httpx.AsyncClient(timeout=25.0) as client:
            headers = {
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "temperature": 0.2
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
        return None

    async def _generate_openai(
        self,
        prompt: str,
        system_prompt: Optional[str],
        image_base64: Optional[str],
        json_mode: bool
    ) -> Optional[str]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            if image_base64:
                user_content = [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
                ]
                messages.append({"role": "user", "content": user_content})
            else:
                messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.2
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
        return None

    def _generate_fallback(self, prompt: str, json_mode: bool) -> str:
        prompt_lower = prompt.lower()
        if json_mode:
            # Rule-based intent heuristic
            if any(k in prompt_lower for k in ["theme", "setting", "volume", "open", "launch", "windows", "dark mode", "light mode"]):
                return json.dumps({
                    "intent": "OS_NAV",
                    "confidence": 0.95,
                    "reasoning": "Detected system setting or OS navigation command.",
                    "targetAgent": "os_agent",
                    "actionPlan": ["Identify target Windows setting or application", "Dispatch OS navigation command"],
                    "extractedEntities": {
                        "setting": "theme" if "theme" in prompt_lower else "general",
                        "app": "settings"
                    }
                })
            elif any(k in prompt_lower for k in ["error", "code", "bug", "trace", "terminal", "diff", "patch", "python", "typescript", "function"]):
                return json.dumps({
                    "intent": "CODE_AGENT",
                    "confidence": 0.95,
                    "reasoning": "Detected coding error, stack trace, or file fix request.",
                    "targetAgent": "coding_agent",
                    "actionPlan": ["Inspect terminal trace", "Read source file", "Generate unified diff patch"],
                    "extractedEntities": {
                        "query": prompt
                    }
                })
            elif any(k in prompt_lower for k in ["meeting", "calendar", "call", "google meet", "zoom", "teams", "join"]):
                return json.dumps({
                    "intent": "MEETING_AGENT",
                    "confidence": 0.95,
                    "reasoning": "Detected meeting join, calendar schedule, or call delegate request.",
                    "targetAgent": "meeting_agent",
                    "actionPlan": ["Check calendar link", "Initialize Playwright delegate", "Join meeting and record audio"],
                    "extractedEntities": {
                        "query": prompt
                    }
                })
            elif any(k in prompt_lower for k in ["email", "mail", "gmail", "whatsapp", "message", "send to"]):
                return json.dumps({
                    "intent": "PLUGIN_AGENT",
                    "confidence": 0.95,
                    "reasoning": "Detected email or messaging communication plugin request.",
                    "targetAgent": "plugin_agent",
                    "actionPlan": ["Prepare communication payload", "Send via connected plugin API"],
                    "extractedEntities": {
                        "query": prompt
                    }
                })
            else:
                return json.dumps({
                    "intent": "GENERAL_CHAT",
                    "confidence": 0.9,
                    "reasoning": "Standard assistant conversation.",
                    "targetAgent": "general_assistant",
                    "actionPlan": ["Respond conversationally to user"],
                    "extractedEntities": {}
                })
        
        return f"KittyAI Assistant Response: I received your request: '{prompt}'. Let me assist you with that right away."

orchestrator = LLMOrchestrator()
