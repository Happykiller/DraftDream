// src/migrations/0004_create_admin.ts
import { Db } from "mongodb";
import { Migration } from "@services/db/mongo/migration.runner.mongo";

const migration: Migration = {
  id: "0001_create_admin",
  description: "Create initial admin user (admin@fitdesk.com)",

  async up(db: Db, log) {
    const users = db.collection("users");

    const adminDoc = {
      type: "admin",
      first_name: "admin",
      last_name: "admin",
      email: "admin@fitdesk.com",
      phone: "+33683786804",
      password: "$argon2id$v=19$m=19456,t=3,p=1$vRKlEa/nt1vN0GtCuSpV/g$YQ7pSluenBK3d04n/d+7Ah0+5r58dU+wc6ZMfS3ft28",
      address: {
        name: "35 chemin du chapitre",
        city: "Grenoble",
        code: "38100",
        country: "FR",
      },
      company: {
        name: "FitDesk SAS",
        address: {
          name: "35 chemin du chapitre",
          city: "Grenoble",
          code: "38100",
          country: "FR",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      schemaVersion: 1,
    };

    // Vérifie si déjà présent
    const existing = await users.findOne({ email: adminDoc.email });
    if (existing) {
      log("Admin user already exists, skip.");
      return;
    }

    await users.insertOne(adminDoc);
    log("Admin user created ✅");
  },
};

export default migration;
