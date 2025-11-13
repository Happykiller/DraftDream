import { Db, ObjectId } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

interface SessionSeed {
  slug: string;
  locale: 'fr';
  label: string;
  durationMin: number;
  description?: string;
  exerciseSlugs: string[];
}

const SESSION_SEEDS: SessionSeed[] = [
  {
    slug: 'full-body-debutant',
    locale: 'fr',
    label: 'Full body decouverte',
    durationMin: 40,
    description:
      'Circuit complet pour debuter avec des mouvements polyarticulaires et du gainage.',
    exerciseSlugs: ['pompes-classiques', 'squat-barre', 'gainage-planche'],
  },
  {
    slug: 'force-bas-du-corps',
    locale: 'fr',
    label: 'Force bas du corps',
    durationMin: 45,
    description:
      'Seance ciblee sur les membres inferieurs avec accent sur la force et l explosivite.',
    exerciseSlugs: ['squat-barre', 'souleve-de-terre-kettlebell', 'burpees'],
  },
  {
    slug: 'dos-et-cardio-intense',
    locale: 'fr',
    label: 'Dos et cardio intense',
    durationMin: 35,
    description:
      'Enchainement tirage et cardio ideal pour travailler le dos tout en gardant un rythme eleve.',
    exerciseSlugs: ['rowing-halteres', 'pompes-classiques', 'burpees'],
  },
];

function buildExerciseLookup(
  exercises: { _id: ObjectId; slug: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const doc of exercises) {
    if (!doc.slug) continue;
    map.set(doc.slug, doc._id.toHexString());
  }
  if (map.size === 0) {
    throw new Error('No exercises found to build session seeds.');
  }
  return map;
}

function resolveExerciseIds(
  slugs: string[],
  lookup: Map<string, string>
): string[] {
  return slugs.map((slug) => {
    const id = lookup.get(slug);
    if (!id) {
      throw new Error(
        `Missing exercise with slug "${slug}" required for session seeds.`
      );
    }
    return id;
  });
}

const migration: Migration = {
  id: '0006_seeds_session',
  description: 'Seed base sessions (locale=fr) reusing seeded exercises',

  async up(db: Db, log) {
    const sessionsCol = db.collection('sessions');
    await sessionsCol.createIndexes([
      {
        key: { slug: 1, locale: 1 },
        name: 'uniq_active_slug_locale',
        unique: true,
      },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      { key: { deletedAt: 1 }, name: 'by_deletedAt' },
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { locale: 1 }, name: 'by_locale' },
    ]);
    log('sessions indexes ensured');

    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } }
    );
    if (!admin?._id) {
      throw new Error(
        'Admin user not found (email: "admin@fitdesk.com"). Run admin migration first.'
      );
    }
    const createdBy = admin._id;

    const exercises = await db
      .collection<{ _id: ObjectId; slug: string }>('exercises')
      .find({ locale: 'fr' }, { projection: { _id: 1, slug: 1 } })
      .toArray();
    const exercisesBySlug = buildExerciseLookup(exercises);

    const now = new Date();
    const ops = SESSION_SEEDS.map((seed) => {
      const exerciseIds = resolveExerciseIds(seed.exerciseSlugs, exercisesBySlug);

      const setData: Record<string, unknown> = {
        label: seed.label,
        durationMin: seed.durationMin,
        description: seed.description,
        exerciseIds,
        updatedAt: now,
      };

      return {
        updateOne: {
          filter: { slug: seed.slug, locale: seed.locale },
          update: {
            $setOnInsert: {
              slug: seed.slug,
              locale: seed.locale,
              createdBy,
              createdAt: now,
            },
            $set: setData,
          },
          upsert: true,
        },
      };
    });

    const res = await sessionsCol.bulkWrite(ops, { ordered: false });
    log(
      `sessions upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`
    );
  },
};

export default migration;
