export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      build_states: {
        Row: {
          card_levels: Json
          card_slots: number
          cells: number
          coins: number
          gems: number
          lab_speed_multiplier: number
          shards: number
          stones: number
          updated_at: string
          user_id: string
          verification_flags: string[]
        }
        Insert: {
          card_levels?: Json
          card_slots?: number
          cells?: number
          coins?: number
          gems?: number
          lab_speed_multiplier?: number
          shards?: number
          stones?: number
          updated_at?: string
          user_id: string
          verification_flags?: string[]
        }
        Update: {
          card_levels?: Json
          card_slots?: number
          cells?: number
          coins?: number
          gems?: number
          lab_speed_multiplier?: number
          shards?: number
          stones?: number
          updated_at?: string
          user_id?: string
          verification_flags?: string[]
        }
        Relationships: []
      }
      lab_slots: {
        Row: {
          boost: number
          level: number
          research_id: string | null
          slot_index: number
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          boost?: number
          level?: number
          research_id?: string | null
          slot_index: number
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          boost?: number
          level?: number
          research_id?: string | null
          slot_index?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_slots_boost_fkey"
            columns: ["boost"]
            isOneToOne: false
            referencedRelation: "ref_boost_costs"
            referencedColumns: ["boost"]
          },
          {
            foreignKeyName: "lab_slots_research_id_fkey"
            columns: ["research_id"]
            isOneToOne: false
            referencedRelation: "ref_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      module_sub_effects: {
        Row: {
          locked: boolean
          module_id: string
          name: string
          sub_effect_id: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          locked?: boolean
          module_id: string
          name: string
          sub_effect_id: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          locked?: boolean
          module_id?: string
          name?: string
          sub_effect_id?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_sub_effects_tier_fkey"
            columns: ["tier"]
            isOneToOne: false
            referencedRelation: "ref_module_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_sub_effects_user_id_module_id_fkey"
            columns: ["user_id", "module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["user_id", "module_id"]
          },
        ]
      }
      modules: {
        Row: {
          module_id: string
          name: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          module_id: string
          name: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          module_id?: string
          name?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_tier_fkey"
            columns: ["tier"]
            isOneToOne: false
            referencedRelation: "ref_module_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          experiment_completed_run_ids: string[]
          experiment_required_runs: number | null
          experiment_tier: number | null
          id: string
          name: string
          notes: string | null
          status: string
          target_amount: number | null
          target_level: number | null
          target_research_id: string | null
          target_resource: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          experiment_completed_run_ids?: string[]
          experiment_required_runs?: number | null
          experiment_tier?: number | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          target_amount?: number | null
          target_level?: number | null
          target_research_id?: string | null
          target_resource?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          experiment_completed_run_ids?: string[]
          experiment_required_runs?: number | null
          experiment_tier?: number | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          target_amount?: number | null
          target_level?: number | null
          target_research_id?: string | null
          target_resource?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ref_boost_costs: {
        Row: {
          boost: number
          cell_cost: number
        }
        Insert: {
          boost: number
          cell_cost: number
        }
        Update: {
          boost?: number
          cell_cost?: number
        }
        Relationships: []
      }
      ref_cell_anchors: {
        Row: {
          cum_cells: number
          wave: number
        }
        Insert: {
          cum_cells: number
          wave: number
        }
        Update: {
          cum_cells?: number
          wave?: number
        }
        Relationships: []
      }
      ref_data_version: {
        Row: {
          data_version: number
          game_version: string | null
          id: boolean
          note: string | null
          updated_at: string
        }
        Insert: {
          data_version?: number
          game_version?: string | null
          id?: boolean
          note?: string | null
          updated_at?: string
        }
        Update: {
          data_version?: number
          game_version?: string | null
          id?: boolean
          note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ref_effect_channels: {
        Row: {
          domain: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          domain: string
          id: string
          label: string
          sort_order?: number
        }
        Update: {
          domain?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      ref_ideal_farming_waves: {
        Row: {
          tier: number
          wave: number
        }
        Insert: {
          tier: number
          wave: number
        }
        Update: {
          tier?: number
          wave?: number
        }
        Relationships: []
      }
      ref_labs: {
        Row: {
          category: string
          default_channel: string | null
          default_effect_kind: string | null
          default_reason: string | null
          description: string
          id: string
          max_level: number
          name: string
          sort_order: number
          updated_at: string
          wiki_url: string | null
        }
        Insert: {
          category: string
          default_channel?: string | null
          default_effect_kind?: string | null
          default_reason?: string | null
          description?: string
          id: string
          max_level: number
          name: string
          sort_order?: number
          updated_at?: string
          wiki_url?: string | null
        }
        Update: {
          category?: string
          default_channel?: string | null
          default_effect_kind?: string | null
          default_reason?: string | null
          description?: string
          id?: string
          max_level?: number
          name?: string
          sort_order?: number
          updated_at?: string
          wiki_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ref_labs_default_channel_fkey"
            columns: ["default_channel"]
            isOneToOne: false
            referencedRelation: "ref_effect_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      ref_lab_levels: {
        Row: {
          base_time_seconds: number
          coin_cost: number | null
          created_at: string
          lab_id: string
          level: number
        }
        Insert: {
          base_time_seconds: number
          coin_cost?: number | null
          created_at?: string
          lab_id: string
          level: number
        }
        Update: {
          base_time_seconds?: number
          coin_cost?: number | null
          created_at?: string
          lab_id?: string
          level?: number
        }
        Relationships: [
          {
            foreignKeyName: "ref_lab_levels_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "ref_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      ref_module_tiers: {
        Row: {
          id: string
          sort_order: number
        }
        Insert: {
          id: string
          sort_order: number
        }
        Update: {
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      ref_tournament_leagues: {
        Row: {
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          id: string
          label: string
          sort_order: number
        }
        Update: {
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      ref_tournament_rewards: {
        Row: {
          gems: number
          keys: number
          league: string
          rank_max: number
          rank_min: number
          stones: number
        }
        Insert: {
          gems?: number
          keys?: number
          league: string
          rank_max: number
          rank_min: number
          stones?: number
        }
        Update: {
          gems?: number
          keys?: number
          league?: string
          rank_max?: number
          rank_min?: number
          stones?: number
        }
        Relationships: [
          {
            foreignKeyName: "ref_tournament_rewards_league_fkey"
            columns: ["league"]
            isOneToOne: false
            referencedRelation: "ref_tournament_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      ref_uw_configs: {
        Row: {
          description: string
          id: string
          name: string
          short_name: string
          sort_order: number
          theme_color: string | null
          updated_at: string
          wiki_url: string | null
        }
        Insert: {
          description?: string
          id: string
          name: string
          short_name: string
          sort_order?: number
          theme_color?: string | null
          updated_at?: string
          wiki_url?: string | null
        }
        Update: {
          description?: string
          id?: string
          name?: string
          short_name?: string
          sort_order?: number
          theme_color?: string | null
          updated_at?: string
          wiki_url?: string | null
        }
        Relationships: []
      }
      ref_uw_stats: {
        Row: {
          default_val: number
          label: string
          levels: Json | null
          max_val: number | null
          min_val: number | null
          stat_index: number
          step: number | null
          unit: string
          uw_id: string
        }
        Insert: {
          default_val: number
          label: string
          levels?: Json | null
          max_val?: number | null
          min_val?: number | null
          stat_index: number
          step?: number | null
          unit?: string
          uw_id: string
        }
        Update: {
          default_val?: number
          label?: string
          levels?: Json | null
          max_val?: number | null
          min_val?: number | null
          stat_index?: number
          step?: number | null
          unit?: string
          uw_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ref_uw_stats_uw_id_fkey"
            columns: ["uw_id"]
            isOneToOne: false
            referencedRelation: "ref_uw_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      research_catalog_entries: {
        Row: {
          base_time_seconds: number
          change_label: string
          coin_cost: number
          effect_channel: string | null
          effect_from: number | null
          effect_kind: string | null
          effect_to: number | null
          estimated_impact: number | null
          lab_id: string
          level: number
          name: string
          reason: string | null
          target_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_time_seconds?: number
          change_label?: string
          coin_cost?: number
          effect_channel?: string | null
          effect_from?: number | null
          effect_kind?: string | null
          effect_to?: number | null
          estimated_impact?: number | null
          lab_id: string
          level?: number
          name: string
          reason?: string | null
          target_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_time_seconds?: number
          change_label?: string
          coin_cost?: number
          effect_channel?: string | null
          effect_from?: number | null
          effect_kind?: string | null
          effect_to?: number | null
          estimated_impact?: number | null
          lab_id?: string
          level?: number
          name?: string
          reason?: string | null
          target_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_catalog_entries_effect_channel_fkey"
            columns: ["effect_channel"]
            isOneToOne: false
            referencedRelation: "ref_effect_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          battle_date: string | null
          content_hash: string
          created_at: string
          deleted_at: string | null
          dissonance_multiplier: number
          entered_date: string | null
          excluded: boolean
          fields: Json
          game_time_sec: number
          game_version: string | null
          id: string
          imported_at: string
          killed_by: string
          notes: string
          parser_version: number
          raw: Json
          raw_text: string | null
          real_time_sec: number
          run_type: string
          tier: number
          tier_suffix: string | null
          tournament_result_id: string | null
          updated_at: string
          user_id: string
          wave: number
        }
        Insert: {
          battle_date?: string | null
          content_hash: string
          created_at?: string
          deleted_at?: string | null
          dissonance_multiplier?: number
          entered_date?: string | null
          excluded?: boolean
          fields?: Json
          game_time_sec?: number
          game_version?: string | null
          id?: string
          imported_at?: string
          killed_by?: string
          notes?: string
          parser_version?: number
          raw?: Json
          raw_text?: string | null
          real_time_sec?: number
          run_type?: string
          tier: number
          tier_suffix?: string | null
          tournament_result_id?: string | null
          updated_at?: string
          user_id: string
          wave: number
        }
        Update: {
          battle_date?: string | null
          content_hash?: string
          created_at?: string
          deleted_at?: string | null
          dissonance_multiplier?: number
          entered_date?: string | null
          excluded?: boolean
          fields?: Json
          game_time_sec?: number
          game_version?: string | null
          id?: string
          imported_at?: string
          killed_by?: string
          notes?: string
          parser_version?: number
          raw?: Json
          raw_text?: string | null
          real_time_sec?: number
          run_type?: string
          tier?: number
          tier_suffix?: string | null
          tournament_result_id?: string | null
          updated_at?: string
          user_id?: string
          wave?: number
        }
        Relationships: [
          {
            foreignKeyName: "runs_tournament_result_id_fkey"
            columns: ["tournament_result_id"]
            isOneToOne: false
            referencedRelation: "tournament_results"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_results: {
        Row: {
          created_at: string
          deleted_at: string | null
          event_date: string
          id: string
          league: string | null
          max_wave: number | null
          notes: string | null
          rank: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          event_date: string
          id?: string
          league?: string | null
          max_wave?: number | null
          notes?: string | null
          rank?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          event_date?: string
          id?: string
          league?: string | null
          max_wave?: number | null
          notes?: string | null
          rank?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_results_league_fkey"
            columns: ["league"]
            isOneToOne: false
            referencedRelation: "ref_tournament_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      ultimate_weapons: {
        Row: {
          active: boolean
          level: number
          stat1: number | null
          stat2: number | null
          stat3: number | null
          unlocked: boolean
          updated_at: string
          user_id: string
          uw_id: string
        }
        Insert: {
          active?: boolean
          level?: number
          stat1?: number | null
          stat2?: number | null
          stat3?: number | null
          unlocked?: boolean
          updated_at?: string
          user_id: string
          uw_id: string
        }
        Update: {
          active?: boolean
          level?: number
          stat1?: number | null
          stat2?: number | null
          stat3?: number | null
          unlocked?: boolean
          updated_at?: string
          user_id?: string
          uw_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ultimate_weapons_uw_id_fkey"
            columns: ["uw_id"]
            isOneToOne: false
            referencedRelation: "ref_uw_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      tournament_rewards: {
        Args: { p_league: string; p_rank: number }
        Returns: {
          gems: number
          keys: number
          stones: number
        }[]
      }
      uuid_generate_v7: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
