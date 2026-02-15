// src/types/agenda.ts

/**
 * Type of agenda event
 */
export type AgendaEventType = 'workout' | 'meal' | 'health';

/**
 * Agenda event interface
 */
export interface AgendaEvent {
  id: string;
  type: AgendaEventType;
  title: string;
  startAt: string; // ISO 8601 date string
  endAt?: string; // ISO 8601 date string (optional)
}
