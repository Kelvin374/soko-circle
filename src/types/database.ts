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
          /** Added in 0004. */
          phone: string | null;
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
          phone?: string | null;
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
          phone: string | null;
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
          /** Added in 0011. Nullable geo categorisation links. */
          subcounty_code: string | null;
          constituency_code: string | null;
          ward_code: string | null;
          town_code: string | null;
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
          subcounty_code?: string | null;
          constituency_code?: string | null;
          ward_code?: string | null;
          town_code?: string | null;
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
          subcounty_code: string | null;
          constituency_code: string | null;
          ward_code: string | null;
          town_code: string | null;
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
          /** Added in 0011 (county gap signals). Null for sector-level rows. */
          county_code: string | null;
          population_2023_proj: number | null;
          gdp_usd_bn_2024: number | null;
          gdp_per_capita_usd_2024: number | null;
          gdp_per_capita_vs_national: number | null;
          avg_gdp_growth_2020_24_pct: number | null;
          high_growth: boolean | null;
          formal_inclusion_pct_2024: number | null;
          fin_access_flag: string | null;
          msme_share_pct_2016: number | null;
          msme_share_to_pop_share: number | null;
          caip_phase1_cohort_2025: boolean | null;
          caip_near_complete_2026: boolean | null;
          archetype: string | null;
          documented_notes: string | null;
          source_ids: string[];
          /** Added in 0011. Nullable geo categorisation links. */
          subcounty_code: string | null;
          constituency_code: string | null;
          ward_code: string | null;
          town_code: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          category: string;
          location: string;
          consumer_demand_pct?: number;
          market_saturation_pct?: number;
          county_code?: string | null;
          population_2023_proj?: number | null;
          gdp_usd_bn_2024?: number | null;
          gdp_per_capita_usd_2024?: number | null;
          gdp_per_capita_vs_national?: number | null;
          avg_gdp_growth_2020_24_pct?: number | null;
          high_growth?: boolean | null;
          formal_inclusion_pct_2024?: number | null;
          fin_access_flag?: string | null;
          msme_share_pct_2016?: number | null;
          msme_share_to_pop_share?: number | null;
          caip_phase1_cohort_2025?: boolean | null;
          caip_near_complete_2026?: boolean | null;
          archetype?: string | null;
          documented_notes?: string | null;
          source_ids?: string[];
          subcounty_code?: string | null;
          constituency_code?: string | null;
          ward_code?: string | null;
          town_code?: string | null;
        };
        Update: Partial<{
          id: string;
          slug: string;
          category: string;
          location: string;
          consumer_demand_pct: number;
          market_saturation_pct: number;
          county_code: string | null;
          population_2023_proj: number | null;
          gdp_usd_bn_2024: number | null;
          gdp_per_capita_usd_2024: number | null;
          gdp_per_capita_vs_national: number | null;
          avg_gdp_growth_2020_24_pct: number | null;
          high_growth: boolean | null;
          formal_inclusion_pct_2024: number | null;
          fin_access_flag: string | null;
          msme_share_pct_2016: number | null;
          msme_share_to_pop_share: number | null;
          caip_phase1_cohort_2025: boolean | null;
          caip_near_complete_2026: boolean | null;
          archetype: string | null;
          documented_notes: string | null;
          source_ids: string[];
          subcounty_code: string | null;
          constituency_code: string | null;
          ward_code: string | null;
          town_code: string | null;
        }>;
        Relationships: [];
      };
      /** Added in 0010. KNBS county population reference; public read-only. */
      counties: {
        Row: {
          code: string;
          name: string;
          population_2019: number;
          population_2023_proj: number | null;
          source_id: string | null;
        };
        Insert: {
          code: string;
          name: string;
          population_2019: number;
          population_2023_proj?: number | null;
          source_id?: string | null;
        };
        Update: Partial<{
          code: string;
          name: string;
          population_2019: number;
          population_2023_proj: number | null;
          source_id: string | null;
        }>;
        Relationships: [];
      };
      /** Added in 0011. Rule-based county archetypes; public read-only. */
      gap_archetypes: {
        Row: {
          code: string;
          label: string;
          rule: string;
          typical_gaps: string;
          evidence_level: string;
        };
        Insert: {
          code: string;
          label: string;
          rule: string;
          typical_gaps: string;
          evidence_level: string;
        };
        Update: Partial<{
          code: string;
          label: string;
          rule: string;
          typical_gaps: string;
          evidence_level: string;
        }>;
        Relationships: [];
      };
      /** Added in 0011. IEBC/administrative level 2; public read-only. */
      subcounties: {
        Row: {
          code: string;
          county_code: string;
          name: string;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: {
          code: string;
          county_code: string;
          name: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: Partial<{
          code: string;
          county_code: string;
          name: string;
          latitude: number | null;
          longitude: number | null;
        }>;
        Relationships: [];
      };
      /** Added in 0011. IEBC constituencies (290); public read-only. */
      constituencies: {
        Row: {
          code: string;
          county_code: string;
          subcounty_code: string | null;
          name: string;
        };
        Insert: {
          code: string;
          county_code: string;
          subcounty_code?: string | null;
          name: string;
        };
        Update: Partial<{
          code: string;
          county_code: string;
          subcounty_code: string | null;
          name: string;
        }>;
        Relationships: [];
      };
      /** Added in 0011. IEBC wards (1450); public read-only. */
      wards: {
        Row: {
          code: string;
          constituency_code: string;
          name: string;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: {
          code: string;
          constituency_code: string;
          name: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: Partial<{
          code: string;
          constituency_code: string;
          name: string;
          latitude: number | null;
          longitude: number | null;
        }>;
        Relationships: [];
      };
      /** Added in 0011. KNBS 2019 census urban centres; public read-only. */
      towns: {
        Row: {
          code: string;
          county_code: string | null;
          name: string;
          population_2019: number | null;
          county_label: string | null;
        };
        Insert: {
          code: string;
          county_code?: string | null;
          name: string;
          population_2019?: number | null;
          county_label?: string | null;
        };
        Update: Partial<{
          code: string;
          county_code: string | null;
          name: string;
          population_2019: number | null;
          county_label: string | null;
        }>;
        Relationships: [];
      };
      /** Added in 0006. Users file applications; only service_role reviews them. */
      mentor_applications: {
        Row: {
          id: string;
          profile_id: string;
          status: string;
          community_posts: number;
          helpful_upvotes: number;
          business_type: string | null;
          location: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          status?: string;
          community_posts?: number;
          helpful_upvotes?: number;
          business_type?: string | null;
          location?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          profile_id: string;
          status: string;
          community_posts: number;
          helpful_upvotes: number;
          business_type: string | null;
          location: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      /** Added in 0007. Written by triggers only; clients read + mark read. */
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          actor_profile_id: string | null;
          kind: string;
          title: string;
          body: string;
          post_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          actor_profile_id?: string | null;
          kind: string;
          title: string;
          body: string;
          post_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          profile_id: string;
          actor_profile_id: string | null;
          kind: string;
          title: string;
          body: string;
          post_id: string | null;
          read_at: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      /** Added in 0010. Reference sources; public read-only. */
      data_sources: {
        Row: {
          id: string;
          title: string;
          publisher: string | null;
          url: string | null;
          year: number | null;
          reliability: string;
        };
        Insert: {
          id: string;
          title: string;
          publisher?: string | null;
          url?: string | null;
          year?: number | null;
          reliability: string;
        };
        Update: Partial<{
          id: string;
          title: string;
          publisher: string | null;
          url: string | null;
          year: number | null;
          reliability: string;
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
      /** Added in 0004. Resolves the caller's `profiles.id` from `auth.uid()`. */
      current_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      /** Added in 0004. Server-validated post creation. */
      create_post: {
        Args: {
          p_title: string;
          p_body: string;
          p_category?: string | null;
          p_image_url?: string | null;
        };
        Returns: Database['public']['Tables']['posts']['Row'];
      };
      /** Added in 0004. Server-validated comment creation. */
      create_comment: {
        Args: {
          p_post_id: string;
          p_body: string;
        };
        Returns: Database['public']['Tables']['post_comments']['Row'];
      };
      /** Added in 0006. Files a mentor application after re-checking criteria. */
      apply_for_mentor: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Tables']['mentor_applications']['Row'];
      };
      /** Added in 0007. Marks notifications read; omit ids to mark all. */
      mark_notifications_read: {
        Args: { p_ids?: string[] | null };
        Returns: number;
      };
      /** Added in 0007. Index-backed unread count for the tab badge. */
      unread_notification_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
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