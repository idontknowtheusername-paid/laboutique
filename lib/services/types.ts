export interface ScrapedProductData {
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description: string;
  images: string[];
  category?: string;
  brand?: string;
  sku?: string;
  stock_quantity?: number;
  specifications?: Record<string, string>;
  source_url: string;
  source_platform: 'aliexpress' | 'alibaba';
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
  message?: string;
}

export interface PlatformInfo {
  key: string;
  name: string;
  domain: string;
  icon: string;
  color: string;
}