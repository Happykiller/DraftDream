// src/common/program-record-state.enum.ts
// Centralized program record states to keep transitions consistent.
export enum ProgramRecordState {
  CREATE = 'CREATE',
  DRAFT = 'DRAFT',
  FINISH = 'FINISH',
}

export type ProgramRecordStateValue = `${ProgramRecordState}`;
