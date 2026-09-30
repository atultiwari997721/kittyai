import json
import logging
import uuid
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sidecar.python.core.memory import personal_memory
from sidecar.python.core.llm_orchestrator import orchestrator
from sidecar.python.agents.os_agent import os_agent
from sidecar.python.agents.coding_agent import coding_agent
from sidecar.python.agents.meeting_agent import meeting_agent
from sidecar.python.agents.plugin_agent import plugin_agent

logger = logging.getLogger("kittyai.planner")

PLANNER_SYSTEM_PROMPT = """
You are the Autonomous Execution Planner & Clarification Resolver for KittyAI (KritiAI).
Your goal is to fulfill whatever the user asks by breaking it down into actionable steps across sub-agents (OS, Coding, Meeting, Plugins), OR asking a clarification question if an essential entity or parameter is ambiguous and NOT found in the user's personal memory.

Guidelines:
1. Examine the user's prompt AND the provided KNOWN USER PERSONAL RECORDS.
2. Check if the user is referring to an abstract entity (e.g. "team", "client", "my project", "boss") whose details (emails, phone numbers, target repo, specific config) are REQUIRED to fulfill the action, but are completely unknown.
3. If an essential entity is unknown:
   - set "needsClarification": true
   - set "clarificationQuestion": a clear, polite question asking for the specific details (e.g. "What do you mean by 'the team'? What are the emails or WhatsApp numbers of the persons to send the meeting link to?")
   - set "entityToLearn": the entity name (e.g. "team")
   - formulate "pendingSteps": the steps that will be executed once the user clarifies.
4. If all entities are known (either directly stated in prompt OR found in KNOWN USER PERSONAL RECORDS):
   - set "needsClarification": false
   - set "clarificationQuestion": null
   - set "planSteps": an array of execution steps. Each step must have:
     - "agent": "os_agent" | "coding_agent" | "meeting_agent" | "plugin_agent"
     - "action": string function name (e.g. "schedule_meeting", "send_email", "send_whatsapp", "toggle_theme", "analyze_error")
     - "params": object with concrete parameters (resolve entities like "team" to the actual emails/phones from memory!)
     - "description": human-readable description of what will be done.

Respond STRICTLY in JSON format with fields:
{
  "needsClarification": boolean,
  "clarificationQuestion": string or null,
  "entityToLearn": string or null,
  "reasoning": string,
  "planSteps": [
    {
      "agent": string,
      "action": string,
      "params": {},
      "description": string
    }
  ]
}
"""

