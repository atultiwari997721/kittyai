export type OSActionType =
  | 'launch_app'
  | 'open_settings'
  | 'toggle_theme'
  | 'set_volume'
  | 'key_press'
  | 'mouse_click'
  | 'hotkey'
  | 'notification'
  | 'shell_exec';

export type WindowsTheme = 'dark' | 'light' | 'toggle';

export interface OSCommand {
  type: OSActionType;
  appName?: string;
  uri?: string;
  theme?: WindowsTheme;
  keys?: string[];
  x?: number;
  y?: number;
  command?: string;
  description: string;
}

export interface AssistState {
  isMonitoring: boolean;
  activeWindow: string;
  lastObservation: string;
  detectedNeed?: string;
  isOverlayVisible: boolean;
  captureIntervalSec: number;
  lastCheckTimestamp: string;
}

export interface ScreenAnalysis {
  timestamp: string;
  windowTitle: string;
  summary: string;
  ocrDetectedText?: string;
  userContext: string;
  suggestedProactiveAction?: {
    actionType: OSActionType;
    prompt: string;
    details: Record<string, unknown>;
  };
}
