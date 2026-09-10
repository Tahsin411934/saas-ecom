export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: Record<string, string | null>;
}