class AutonomousPlanner:
    def __init__(self):
        self.pending_tasks: Dict[str, Dict[str, Any]] = {}

    async def plan_and_execute(
        self,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        task_id = str(uuid.uuid4())
        
        # 1. Fetch relevant memories for this prompt
        memory_context = personal_memory.get_relevant_context(user_prompt)

        # 2. Check if user is directly trying to teach the AI a personal record
        # E.g. "my team is Alice (alice@co.com) and Bob (bob@co.com)" or "remember that my project path is D:/work"
        teach_match = re.search(r'(?:remember that|note that|my\s+([a-zA-Z0-9_\-]+)\s+is|here is my\s+([a-zA-Z0-9_\-]+))\s+(.+)', user_prompt, re.IGNORECASE)
        if teach_match:
            entity_name = (teach_match.group(1) or teach_match.group(2) or "custom").strip()
            rest = teach_match.group(3).strip()
            extracted = personal_memory.extract_from_clarification(entity_name, rest)
            personal_memory.set_memory(
                key=entity_name,
                value=extracted if (extracted["emails"] or extracted["phones"]) else rest,
                category="entity" if (extracted["emails"] or extracted["phones"]) else "custom_fact",
                description=f"Personal record for '{entity_name}' taught by user",
                source="chat_instruction"
            )
            return {
                "taskId": task_id,
                "needsClarification": False,
                "learnedMemory": {
                    "key": entity_name,
                    "value": extracted if (extracted["emails"] or extracted["phones"]) else rest
                },
                "status": "completed",
                "summary": f"I have recorded that in your personal memory. Whenever you mention '{entity_name}', I will know exactly what you mean.",
                "executionLog": [f"Learned personal record for '{entity_name}'."]
            }

        # 3. Call LLM Orchestrator to generate execution plan or determine if clarification is required
        prompt_with_context = f"""
Incoming User Request: "{user_prompt}"

{memory_context if memory_context else "No prior memories matched this request."}

Current System Time: {datetime.now(timezone.utc).isoformat()}
"""

        raw_response = await orchestrator.generate_completion(
            prompt=prompt_with_context,
            system_prompt=PLANNER_SYSTEM_PROMPT,
            json_mode=True
        )

        try:
            plan = json.loads(raw_response)
            if "needsClarification" not in plan:
                plan = self._fallback_plan(user_prompt)
        except Exception as e:
            logger.warning(f"Error parsing planner JSON: {e}. Raw response: {raw_response}")
            plan = self._fallback_plan(user_prompt)

        # 4. If Clarification is required:
        if plan.get("needsClarification"):
            entity = plan.get("entityToLearn", "unknown_entity")
            question = plan.get("clarificationQuestion") or f"Could you please specify what you mean by '{entity}'?"
            
            self.pending_tasks[task_id] = {
                "taskId": task_id,
                "originalPrompt": user_prompt,
                "entityToLearn": entity,
                "pendingSteps": plan.get("planSteps", []),
                "createdAt": datetime.now(timezone.utc).isoformat()
            }

            return {
                "taskId": task_id,
                "needsClarification": True,
                "clarificationQuestion": question,
                "entityToLearn": entity,
                "reasoning": plan.get("reasoning", "Additional information needed to complete the task."),
                "status": "waiting_user_clarification"
            }

        # 5. If all information is known, execute the plan steps autonomously!
        execution_results = await self._execute_plan_steps(plan.get("planSteps", []), user_prompt)

        return {
            "taskId": task_id,
            "needsClarification": False,
            "status": "completed",
            "reasoning": plan.get("reasoning", "Executed autonomous task plan."),
            "executionLog": execution_results["logs"],
            "summary": execution_results["summary"],
            "artifacts": execution_results.get("artifacts", {})
        }

    async def resume_with_clarification(
        self,
        task_id: str,
        user_clarification: str
    ) -> Dict[str, Any]:
        """
        Invoked when the user replies to a clarification question.
        1. Learns and records the new fact into personal memory permanently!
        2. Executes the pending task with the clarified data.
        """
        pending = self.pending_tasks.pop(task_id, None)
        entity_name = pending.get("entityToLearn", "entity") if pending else "entity"
        original_prompt = pending.get("originalPrompt", "") if pending else ""

        # Extract structured data from user's response
        extracted_data = personal_memory.extract_from_clarification(entity_name, user_clarification)
        
        # Save permanently to memory!
        learned_record = personal_memory.set_memory(
            key=entity_name,
            value=extracted_data if (extracted_data["emails"] or extracted_data["phones"]) else user_clarification.strip(),
            category="entity" if (extracted_data["emails"] or extracted_data["phones"]) else "custom_fact",
            description=f"Personal record for '{entity_name}' provided during task clarification",
            source="user_clarification"
        )

        logger.info(f"Learned and recorded: {entity_name} -> {learned_record}")

        # Now re-plan and execute with the newly acquired knowledge in memory
        combined_prompt = f"{original_prompt}. (Note: {entity_name} is {user_clarification})"
        result = await self.plan_and_execute(combined_prompt)

        result["learnedMemory"] = {
            "key": entity_name,
            "value": learned_record.get("value"),
            "notice": f"Recorded '{entity_name}' in your personal memory. I will remember this for all future requests!"
        }

        return result

    async def _execute_plan_steps(self, steps: List[Dict[str, Any]], original_prompt: str) -> Dict[str, Any]:
        logs = []
        artifacts = {}
        meeting_link = None
        scheduled_time = None

        for idx, step in enumerate(steps):
            agent = step.get("agent")
            action = step.get("action")
            params = step.get("params", {})
            desc = step.get("description", f"Step {idx + 1}")

            logger.info(f"Executing step {idx + 1}: {desc} ({agent}.{action})")
            logs.append(f"▶ {desc}")

            try:
                # Meeting Agent actions
                if agent == "meeting_agent":
                    if action in ["schedule_meeting", "create_meeting"]:
                        title = params.get("title", "Team Sync Scheduled by KittyAI")
                        time_str = params.get("time", (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d 10:00 AM"))
                        res = plugin_agent.schedule_calendar_event(
                            title=title,
                            start_time=time_str,
                            end_time=(datetime.now() + timedelta(days=1, hours=1)).strftime("%Y-%m-%d 11:00 AM"),
                            meeting_link=f"https://meet.google.com/kitty-{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:3]}"
                        )
                        meeting_link = res["event"]["meetingLink"]
                        scheduled_time = time_str
                        artifacts["meeting"] = res["event"]
                        logs.append(f"✔ Meeting scheduled: '{title}' at {time_str} with link {meeting_link}")

                # Plugin Agent actions
                elif agent == "plugin_agent":
                    if action == "send_email":
                        to_emails = params.get("to") or []
                        if isinstance(to_emails, str):
                            to_emails = [to_emails]
                        # Inject meeting link if available
                        body = params.get("body", "")
                        if meeting_link and "meet.google.com" not in body:
                            body += f"\n\nMeeting Link: {meeting_link}\nScheduled Time: {scheduled_time or 'Tomorrow'}"
                        
                        subject = params.get("subject", "Scheduled Meeting Invitation")
                        res = plugin_agent.send_email_smtp(
                            recipients=to_emails,
                            subject=subject,
                            body=body
                        )
                        logs.append(f"✔ Sent invitation email to: {', '.join(to_emails)}")

                    elif action == "send_whatsapp":
                        phones = params.get("phones") or [params.get("phone")]
                        msg = params.get("message", "")
                        if meeting_link and "meet.google.com" not in msg:
                            msg += f"\nJoin Meeting: {meeting_link}"
                        for p in phones:
                            if p:
                                plugin_agent.send_whatsapp_message(p, msg)
                                logs.append(f"✔ Sent WhatsApp message to: {p}")

                # OS Agent actions
                elif agent == "os_agent":
                    if action == "toggle_theme":
                        theme = params.get("theme", "toggle")
                        res = os_agent.toggle_windows_theme(theme)
                        logs.append(f"✔ Windows theme set to {res.get('newTheme', theme).upper()} mode.")
                    elif action == "open_settings":
                        uri = params.get("uri", "personalization-colors")
                        os_agent.open_settings_uri(uri)
                        logs.append(f"✔ Opened Windows Settings: {uri}")
                    elif action == "launch_app":
                        app = params.get("app", "notepad")
                        os_agent.launch_app(app)
                        logs.append(f"✔ Launched application: {app}")

                # Coding Agent actions
                elif agent == "coding_agent":
                    if action in ["analyze_error", "fix_code"]:
                        err = params.get("error", original_prompt)
                        res = await coding_agent.analyze_and_propose_fix(err)
                        artifacts["codeProposal"] = res.get("proposal")
                        logs.append(f"✔ Analyzed error and generated unified diff patch.")

            except Exception as e:
                logger.error(f"Error executing step {idx + 1}: {e}")
                logs.append(f"⚠ Failed step '{desc}': {e}")

        summary = f"Completed {len(steps)} action(s) autonomously based on your request and personal records."
        if meeting_link:
            summary = f"Meeting scheduled successfully! The meeting link ({meeting_link}) has been generated and dispatched to the designated recipients."

        return {
            "logs": logs,
            "summary": summary,
            "artifacts": artifacts
        }

    def _fallback_plan(self, prompt: str) -> Dict[str, Any]:
        p = prompt.lower()
        if "meeting" in p and ("send" in p or "team" in p):
            team_mem = personal_memory.resolve_entity("team")
            if not team_mem or (isinstance(team_mem, dict) and not team_mem.get("emails") and not team_mem.get("phones")):
                return {
                    "needsClarification": True,
                    "clarificationQuestion": "What do you mean by 'the team'? Please provide the email addresses or WhatsApp numbers of the persons to send the meeting link to.",
                    "entityToLearn": "team",
                    "reasoning": "Need contact details for team to deliver the scheduled meeting link.",
                    "planSteps": []
                }
            else:
                emails = team_mem.get("emails", []) if isinstance(team_mem, dict) else []
                phones = team_mem.get("phones", []) if isinstance(team_mem, dict) else []
                return {
                    "needsClarification": False,
                    "clarificationQuestion": None,
                    "reasoning": "Found 'team' in personal memory records.",
                    "planSteps": [
                        {
                            "agent": "meeting_agent",
                            "action": "schedule_meeting",
                            "params": {"title": "Team Sync", "time": "Tomorrow, 10:00 AM"},
                            "description": "Schedule Google Meet call for tomorrow"
                        },
                        {
                            "agent": "plugin_agent",
                            "action": "send_email",
                            "params": {"to": emails, "subject": "Tomorrow's Team Meeting"},
                            "description": f"Send email with meeting link to team ({', '.join(emails)})"
                        }
                    ]
                }

        return {
            "needsClarification": False,
            "clarificationQuestion": None,
            "reasoning": "Standard single-step execution.",
            "planSteps": [
                {
                    "agent": "os_agent",
                    "action": "launch_app",
                    "params": {"app": "notepad"},
                    "description": "Process command"
                }
            ]
        }

autonomous_planner = AutonomousPlanner()
