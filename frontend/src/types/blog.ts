export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  author?: string;
  readTime?: number;
  published?: boolean;
  metaDescription?: string;
  createdAt?: string;
}