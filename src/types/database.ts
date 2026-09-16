export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_uid: string | null;
          full_name: string;
          avatar_url: string | null;
          business_type: string | null;
          location: string | null;
          bio: string | null;
          community_posts: number;
          helpful_upvotes: number;
          wallet_balance: number;
          tier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_uid?: string | null;
          full_name: string;
          avatar_url?: string | null;
          business_type?: string | null;
          location?: string | null;
          bio?: string | null;
          community_posts?: number;
          helpful_upvotes?: number;
          wallet_balance?: number;
          tier?: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          auth_uid: string | null;
          full_name: string;
          avatar_url: string | null;
          business_type: string | null;
          location: string | null;
          bio: string | null;
          community_posts: number;
          helpful_upvotes: number;
          wallet_balance: number;
          tier: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          category: string;
          rating: number | null;
          is_new: boolean;
          verified_date: string;
          description: string;
          price: string;
          image_url: string | null;
          featured: boolean;
          location: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          rating?: number | null;
          is_new?: boolean;
          verified_date: string;
          description: string;
          price: string;
          image_url?: string | null;
          featured?: boolean;
          location?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          name: string;
          category: string;
          rating: number | null;
          is_new: boolean;
          verified_date: string;
          description: string;
          price: string;
          image_url: string | null;
          featured: boolean;
          location: string | null;
          verified: boolean;
          created_at: string;
        }>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          title: string;
          icon: string;
          icon_color: string | null;
          icon_bg: string | null;
          label: string;
          label_color: string | null;
          label_border: string | null;
          subtitle: string | null;
          members: number;
          badge: string | null;
          height: number | null;
          image_url: string | null;
          dark: boolean;
          simple: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          icon: string;
          icon_color?: string | null;
          icon_bg?: string | null;
          label: string;
          label_color?: string | null;
          label_border?: string | null;
          subtitle?: string | null;
          members?: number;
          badge?: string | null;
          height?: number | null;
          image_url?: string | null;
          dark?: boolean;
          simple?: boolean;
          sort_order?: number;
        };
        Update: Partial<{
          id: string;
          slug: string;
          title: string;
          icon: string;
          icon_color: string | null;
          icon_bg: string | null;
          label: string;
          label_color: string | null;
          label_border: string | null;
          subtitle: string | null;
          members: number;
          badge: string | null;
          height: number | null;
          image_url: string | null;
          dark: boolean;
          simple: boolean;
          sort_order: number;
        }>;
        Relationships: [];
      };
      networks: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          member_count: number;
          location: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          member_count?: number;
          location?: string | null;
        };
        Update: Partial<{
          id: string;
          category_id: string | null;
          name: string;
          member_count: number;
          location: string | null;
        }>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string | null;
          author_name: string;
          author_avatar: string | null;
          is_verified: boolean;
          is_mentor: boolean;
          created_at: string;
          category: string | null;
          title: string;
          body: string;
          image_url: string | null;
          likes: number;
          comments: number;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          author_name: string;
          author_avatar?: string | null;
          is_verified?: boolean;
          is_mentor?: boolean;
          created_at?: string;
          category?: string | null;
          title: string;
          body: string;
          image_url?: string | null;
          likes?: number;
          comments?: number;
        };
        Update: Partial<{
          id: string;
          author_id: string | null;
          author_name: string;
          author_avatar: string | null;
          is_verified: boolean;
          is_mentor: boolean;
          created_at: string;
          category: string | null;
          title: string;
          body: string;
          image_url: string | null;
          likes: number;
          comments: number;
        }>;
        Relationships: [];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          post_id: string;
          user_id: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          author_name: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          post_id: string;
          user_id: string | null;
          author_name: string;
          body: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      gap_reports: {
        Row: {
          id: string;
          slug: string;
          category: string;
          location: string;
          tag: string;
          icon: string;
          title: string;
          description: string;
          report_type: string;
          preview_image_url: string | null;
          is_unlocked: boolean;
          price_ksh: number;
        };
        Insert: {
          id?: string;
          slug: string;
          category: string;
          location: string;
          tag: string;
          icon: string;
          title: string;
          description: string;
          report_type: string;
          preview_image_url?: string | null;
          is_unlocked?: boolean;
          price_ksh?: number;
        };
        Update: Partial<{
          id: string;
          slug: string;
          category: string;
          location: string;
          tag: string;
          icon: string;
          title: string;
          description: string;
          report_type: string;
          preview_image_url: string | null;
          is_unlocked: boolean;
          price_ksh: number;
        }>;
        Relationships: [];
      };
      gap_analytics: {
        Row: {
          id: string;
          slug: string;
          category: string;
          location: string;
          consumer_demand_pct: number;
          market_saturation_pct: number;
        };
        Insert: {
          id?: string;
          slug: string;
          category: string;
          location: string;
          consumer_demand_pct?: number;
          market_saturation_pct?: number;
        };
        Update: Partial<{
          id: string;
          slug: string;
          category: string;
          location: string;
          consumer_demand_pct: number;
          market_saturation_pct: number;
        }>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      upsert_my_profile: {
        Args: {
          p_business_type: string;
          p_location: string;
          p_full_name: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};