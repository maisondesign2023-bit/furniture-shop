export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type SizePrice = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  sku: string | null;
  stock: number;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
  sizes: string[];
  size_prices: SizePrice[];
  colors: string[];
  created_by?: string | null;
  product_images?: ProductImage[];
  categories?: Category | null;
  profiles?: { full_name: string | null } | null;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type CaseSpaceType = "residential" | "commercial";

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  status: "draft" | "published";
  space_type: CaseSpaceType;
  sort_order: number;
  created_at: string;
  case_study_images?: GalleryImage[];
};

export type ServicePageSection =
  | "hero"
  | "furniture_design"
  | "space_planning"
  | "decor_styling";

export type ServicePageImage = {
  id: string;
  section: ServicePageSection;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type ContactMessage = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
};

export type Banner = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  type: "hero" | "divider";
};

export type ProductShelf = {
  id: string;
  title: string;
  sort_order: number;
  is_active: boolean;
};

export type ShelfProduct = {
  id: string;
  shelf_id: string;
  product_id: string;
  sort_order: number;
  products?: Product;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  content: string | null;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
};

export type Order = {
  id: string;
  order_no: string;
  user_id: string | null;
  email: string | null;
  status:
    | "pending_payment"
    | "paid"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled"
    | "refunded";
  subtotal: number;
  shipping_fee: number;
  total: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  payment_provider: string | null;
  payment_trade_no: string | null;
  paid_at: string | null;
  created_at: string;
};
