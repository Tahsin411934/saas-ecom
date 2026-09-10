import { api } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";

export type CampaignProduct = {
  id: number;
  name: string;
  slug: string;
  main_image?: string | null;
  /** Price after discount (customer pays). */
  price: number | null;
  /** Regular (pre-discount) price. */
  regular_price?: number | null;
  original_price: number;
  discount_percent?: number;
  discount_amount?: number;
  has_discount?: boolean;
};

export type Campaign = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  button_text: string;
  starts_at?: string | null;
  ends_at?: string | null;
  products: CampaignProduct[];
};

export const campaignService = {
  getActive: async (): Promise<Campaign[]> =>
    (await api<{ data: Campaign[] }>("/campaigns", {
      revalidate: REVALIDATE.CAMPAIGN,
      tags: ["campaigns"],
    })).data ?? [],
};
