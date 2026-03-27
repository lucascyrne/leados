import type { CategoriaLead, StatusLead } from './lead'

/** JSON aceite em colunas `jsonb`. */
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
      profiles: {
        Row: {
          id: string
          role: 'user' | 'admin'
          updated_at: string | null
        }
        Insert: {
          id: string
          role?: 'user' | 'admin'
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: 'user' | 'admin'
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          renda_mensal: number
          valor_desejado: number
          parcela_desejada: number
          objetivo: string
          prazo_inicio: string | null
          score: number
          categoria: CategoriaLead
          status: StatusLead
          partner_name?: string | null
          partner_agent_name?: string | null
          partner_link?: string | null
          consent_lgpd?: boolean | null
          consent_text_version?: string | null
          handoff_status?: 'pending' | 'viewed' | 'clicked' | 'completed' | 'abandoned' | null
          created_at: string
        }
        Insert: {
          nome: string
          email: string
          telefone?: string | null
          renda_mensal: number
          valor_desejado: number
          parcela_desejada: number
          objetivo?: string
          prazo_inicio?: string | null
          score: number
          categoria: CategoriaLead
          partner_name?: string | null
          partner_agent_name?: string | null
          partner_link?: string | null
          consent_lgpd?: boolean | null
          consent_text_version?: string | null
          handoff_status?: 'pending' | 'viewed' | 'clicked' | 'completed' | 'abandoned' | null
        }
        Update: {
          nome?: string
          email?: string
          telefone?: string | null
          renda_mensal?: number
          valor_desejado?: number
          parcela_desejada?: number
          objetivo?: string
          prazo_inicio?: string | null
          score?: number
          categoria?: CategoriaLead
          status?: StatusLead
          partner_name?: string | null
          partner_agent_name?: string | null
          partner_link?: string | null
          consent_lgpd?: boolean | null
          consent_text_version?: string | null
          handoff_status?: 'pending' | 'viewed' | 'clicked' | 'completed' | 'abandoned' | null
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          id: string
          lead_id: string | null
          tipo: string
          payload: Json | null
          created_at: string
        }
        Insert: {
          lead_id?: string | null
          tipo: string
          payload?: Json | null
        }
        Update: {
          lead_id?: string | null
          tipo?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'interacoes_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      notification_jobs: {
        Row: {
          id: string
          lead_id: string | null
          event_type: string
          channel: string
          payload: Json
          status: 'pending' | 'retrying' | 'sent' | 'failed' | 'dead_letter'
          attempts: number
          max_attempts: number
          next_retry_at: string
          idempotency_key: string
          last_error: string | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          event_type?: string
          channel?: string
          payload: Json
          status?: 'pending' | 'retrying' | 'sent' | 'failed' | 'dead_letter'
          attempts?: number
          max_attempts?: number
          next_retry_at?: string
          idempotency_key: string
          last_error?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          event_type?: string
          channel?: string
          payload?: Json
          status?: 'pending' | 'retrying' | 'sent' | 'failed' | 'dead_letter'
          attempts?: number
          max_attempts?: number
          next_retry_at?: string
          idempotency_key?: string
          last_error?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_jobs_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_public_lead: {
        Args: {
          p_nome: string
          p_email: string
          p_telefone: string | null
          p_renda_mensal: number
          p_valor_desejado: number
          p_parcela_desejada: number
          p_objetivo: string
          p_prazo_inicio: string | null
          p_score: number
          p_categoria: CategoriaLead
        }
        Returns: {
          id: string
          nome: string
          email: string
          telefone: string | null
          renda_mensal: number
          valor_desejado: number
          parcela_desejada: number
          objetivo: string
          prazo_inicio: string | null
          score: number
          categoria: CategoriaLead
          status: StatusLead
          created_at: string
        }
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
