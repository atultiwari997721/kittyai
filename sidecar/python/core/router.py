import json
import logging
import uuid
from typing import Dict, Any, Optional
from sidecar.python.core.models import (
    IntentType,
    AnalysisResult,
    ExtractedEntities,
    AnalyzeResponse
)
from sidecar.python.core.llm_orchestrator import orchestrator
from sidecar.python.core.screen import screen_manager
from sidecar.python.agents.os_agent import os_agent
from sidecar.python.agents.coding_agent import coding_agent
from sidecar.python.agents.meeting_agent import meeting_agent
from sidecar.python.agents.plugin_agent import plugin_agent

logger = logging.getLogger("kittyai.router")

ROUTER_SYSTEM_PROMPT = """
You are the Master Analyzer & Intent Router for KittyAI (KritiAI), an advanced autonomous personal assistant for Windows, Web, and Mobile.
Your responsibility is to analyze multimodal user input (text command, voice transcript, or screen context) and accurately classify it into one of four core sub-agents or general chat:

1. OS_NAV: Local OS navigation, window controls, settings toggles (e.g. dark/light theme, display, sound), opening apps (e.g. VS Code, Chrome, Settings), mouse/keyboard actions.
2. CODE_AGENT: VS Code integration, terminal compilation error parsing, stack trace debugging, writing code, generating unified diffs, and applying file patches.
3. MEETING_AGENT: Calendar schedules, meeting alerts, or autonomous call delegation (joining Google Meet, Zoom, Teams on user's behalf, recording audio, transcribing, and compiling action items).
4. PLUGIN_AGENT: External communication services: sending or drafting Gmail emails, WhatsApp messaging, calendar sync, and connected tools.
5. GENERAL_CHAT: Conversational questions, brainstorming, or queries that do not require OS or plugin action.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "intent": "OS_NAV" | "CODE_AGENT" | "MEETING_AGENT" | "PLUGIN_AGENT" | "GENERAL_CHAT",
  "confidence": float between 0.0 and 1.0,
  "reasoning": "brief explanation",
  "targetAgent": "os_agent" | "coding_agent" | "meeting_agent" | "plugin_agent" | "general_assistant",
  "actionPlan": ["step 1", "step 2"],
  "extractedEntities": {
    "app": null or string,
    "setting": null or string,
    "filePath": null or string,
    "meetingUrl": null or string,
    "recipient": null or string,
    "date": null or string,
    "query": null or string
  }
}
"""

