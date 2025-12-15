export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            chapters: {
                Row: {
                    caption: string;
                    completed: boolean | null;
                    content_points: string[] | null;
                    course_id: string;
                    created_at: string | null;
                    id: string;
                    image_url: string | null;
                    index: number;
                    jsx_content: string;
                    key_takeaways: string[] | null;
                    note: string | null;
                    summary: string | null;
                    time_minutes: number | null;
                };
                Insert: {
                    caption: string;
                    completed?: boolean | null;
                    content_points?: string[] | null;
                    course_id: string;
                    created_at?: string | null;
                    id?: string;
                    image_url?: string | null;
                    index: number;
                    jsx_content?: string;
                    key_takeaways?: string[] | null;
                    note?: string | null;
                    summary?: string | null;
                    time_minutes?: number | null;
                };
                Update: {
                    caption?: string;
                    completed?: boolean | null;
                    content_points?: string[] | null;
                    course_id?: string;
                    created_at?: string | null;
                    id?: string;
                    image_url?: string | null;
                    index?: number;
                    jsx_content?: string;
                    key_takeaways?: string[] | null;
                    note?: string | null;
                    summary?: string | null;
                    time_minutes?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "chapters_course_id_fkey";
                        columns: ["course_id"];
                        isOneToOne: false;
                        referencedRelation: "courses";
                        referencedColumns: ["id"];
                    },
                ];
            };
            courses: {
                Row: {
                    created_at: string | null;
                    description: string | null;
                    difficulty: string | null;
                    error_message: string | null;
                    id: string;
                    image_query: string | null;
                    image_url: string | null;
                    language: string | null;
                    status: string | null;
                    title: string;
                    total_time_hours: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    description?: string | null;
                    difficulty?: string | null;
                    error_message?: string | null;
                    id?: string;
                    image_query?: string | null;
                    image_url?: string | null;
                    language?: string | null;
                    status?: string | null;
                    title: string;
                    total_time_hours?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    description?: string | null;
                    difficulty?: string | null;
                    error_message?: string | null;
                    id?: string;
                    image_query?: string | null;
                    image_url?: string | null;
                    language?: string | null;
                    status?: string | null;
                    title?: string;
                    total_time_hours?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            document_embeddings: {
                Row: {
                    content: string;
                    content_id: string;
                    course_id: string;
                    created_at: string | null;
                    embedding: string | null;
                    id: string;
                    metadata: Json | null;
                };
                Insert: {
                    content: string;
                    content_id: string;
                    course_id: string;
                    created_at?: string | null;
                    embedding?: string | null;
                    id?: string;
                    metadata?: Json | null;
                };
                Update: {
                    content?: string;
                    content_id?: string;
                    course_id?: string;
                    created_at?: string | null;
                    embedding?: string | null;
                    id?: string;
                    metadata?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "document_embeddings_course_id_fkey";
                        columns: ["course_id"];
                        isOneToOne: false;
                        referencedRelation: "courses";
                        referencedColumns: ["id"];
                    },
                ];
            };
            profiles: {
                Row: {
                    avatar_url: string | null;
                    created_at: string | null;
                    email: string | null;
                    full_name: string | null;
                    id: string;
                    updated_at: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    created_at?: string | null;
                    email?: string | null;
                    full_name?: string | null;
                    id: string;
                    updated_at?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    created_at?: string | null;
                    email?: string | null;
                    full_name?: string | null;
                    id?: string;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            questions: {
                Row: {
                    answer_a: string | null;
                    answer_b: string | null;
                    answer_c: string | null;
                    answer_d: string | null;
                    chapter_id: string;
                    correct_answer: string;
                    created_at: string | null;
                    explanation: string | null;
                    grading_criteria: string | null;
                    id: string;
                    index: number;
                    question: string;
                    type: string;
                };
                Insert: {
                    answer_a?: string | null;
                    answer_b?: string | null;
                    answer_c?: string | null;
                    answer_d?: string | null;
                    chapter_id: string;
                    correct_answer: string;
                    created_at?: string | null;
                    explanation?: string | null;
                    grading_criteria?: string | null;
                    id?: string;
                    index?: number;
                    question: string;
                    type: string;
                };
                Update: {
                    answer_a?: string | null;
                    answer_b?: string | null;
                    answer_c?: string | null;
                    answer_d?: string | null;
                    chapter_id?: string;
                    correct_answer?: string;
                    created_at?: string | null;
                    explanation?: string | null;
                    grading_criteria?: string | null;
                    id?: string;
                    index?: number;
                    question?: string;
                    type?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "questions_chapter_id_fkey";
                        columns: ["chapter_id"];
                        isOneToOne: false;
                        referencedRelation: "chapters";
                        referencedColumns: ["id"];
                    },
                ];
            };
            user_progress: {
                Row: {
                    chapter_id: string;
                    completed: boolean | null;
                    course_id: string;
                    created_at: string | null;
                    id: string;
                    quiz_completed_at: string | null;
                    quiz_score: number | null;
                    quiz_total: number | null;
                    time_spent_seconds: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    chapter_id: string;
                    completed?: boolean | null;
                    course_id: string;
                    created_at?: string | null;
                    id?: string;
                    quiz_completed_at?: string | null;
                    quiz_score?: number | null;
                    quiz_total?: number | null;
                    time_spent_seconds?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    chapter_id?: string;
                    completed?: boolean | null;
                    course_id?: string;
                    created_at?: string | null;
                    id?: string;
                    quiz_completed_at?: string | null;
                    quiz_score?: number | null;
                    quiz_total?: number | null;
                    time_spent_seconds?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_progress_chapter_id_fkey";
                        columns: ["chapter_id"];
                        isOneToOne: false;
                        referencedRelation: "chapters";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "user_progress_course_id_fkey";
                        columns: ["course_id"];
                        isOneToOne: false;
                        referencedRelation: "courses";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            search_documents: {
                Args: {
                    p_course_id: string;
                    p_limit?: number;
                    p_query_embedding: string;
                    p_threshold?: number;
                };
                Returns: {
                    content: string;
                    content_id: string;
                    metadata: Json;
                    similarity: number;
                }[];
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
