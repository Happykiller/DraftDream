// src\services\db\mongo\db.service.mongo.ts
import { applyInstanceMixins } from "@src/common/applyInstanceMixins";
import { BddServiceMuscleMongo } from "@src/services/db/mongo/repositories/muscle.repository";
import { BddServiceInitMongo } from "@services/db/mongo/db.service.init.mongo";
import { BddServiceTestMongo } from "@services/db/mongo/db.service.test.mongo";
import { BddServiceUserMongo } from "@src/services/db/mongo/repositories/user.repository";
import { BddServiceCategoryMongo } from "./repositories/category.repository";
import { BddServiceEquipmentMongo } from "./repositories/equipment.repository";
import { BddServiceTagMongo } from "./repositories/tag.repository";

// src\service\db\mongo\db.service.mongo.ts
class BddServiceMongo {
  constructor(inversify:any, config:any) {
    applyInstanceMixins(this, [
      BddServiceInitMongo,
      BddServiceTestMongo,
      BddServiceUserMongo,
      BddServiceMuscleMongo,
      BddServiceCategoryMongo,
      BddServiceEquipmentMongo,
      BddServiceTagMongo
    ], [inversify, config]);
  }
}

export { BddServiceMongo };
