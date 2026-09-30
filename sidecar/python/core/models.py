from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class IntentType(str, Enum):
    OS_NAV = "OS_NAV"
    CODE_AGENT = "CODE_AGENT"
    MEETING_AGENT = "MEETING_AGENT"
    PLUGIN_AGENT = "PLUGIN_AGENT"
    GENERAL_CHAT = "GENERAL_CHAT"

class ExtractedEntities(BaseModel):
    app: Optional[str] = None
    setting: Optional[str] = None
    filePath: Optional[str] = None
    meetingUrl: Optional[str] = None
    recipient: Optional[str] = None
    date: Optional[str] = None
    query: Optional[str] = None

class AnalysisResult(BaseModel):
    intent: IntentType
    confidence: float = 1.0
    reasoning: str
    targetAgent: str
    actionPlan: List[str] = []
    extractedEntities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    recommendedModel: Optional[str] = None

class AnalyzeRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None
    screenshotBase64: Optional[str] = None

class AnalyzeResponse(BaseModel):
    taskId: str
    analysis: AnalysisResult
    immediateExecution: Optional[Dict[str, Any]] = None

class OSActionRequest(BaseModel):
    type: str # launch_app, open_settings, toggle_theme, set_volume, key_press, mouse_click, shell_exec
    appName: Optional[str] = None
    uri: Optional[str] = None
    theme: Optional[str] = None # dark, light, toggle
    keys: Optional[List[str]] = None
    x: Optional[int] = None
    y: Optional[int] = None
    command: Optional[str] = None
    description: str = ""

class ThemeToggleRequest(BaseModel):
    theme: str = "toggle" # dark, light, toggle

class AssistToggleRequest(BaseModel):
    enable: bool
    intervalSec: float = 3.0

class CodeAnalyzeRequest(BaseModel):
    rawError: str
    workspacePath: Optional[str] = None
    activeFile: Optional[str] = None
    fileContent: Optional[str] = None

class FilePatchItem(BaseModel):
    filePath: str
    patchedContent: str

class CodePatchRequest(BaseModel):
    proposalId: str
    patches: List[FilePatchItem]

class MeetingJoinRequest(BaseModel):
    meetingId: Optional[str] = None
    joinUrl: Optional[str] = None
    customName: Optional[str] = None
    platform: Optional[str] = "google_meet"

class EmailSendModel(BaseModel):
    to: List[str]
    subject: str
    body: str
    isHtml: bool = False
    cc: Optional[List[str]] = None

class WhatsAppSendModel(BaseModel):
    phoneNumber: str
    message: str
    mediaUrl: Optional[str] = None

class CalendarEventModel(BaseModel):
    title: str
    description: Optional[str] = None
    startTime: str
    endTime: str
    attendees: Optional[List[str]] = None
    meetingLink: Optional[str] = None

class ModelInfoModel(BaseModel):
    id: str
    name: str
    provider: str
    isLocal: bool = False
    contextWindow: Optional[int] = None
    supportsVision: bool = False
    description: Optional[str] = None

class ActiveModelRequest(BaseModel):
    modelId: str
    provider: Optional[str] = None

class MemorySaveRequest(BaseModel):
    key: str
    value: Any
    category: str = "entity"
    description: str = ""

class ChatRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

class ClarificationRequest(BaseModel):
    taskId: str
    response: str

