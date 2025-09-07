// src\service\db\db.service.ts

import { NewUser, UserPojo } from "@services/db/mongo/user/service.db.mongo.user";

export interface BddService{
  /**
   * Default
   */
  test(): Promise<boolean>;
  initConnection(): Promise<void>;
  /**
   * User
   */
  createUser(input: NewUser): Promise<UserPojo>
}
