import type { ProductListItem } from "./product";

export interface HomeApiResponse {
  success: boolean;
  message: string;
  data: HomeSection[];
}

export type HomeSection = CategorySection | CtaSection;

export interface CategorySection {
  type: "category_section";
  category: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  };
  products: ProductListItem[];
}

export interface CtaSection {
  type: "cta_section";
  id: number;
  cta_style: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  banner_image: string | null;
  button_text: string | null;
  button_link: string | null;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  overlay_color: string | null;
  badge_text: string | null;
  badge_color: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  secondary_button_color: string | null;
  secondary_button_text_color: string | null;
  feature_icon_1: string | null;
  feature_text_1: string | null;
  feature_icon_2: string | null;
  feature_text_2: string | null;
  feature_icon_3: string | null;
  feature_text_3: string | null;
  button_position?: string | null;
  button_margin_top?: number | null;
  button_margin_bottom?: number | null;
  button_margin_left?: number | null;
  button_margin_right?: number | null;
  secondary_button_position?: string | null;
  secondary_button_margin_top?: number | null;
  secondary_button_margin_bottom?: number | null;
  secondary_button_margin_left?: number | null;
  secondary_button_margin_right?: number | null;
  content_alignment?: string | null;
  content_margin_top?: number | null;
  content_margin_bottom?: number | null;
  content_margin_left?: number | null;
  content_margin_right?: number | null;
}