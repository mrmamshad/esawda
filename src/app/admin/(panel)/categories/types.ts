export type AdminCategoryRow = {
  cat_id: number;
  cat_name: string;
  slug: string | null;
  cat_order: number | null;
  icon: string | null;
  picture: string | null;
  picture_url: string | null;
  posts_count?: number;
  sub_categories_count?: number;
};

export type AdminSubcategoryRow = {
  sub_cat_id: number;
  main_cat_id: number;
  sub_cat_name: string;
  slug: string | null;
  cat_order: number | null;
  posts_count?: number;
};
