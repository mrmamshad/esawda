/**
 * TypeScript mirror of the Laravel API resource shapes. Keep in sync with
 * app/Http/Resources/V1/*.php — resources are the single source of truth.
 */

export type Money = number;

export type Category = {
  id: number;
  name: string;
  slug: string | null;
  order: number | null;
  icon: string | null;
  picture_url: string | null;
  ads_count?: number;
  new_count?: number;
  used_count?: number;
  sub_categories?: SubCategory[];
};

export type SubCategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string | null;
  order: number | null;
  photo_show: boolean;
  price_show: boolean;
  picture_url: string | null;
  ads_count?: number;
};

export type Country  = { id: number; code: string; iso3: string; name: string; currency_code: string | null; active: boolean };
export type City     = { id: number; country_code: string; name: string; lat: number | null; lng: number | null; active: boolean };
export type Currency = { id: number; code: string; name: string; symbol: string; in_left: boolean; decimal_places: number };
export type Language = { id: number; code: string; name: string; direction: string; active: boolean; default: boolean };

export type AdCondition = 'new' | 'used';
export type AdStatus    = 'draft' | 'pending' | 'active' | 'sold_out' | 'removed' | 'rejected' | 'expire';

export type Ad = {
  id: number;
  slug: string | null;
  url_slug: string;
  title: string;
  price: Money;
  negotiable: boolean;
  condition: AdCondition;
  status: AdStatus;
  thumbnail: string | null;
  featured: boolean;
  urgent: boolean;
  highlight: boolean;
  paid?: boolean;
  location: { city: string | null; state: string | null; country: string | null };
  category?:    { id: number; name: string; slug: string | null } | null;
  sub_category?:{ id: number; name: string; slug: string | null } | null;
  created_at: string | null;
  expires_at?: string | null;
  bundle_items?: { id: number; title: string; price: number; thumbnail: string | null }[] | null;
};

export type AdDetail = Ad & {
  description: string;
  phone: string | null;
  whatsapp: string | null;
  tags: string[];
  view_count: number;
  images: { url: string; thumb: string }[];
  location: Ad['location'] & { address: string | null; coords: { lat: number; lng: number } | null };
  category:     { id: number; name: string; slug: string | null; icon: string | null } | null;
  sub_category: { id: number; name: string; slug: string | null } | null;
  seller: SellerMini | null;
  custom_fields?: { field_id: number; type: string; value: string }[];
  expires_at: string | null;
  updated_at: string | null;
};

export type SellerMini = {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  cover_url?: string | null;
  online: boolean;
  member_since: string | null;
  phone: string | null;
  whatsapp: string | null;
  socials: Record<'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'pinterest', string | null>;
};

export type Seller = {
  id: number;
  username: string;
  name: string;
  tagline: string | null;
  description: string | null;
  avatar_url: string;
  cover_url?: string | null;
  online: boolean;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  location: { city: string | null; country: string | null; address: string | null };
  socials: Record<'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'pinterest', string | null>;
  stats: { total_listings: number; sold: number; active: number; avg_rating: number | null; reviews_count: number };
  member_since: string | null;
  last_active: string | null;
};

export type FilterField = {
  id: number;
  name: string;
  label: string;
  type: 'range' | 'number' | 'text' | 'enum' | 'bool';
  widget: 'range' | 'select' | 'switch' | 'number' | 'text';
  required: boolean;
  default: string | null;
  min: number | null;
  max: number | null;
  col_span: 1 | 2;
  options: { value: string; label: string }[];
  icon: string | null;
  order: number | null;
};
export type FilterSchema = { category: number | null; sub_category: number | null; fields: FilterField[] };

export type Review = {
  id: number;
  rating: number | null;
  comment: string;
  image?: string | null;
  date: string;
  author: { id: number; username: string; name: string; avatar_url: string; tagline: string | null } | null;
  product_id: number;
};

export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: string;
  group_id?: string | number | null;
  plan_id?: number | null;
  is_admin?: boolean;
  is_shop?: boolean;
  plan_active?: boolean;
  plan_expires_at?: string | null;
  ads_remaining?: number;
  shop_name?: string | null;
  shop_address?: string | null;
  avatar_url: string;
  avatar_set?: boolean;
  cover_url?: string | null;
  online: boolean;
};

export type Thread = {
  id: string;
  counterpart: { id: number; username: string; name: string; phone: string | null; avatar_url: string; online: boolean };
  last_message: { body: string; type: string; mine: boolean; sent_at: string | null };
  unread_count: number;
  post_id: number | null;
};

export type Message = {
  id: number;
  thread_id: string;
  from_id: number;
  to_id: number;
  from_name: string;
  to_name: string;
  body: string;
  type: string;
  image_url?: string | null;
  post_id: number | null;
  seen: boolean;
  mine: boolean;
  sender: { id: number; username: string; name: string; avatar_url: string; online: boolean } | null;
  sent_at: string | null;
};

export type Testimonial = { id: number; name: string; designation: string | null; content: string; avatar_url: string | null };
export type Plan = { id: number; name: string; badge: string | null; monthly_price: number; annual_price: number; lifetime_price: number; recommended: boolean; settings: unknown; active: boolean };
export type Page = { id: number; slug: string; name: string; title: string; content: string; lang: string; active: boolean };
export type Faq  = { id: number; title: string; content: string; weight: number; parent_id: number | null; lang: string; active: boolean };

export type Transaction = {
  id: number;
  plan_name: string | null;
  plan_id: number | null;
  amount: number;
  currency: string;
  method: string | null;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | string;
  reference: string | null;
  invoice_url: string | null;
  created_at: string | null;
};

export type Order = {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  transaction_id: number | null;
  amount: number;
  shipping_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  courier_name: string | null;
  tracking_no: string | null;
  seller_paid: boolean;
  product_image: string | null;
  created_at: string | null;
  product?: { id: number; product_name: string; slug?: string; price: number; screen_shot?: string | null } | null;
  buyer?:  { id: number; username: string; name: string | null; email?: string | null } | null;
  seller?: { id: number; username: string; name: string | null } | null;
  transaction?: { id: number; status: string; amount: number; created_at: string | null } | null;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  url_slug: string;
  excerpt: string;
  description: string;
  image_url: string | null;
  tags: string[];
  status: string;
  author: { id: number; username: string; name: string; avatar_url: string } | null;
  categories?: { id: number; title: string; slug: string | null }[];
  created_at: string | null;
};

export type BlogCategory = { id: number; title: string; slug: string | null };

export type Paginated<T> = { data: T[]; meta?: { current_page: number; last_page: number; per_page: number; total: number }; links?: { first: string | null; last: string | null; prev: string | null; next: string | null } };
