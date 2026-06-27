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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          body: string
          category: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          category?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          id: string
          program_id: string
          ticket_tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          ticket_tier?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          ticket_tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          message: string
          name: string
          university: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          message: string
          name: string
          university?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          message?: string
          name?: string
          university?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          created_at: string
          feedback_id: string | null
          id: string
          reason: string
          reporter_id: string | null
          resolved: boolean
        }
        Insert: {
          created_at?: string
          feedback_id?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          resolved?: boolean
        }
        Update: {
          created_at?: string
          feedback_id?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reports_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      gala_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          institution: string | null
          pass_id: string
          phone: string | null
          program_id: string | null
          ticket_tier: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          institution?: string | null
          pass_id: string
          phone?: string | null
          program_id?: string | null
          ticket_tier?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          institution?: string | null
          pass_id?: string
          phone?: string | null
          program_id?: string | null
          ticket_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "gala_registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_inquiries: {
        Row: {
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string
          organization: string
          partnership_type: string | null
          phone: string | null
          proposal_url: string | null
          status: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message: string
          organization: string
          partnership_type?: string | null
          phone?: string | null
          proposal_url?: string | null
          status?: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          organization?: string
          partnership_type?: string | null
          phone?: string | null
          proposal_url?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course: string | null
          created_at: string
          disability_type: string | null
          full_name: string
          gender: string | null
          has_disability: boolean
          id: string
          member_id: string
          member_number: number
          phone: string | null
          university: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          disability_type?: string | null
          full_name: string
          gender?: string | null
          has_disability?: boolean
          id: string
          member_id: string
          member_number: number
          phone?: string | null
          university: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course?: string | null
          created_at?: string
          disability_type?: string | null
          full_name?: string
          gender?: string | null
          has_disability?: boolean
          id?: string
          member_id?: string
          member_number?: number
          phone?: string | null
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          event_date: string | null
          id: string
          is_published: boolean
          location: string | null
          overview: string | null
          pillar: string | null
          ticket_regular: number | null
          ticket_url: string | null
          ticket_vip: number | null
          ticket_vvip: number | null
          title: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          event_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          overview?: string | null
          pillar?: string | null
          ticket_regular?: number | null
          ticket_url?: string | null
          ticket_vip?: number | null
          ticket_vvip?: number | null
          title: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          overview?: string | null
          pillar?: string | null
          ticket_regular?: number | null
          ticket_url?: string | null
          ticket_vip?: number | null
          ticket_vvip?: number | null
          title?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          approved: boolean
          category: string
          created_at: string
          id: string
          message: string
          name: string
          university: string | null
          upvotes: number
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          category?: string
          created_at?: string
          id?: string
          message: string
          name: string
          university?: string | null
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          category?: string
          created_at?: string
          id?: string
          message?: string
          name?: string
          university?: string | null
          upvotes?: number
          user_id?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      university_votes: {
        Row: {
          created_at: string
          id: string
          university_name: string
          voter_fingerprint: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          university_name: string
          voter_fingerprint?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          university_name?: string
          voter_fingerprint?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      university_vote_counts: {
        Row: {
          university_name: string | null
          votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
  public: {
    Enums: {
      app_role: ["admin", "member"],
    },
  },
} as const
