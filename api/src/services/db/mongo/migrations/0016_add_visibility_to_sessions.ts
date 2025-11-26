import * as mongoDB from 'mongodb';
import { Migration } from '../migration.runner.mongo';

const migration: Migration = {
    id: '0016_add_visibility_to_sessions',
    description: 'Add visibility field to sessions (default: public)',
    async up(db: mongoDB.Db, log: (msg: string) => void) {
        const collection = db.collection('sessions');

        const result = await collection.updateMany(
            { visibility: { $exists: false } },
            { $set: { visibility: 'public' } }
        );

        log(`Updated ${result.modifiedCount} sessions with visibility='public'.`);
    },
};

export default migration;
