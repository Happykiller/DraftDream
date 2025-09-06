// src\service\db\db.service.ts

export interface BddService{
  /**
   * Default
   */
  test(): Promise<boolean>;
  initConnection(): Promise<void>;
}
