export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          language: string;
          country: string;
          city: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          language?: string;
          country?: string;
          city?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          language?: string;
          country?: string;
          city?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          sku: string;
          price: number;
          compare_price: number | null;
          cost_price: number | null;
          track_quantity: boolean;
          quantity: number;
          weight: number | null;
          dimensions: any | null;
          category_id: string;
          vendor_id: string;
          brand: string | null;
          tags: string[] | null;
          images: string[] | null;
          status: string;
          featured: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          email: string;
          phone: string | null;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          address: string | null;
          city: string | null;
          country: string;
          rating: number;
          total_reviews: number;
          total_products: number;
          total_orders: number;
          commission_rate: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          payment_status: string;
          payment_method: string;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          shipping_address: any;
          billing_address: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          vendor_id: string;
          quantity: number;
          price: number;
          total: number;
          created_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          content: string;
          images: string[] | null;
          verified_purchase: boolean;
          helpful_count: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: string;
          value: number;
          minimum_amount: number | null;
          maximum_amount: number | null;
          usage_limit: number | null;
          used_count: number;
          starts_at: string;
          expires_at: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          image_url: string;
          link_url: string | null;
          button_text: string | null;
          position: string;
          sort_order: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Wishlist = Database['public']['Tables']['wishlist']['Row'];
export type ProductReview = Database['public']['Tables']['product_reviews']['Row'];
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type Banner = Database['public']['Tables']['banners']['Row'];