class MasterRouter:
    def __init__(self):
        self.orchestrator = orchestrator

    async def analyze_and_route(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        screenshot_base64: Optional[str] = None
    ) -> AnalyzeResponse:
        task_id = str(uuid.uuid4())
        active_window = screen_manager.get_active_window_title()

        user_content = f"""
Incoming User Input: "{prompt}"
Current Active Windows App: "{active_window}"
Additional Context: {json.dumps(context or {})}
"""

        # Call orchestrator with local Ollama priority and automatic cloud fallback
        raw_completion = await self.orchestrator.generate_completion(
            prompt=user_content,
            system_prompt=ROUTER_SYSTEM_PROMPT,
            image_base64=screenshot_base64,
            json_mode=True
        )

        try:
            parsed = json.loads(raw_completion)
            intent = IntentType(parsed.get("intent", "GENERAL_CHAT"))
            entities_dict = parsed.get("extractedEntities", {})
            extracted_entities = ExtractedEntities(
                app=entities_dict.get("app"),
                setting=entities_dict.get("setting"),
                filePath=entities_dict.get("filePath"),
                meetingUrl=entities_dict.get("meetingUrl"),
                recipient=entities_dict.get("recipient"),
                date=entities_dict.get("date"),
                query=entities_dict.get("query")
            )
            analysis = AnalysisResult(
                intent=intent,
                confidence=float(parsed.get("confidence", 0.95)),
                reasoning=parsed.get("reasoning", "Classified by KittyAI Master Analyzer"),
                targetAgent=parsed.get("targetAgent", "general_assistant"),
                actionPlan=parsed.get("actionPlan", []),
                extractedEntities=extracted_entities,
                recommendedModel=self.orchestrator.active_model_id
            )
        except Exception as e:
            logger.warning(f"Error parsing router JSON output: {e}. Raw was: {raw_completion}")
            # Heuristic classification
            intent = self._classify_heuristic(prompt)
            target_map = {
                IntentType.OS_NAV: "os_agent",
                IntentType.CODE_AGENT: "coding_agent",
                IntentType.MEETING_AGENT: "meeting_agent",
                IntentType.PLUGIN_AGENT: "plugin_agent",
                IntentType.GENERAL_CHAT: "general_assistant"
            }
            analysis = AnalysisResult(
                intent=intent,
                confidence=0.9,
                reasoning=f"Heuristic pattern match on input",
                targetAgent=target_map[intent],
                actionPlan=[f"Route directly to {target_map[intent]}"],
                extractedEntities=ExtractedEntities(query=prompt),
                recommendedModel=self.orchestrator.active_model_id
            )

        # Immediate automated execution for standard commands
        immediate_result = await self._execute_immediate_action(prompt, analysis)

        return AnalyzeResponse(
            taskId=task_id,
            analysis=analysis,
            immediateExecution=immediate_result
        )

    def _classify_heuristic(self, prompt: str) -> IntentType:
        p = prompt.lower()
        if any(w in p for w in ["theme", "settings", "setting", "volume", "open", "launch", "dark mode", "light mode", "task manager"]):
            return IntentType.OS_NAV
        if any(w in p for w in ["error", "trace", "bug", "terminal", "diff", "patch", "code", "file", "stack", "exception"]):
            return IntentType.CODE_AGENT
        if any(w in p for w in ["meeting", "calendar", "call", "google meet", "zoom", "teams", "join on my behalf", "delegate"]):
            return IntentType.MEETING_AGENT
        if any(w in p for w in ["email", "mail", "gmail", "whatsapp", "message", "send to"]):
            return IntentType.PLUGIN_AGENT
        return IntentType.GENERAL_CHAT

    async def _execute_immediate_action(self, prompt: str, analysis: AnalysisResult) -> Optional[Dict[str, Any]]:
        """Handles single-step immediate execution if user command explicitly indicates so."""
        p = prompt.lower()
        try:
            # 1. OS Navigation Actions
            if analysis.intent == IntentType.OS_NAV:
                if "theme" in p or "dark mode" in p or "light mode" in p:
                    target_theme = "dark" if "dark" in p else ("light" if "light" in p else "toggle")
                    return os_agent.toggle_windows_theme(target_theme)
                if "setting" in p:
                    # check specific setting page
                    setting_name = analysis.extractedEntities.setting or "personalization-colors"
                    return os_agent.open_settings_uri(setting_name)
                if "launch" in p or "open" in p:
                    app = analysis.extractedEntities.app or p.replace("launch", "").replace("open", "").strip()
                    return os_agent.launch_app(app)

            # 2. Meeting Agent Actions
            elif analysis.intent == IntentType.MEETING_AGENT:
                if "join" in p or "delegate" in p:
                    url = analysis.extractedEntities.meetingUrl
                    return await meeting_agent.join_meeting_on_behalf(join_url=url)

            # 3. Plugin Actions
            elif analysis.intent == IntentType.PLUGIN_AGENT:
                if "whatsapp" in p and analysis.extractedEntities.recipient:
                    return plugin_agent.send_whatsapp_message(
                        phone_number=analysis.extractedEntities.recipient,
                        message=analysis.extractedEntities.query or prompt
                    )
        except Exception as e:
            logger.error(f"Error executing immediate action: {e}")
            return {"error": str(e)}

        return None

master_router = MasterRouter()
