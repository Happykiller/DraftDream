// src/common/program-record-state.enum.ts
// Centralized program record states to keep transitions consistent.
export enum ProgramRecordState {
  CREATE = 'CREATE',
  IDLE = 'IDLE',
  SAVE = 'SAVE',
}

export type ProgramRecordStateValue = `${ProgramRecordState}`;
