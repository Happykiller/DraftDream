// src/services/db/mongo/migrations/0019_fix_program_record_indexes.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
    id: '0019_fix_program_record_indexes',
    description: 'Drop strict unique indexes on program_records to allow multiple records',

    async up(db: Db, log) {
        const col = db.collection('program_records');

        // Drop the strict index from migration 0018
        try {
            if (await col.indexExists('program_records_user_program_unique')) {
                await col.dropIndex('program_records_user_program_unique');
                log('Dropped index: program_records_user_program_unique');
            }
        } catch (e: any) {
            log(`Warning dropping program_records_user_program_unique: ${e?.message}`);
        }

        // Drop the session-scoped index if it exists (from repository definition)
        try {
            if (await col.indexExists('program_records_user_program_session_unique')) {
                await col.dropIndex('program_records_user_program_session_unique');
                log('Dropped index: program_records_user_program_session_unique');
            }
        } catch (e: any) {
            log(`Warning dropping program_records_user_program_session_unique: ${e?.message}`);
        }
    },
};

export default migration;
