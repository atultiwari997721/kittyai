export enum PermissionLevel {
  LEVEL_0_CHAT = 0,    // Only conversational responses
  LEVEL_1_READ = 1,    // Can inspect authorized data
  LEVEL_2_CONFIRM = 2, // Can prepare and execute actions after confirmation
  LEVEL_3_TRUSTED = 3  // User explicitly allows selected safe operations
}

export type CommandClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CommandPolicyResult {
  allowed: boolean;
  classification: CommandClassification;
  requiresConfirmation: boolean;
  reason: string;
}

export class CommandPolicyEngine {
  private static BLOCKED_PATTERNS = [
    /format\s+[a-z]:/i,
    /del\s+(\/[a-z]\s+)*[a-z]:\\/i,
    /rmdir\s+\/s\s+\/q\s+[a-z]:\\/i,
    /reg\s+delete/i,
    /net\s+user/i,
    /shutdown/i,
    /taskkill\s+\/f\s+\/im\s+explorer/i,
    /powershell.*-enc/i,
    /curl.*\|\s*sh/i
  ];

  private static LOW_RISK_PATTERNS = [
    /^npm\s+(run\s+dev|test|build|lint|run\s+preview)/i,
    /^git\s+(status|diff|log|branch)/i,
    /^python\s+--version/i,
    /^node\s+-v/i,
    /^dir/i,
    /^ls/i,
    /^echo/i
  ];

  private static MEDIUM_RISK_PATTERNS = [
    /^npm\s+install/i,
    /^pip\s+install/i,
    /^git\s+(add|commit|checkout|pull)/i
  ];

  static evaluate(command: string): CommandPolicyResult {
    const trimmed = command.trim();

    // Check critical blocks
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          classification: 'CRITICAL',
          requiresConfirmation: false,
          reason: 'Command violates KritiAI Safety Policy (CRITICAL risk of data destruction or privilege escalation).'
        };
      }
    }

    // Check low risk
    for (const pattern of this.LOW_RISK_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: true,
          classification: 'LOW',
          requiresConfirmation: false,
          reason: 'Safe inspection/development command.'
        };
      }
    }

    // Check medium risk
    for (const pattern of this.MEDIUM_RISK_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: true,
          classification: 'MEDIUM',
          requiresConfirmation: true,
          reason: 'Package installation or git modification.'
        };
      }
    }

    // Default to HIGH risk requiring confirmation
    return {
      allowed: true,
      classification: 'HIGH',
      requiresConfirmation: true,
      reason: 'General system command requiring explicit user authorization.'
    };
  }
}
