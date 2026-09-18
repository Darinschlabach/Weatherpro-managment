export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "user";
export type ContactType = "Contractors" | "Customers" | "Employees" | "Vendors";
export type ContactPersonPosition = "owner" | "designer" | "receptionist" | "accounting" | "installation";

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: AppRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProfileRecord = Profile & Record<string, unknown>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          display_name?: string;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          display_name?: string;
          role?: AppRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          fax: string | null;
          address: string | null;
          date_of_birth: string | null;
          contact_type: ContactType;
          created_at: string;
          updated_at: string;
        } & Record<string, unknown>;
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          fax?: string | null;
          address?: string | null;
          date_of_birth?: string | null;
          contact_type?: ContactType;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          fax?: string | null;
          address?: string | null;
          date_of_birth?: string | null;
          contact_type?: ContactType;
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Relationships: [];
      };
      contact_people: {
        Row: {
          id: string;
          contact_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          positions: ContactPersonPosition[];
          created_at: string;
          updated_at: string;
        } & Record<string, unknown>;
        Insert: {
          id?: string;
          contact_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          positions?: ContactPersonPosition[];
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Update: {
          id?: string;
          contact_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          positions?: ContactPersonPosition[];
          created_at?: string;
          updated_at?: string;
        } & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      contact_type: ContactType;
      contact_person_position: ContactPersonPosition;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
