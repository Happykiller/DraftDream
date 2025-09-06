// src\services\db\mongo\db.service.mongo.ts
import { applyInstanceMixins } from "@src/common/applyInstanceMixins";
import { BddServiceInitMongo } from "@services/db/mongo/db.service.init.mongo";
import { BddServiceTestMongo } from "@services/db/mongo/db.service.test.mongo";

// src\service\db\mongo\db.service.mongo.ts
class BddServiceMongo {
  constructor(inversify:any, config:any) {
    applyInstanceMixins(this, [
      BddServiceInitMongo,
      BddServiceTestMongo
    ], [inversify, config]);
  }
}

export { BddServiceMongo };
