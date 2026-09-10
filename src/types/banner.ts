export interface Banner {
  id: number;
  smtag?: string;
  title?: string;
  subtitle?: string;
  primary_btn?: string;
  primary_btn_url?: string;
  primary_btn_color?: string;
  primary_btn_text_color?: string;
  secondary_btn?: string;
  secondary_btn_url?: string;
  secondary_btn_color?: string;
  secondary_btn_text_color?: string;
  banner_image?: string;
  sort_order?: number;
  status?: string;
}

export interface BannerResponse {
  success: boolean;
  message?: string;
  data: Banner[];
}