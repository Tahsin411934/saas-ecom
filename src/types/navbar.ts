export interface NavbarChildItem {
  id: number;
  navbar_item_id: number;
  name: string;
  slug: string;
  url: string;
  icon: string;
  sort_order: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface NavbarItem {
  id: number;
  name: string;
  slug: string;
  url: string;
  icon: string;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  children: NavbarChildItem[];
}

export interface NavbarResponse {
  success: boolean;
  message: string;
  data: NavbarItem[];
}