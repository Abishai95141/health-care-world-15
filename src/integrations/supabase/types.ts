export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_banners: {
        Row: {
          created_at: string
          cta_text: string | null
          cta_url: string | null
          display_order: number
          headline: string
          id: string
          image_url: string | null
          is_enabled: boolean
          placement: string
          subtext: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          headline: string
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          placement: string
          subtext?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          display_order?: number
          headline?: string
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          placement?: string
          subtext?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
          postal_code: string
          state: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
          postal_code: string
          state: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "out_of_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_sessions: {
        Row: {
          abandoned_at: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "out_of_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          created_at: string | null
          id: string
          payment_status: string | null
          shipping_amount: number | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          shipping_amount?: number | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          shipping_amount?: number | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_import_logs: {
        Row: {
          error_message: string | null
          failed_rows: number | null
          id: string
          imported_at: string
          staff_id: string | null
          status: string
          successful_rows: number | null
          total_rows: number | null
        }
        Insert: {
          error_message?: string | null
          failed_rows?: number | null
          id?: string
          imported_at?: string
          staff_id?: string | null
          status?: string
          successful_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          error_message?: string | null
          failed_rows?: number | null
          id?: string
          imported_at?: string
          staff_id?: string | null
          status?: string
          successful_rows?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_import_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          reviewer_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          reviewer_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          reviewer_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "out_of_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string
          expiration_date: string | null
          id: string
          image_urls: string[] | null
          is_active: boolean
          manufacturer: string | null
          mrp: number | null
          name: string
          price: number
          requires_prescription: boolean
          slug: string
          stock: number
          tags: string[] | null
          unit: string
          updated_at: string
          weight_volume: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description: string
          expiration_date?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          manufacturer?: string | null
          mrp?: number | null
          name: string
          price: number
          requires_prescription?: boolean
          slug: string
          stock?: number
          tags?: string[] | null
          unit: string
          updated_at?: string
          weight_volume?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string
          expiration_date?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          manufacturer?: string | null
          mrp?: number | null
          name?: string
          price?: number
          requires_prescription?: boolean
          slug?: string
          stock?: number
          tags?: string[] | null
          unit?: string
          updated_at?: string
          weight_volume?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          purchase_order_id: string | null
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "out_of_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          id: string
          po_number: string
          status: string | null
          supplier: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          po_number: string
          status?: string | null
          supplier?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          po_number?: string
          status?: string | null
          supplier?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          role?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          wishlist_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          wishlist_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          wishlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "out_of_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_sales: {
        Row: {
          avg_order_value: number | null
          sale_date: string | null
          total_orders: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      low_stock: {
        Row: {
          category: string | null
          id: string | null
          name: string | null
          price: number | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Relationships: []
      }
      out_of_stock: {
        Row: {
          category: string | null
          id: string | null
          name: string | null
          price: number | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Relationships: []
      }
      payment_breakdown: {
        Row: {
          order_count: number | null
          payment_status: string | null
          total_amount: number | null
        }
        Relationships: []
      }
      stock_values: {
        Row: {
          category: string | null
          product_count: number | null
          total_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      authenticate_staff: {
        Args: { email_input: string; password_input: string }
        Returns: {
          user_id: string
          email: string
          role: string
        }[]
      }
      create_staff_user: {
        Args: {
          email_input: string
          password_input: string
          role_input?: string
        }
        Returns: string
      }
      generate_purchase_order: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { name: string }
        Returns: string
      }
      get_cart_abandonment: {
        Args: Record<PropertyKey, never>
        Returns: {
          session_id: string
          user_id: string
          created_at: string
          abandoned_at: string
          items_count: number
        }[]
      }
      get_customer_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_customers: number
          new_customers_this_month: number
          returning_customers: number
          avg_orders_per_customer: number
        }[]
      }
      get_expiring_soon: {
        Args: { days_ahead?: number }
        Returns: {
          product_id: string
          product_name: string
          expiration_date: string
          days_until_expiry: number
          stock: number
        }[]
      }
      get_lowest_rated: {
        Args: { limit_count?: number }
        Returns: {
          product_id: string
          product_name: string
          avg_rating: number
          review_count: number
        }[]
      }
      get_top_brands: {
        Args: { limit_count?: number }
        Returns: {
          brand: string
          total_sales: number
          total_revenue: number
        }[]
      }
      get_top_categories: {
        Args: { limit_count?: number }
        Returns: {
          category: string
          total_sales: number
          total_revenue: number
        }[]
      }
      get_top_products: {
        Args: { limit_count?: number }
        Returns: {
          product_id: string
          product_name: string
          total_quantity: number
          total_revenue: number
        }[]
      }
      get_top_rated: {
        Args: { limit_count?: number }
        Returns: {
          product_id: string
          product_name: string
          avg_rating: number
          review_count: number
        }[]
      }
      get_user_role: {
        Args: { user_email: string }
        Returns: string
      }
      is_current_user_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_abandoned_carts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      place_order: {
        Args: {
          cart_user_id: string
          shipping_cost?: number
          order_address_id?: string
        }
        Returns: {
          order_id: string
          success: boolean
          error_message: string
        }[]
      }
      recent_reviews: {
        Args: { limit_count?: number }
        Returns: {
          review_id: string
          product_name: string
          reviewer_name: string
          rating: number
          comment: string
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
