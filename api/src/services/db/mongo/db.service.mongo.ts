// src\services\db\mongo\db.service.mongo.ts
import { applyInstanceMixins } from "@src/common/applyInstanceMixins";
import { BddServiceInitMongo } from "@services/db/mongo/db.service.init.mongo";
import { BddServiceTestMongo } from "@services/db/mongo/db.service.test.mongo";
import { BddServiceUserMongo } from "@services/db/mongo/user/service.db.mongo.user";

// src\service\db\mongo\db.service.mongo.ts
class BddServiceMongo {
  constructor(inversify:any, config:any) {
    applyInstanceMixins(this, [
      BddServiceInitMongo,
      BddServiceTestMongo,
      BddServiceUserMongo
    ], [inversify, config]);
  }
}

export { BddServiceMongo };
