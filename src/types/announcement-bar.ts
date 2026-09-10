export interface AnnouncementBar {
  id: number;
  left_text: string | null;
  center_text: string | null;
  right_text: string | null;
  background_color: string;
  text_color: string;
  sort_order: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementBarResponse {
  success: boolean;
  message: string;
  data: AnnouncementBar[];
}