import { Db, ObjectId } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

type ExerciseSeed = {
  slug: string;
  locale: 'fr';
  name: string;
  description?: string;
  instructions?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public';
  categorySlug: string;
  primaryMuscleSlugs: string[];
  secondaryMuscleSlugs?: string[];
  equipmentSlugs?: string[];
};

const EXERCISE_SEEDS: ExerciseSeed[] = [
  {
    slug: 'pompes-classiques',
    locale: 'fr',
    name: 'Pompes classiques',
    description: 'Poussee au poids du corps pour renforcer poitrine et triceps.',
    instructions:
      'Positionnez vos mains sous vos epaules, gainez tout le corps et descendez la poitrine vers le sol avant de repousser.',
    level: 'beginner',
    series: '3',
    repetitions: '10-12',
    rest: 60,
    visibility: 'public',
    categorySlug: 'haut-du-corps',
    primaryMuscleSlugs: ['pectoraux'],
    secondaryMuscleSlugs: ['triceps', 'epaules'],
  },
  {
    slug: 'squat-barre',
    locale: 'fr',
    name: 'Squat a la barre',
    description: 'Mouvement fondamental de force pour le bas du corps.',
    instructions:
      'Placez la barre sur vos trapezes, descendez en gardant le buste droit et poussez dans le sol pour remonter.',
    level: 'intermediate',
    series: '4',
    repetitions: '6-8',
    rest: 120,
    charge: 'Barre chargee',
    visibility: 'public',
    categorySlug: 'bas-du-corps',
    primaryMuscleSlugs: ['quadriceps'],
    secondaryMuscleSlugs: ['ischio-jambiers', 'fessiers'],
    equipmentSlugs: ['barre'],
  },
  {
    slug: 'souleve-de-terre-kettlebell',
    locale: 'fr',
    name: 'Souleve de terre kettlebell',
    description: 'Variante hinge pour renforcer chaine posterieure et gainage.',
    instructions:
      'Charniere de hanches, dos neutre, poussez les hanches vers l arriere puis contractez les fessiers pour revenir debout.',
    level: 'intermediate',
    series: '3',
    repetitions: '8-10',
    rest: 90,
    visibility: 'public',
    categorySlug: 'full-body',
    primaryMuscleSlugs: ['ischio-jambiers', 'fessiers'],
    secondaryMuscleSlugs: ['dos', 'dorsaux'],
    equipmentSlugs: ['kettlebell'],
  },
  {
    slug: 'gainage-planche',
    locale: 'fr',
    name: 'Gainage planche',
    description: 'Exercice de gainage statique pour le centre du corps.',
    instructions:
      'Sur les avant-bras et la pointe des pieds, maintenez une ligne droite des epaules aux chevilles.',
    level: 'beginner',
    series: '3',
    repetitions: '40-60s',
    rest: 60,
    visibility: 'public',
    categorySlug: 'core',
    primaryMuscleSlugs: ['abdominaux'],
    secondaryMuscleSlugs: ['obliques'],
  },
  {
    slug: 'burpees',
    locale: 'fr',
    name: 'Burpees',
    description: 'Mouvement explosif complet pour l endurance cardio et musculaire.',
    instructions:
      'Depuis la position debout, descendez en squat, jetez les pieds en arriere pour une planche, effectuez une pompe puis revenez avec un saut vertical.',
    level: 'advanced',
    series: '5',
    repetitions: '12-15',
    rest: 75,
    visibility: 'public',
    categorySlug: 'cardio',
    primaryMuscleSlugs: ['cardio'],
    secondaryMuscleSlugs: ['pectoraux', 'quadriceps'],
  },
  {
    slug: 'rowing-halteres',
    locale: 'fr',
    name: 'Rowing halteres',
    description: 'Tirage incline pour renforcer le dos et l arriere des epaules.',
    instructions:
      'Buste penche, dos plat, tirez les halteres vers vos hanches en serrant les omoplates.',
    level: 'intermediate',
    series: '4',
    repetitions: '10-12',
    rest: 75,
    visibility: 'public',
    categorySlug: 'haut-du-corps',
    primaryMuscleSlugs: ['dos'],
    secondaryMuscleSlugs: ['dorsaux', 'biceps'],
    equipmentSlugs: ['halteres'],
  },
];

function buildLookup<T extends { slug: string; _id: ObjectId }>(
  docs: T[],
  label: string
): Map<string, ObjectId> {
  const map = new Map<string, ObjectId>();
  for (const doc of docs) {
    if (!doc.slug) continue;
    map.set(doc.slug, doc._id);
  }
  if (map.size === 0) {
    throw new Error(`No ${label} found to build exercise seeds.`);
  }
  return map;
}

function getId(map: Map<string, ObjectId>, slug: string, type: string): ObjectId {
  const id = map.get(slug);
  if (!id) {
    throw new Error(`Missing ${type} with slug "${slug}" required for exercise seeds.`);
  }
  return id;
}

const migration: Migration = {
  id: '0005_seeds_exercise',
  description: 'Seed base exercises (locale=fr) reusing categories, muscles, equipments',

  async up(db: Db, log) {
    const exercisesCol = db.collection('exercises');
    await exercisesCol.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_active_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { visibility: 1 }, name: 'by_visibility' },
      { key: { level: 1 }, name: 'by_level' },
    ]);
    log('exercises indexes ensured');

    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } }
    );
    if (!admin?._id) {
      throw new Error('Admin user not found (email: "admin@fitdesk.com"). Run admin migration first.');
    }
    const createdBy = admin._id as ObjectId;

    const [categories, muscles, equipments] = await Promise.all([
      db
        .collection<{ _id: ObjectId; slug: string }>('categories')
        .find({ locale: 'fr' }, { projection: { _id: 1, slug: 1 } })
        .toArray(),
      db
        .collection<{ _id: ObjectId; slug: string }>('muscles')
        .find({ locale: 'fr' }, { projection: { _id: 1, slug: 1 } })
        .toArray(),
      db
        .collection<{ _id: ObjectId; slug: string }>('equipments')
        .find({ locale: 'fr' }, { projection: { _id: 1, slug: 1 } })
        .toArray(),
    ]);

    const categoriesBySlug = buildLookup(categories, 'categories');
    const musclesBySlug = buildLookup(muscles, 'muscles');
    const equipmentsBySlug = buildLookup(equipments, 'equipments');

    const now = new Date();
    const ops = EXERCISE_SEEDS.map((seed) => {
      const categoryId = getId(categoriesBySlug, seed.categorySlug, 'category');
      const primaryMuscles = seed.primaryMuscleSlugs.map((slug) =>
        getId(musclesBySlug, slug, 'primary muscle')
      );
      const secondaryMuscles = (seed.secondaryMuscleSlugs ?? []).map((slug) =>
        getId(musclesBySlug, slug, 'secondary muscle')
      );
      const equipmentIds = (seed.equipmentSlugs ?? []).map((slug) =>
        getId(equipmentsBySlug, slug, 'equipment')
      );

      const setData: Record<string, unknown> = {
        name: seed.name,
        description: seed.description,
        instructions: seed.instructions,
        level: seed.level,
        series: seed.series,
        repetitions: seed.repetitions,
        visibility: seed.visibility,
        category: categoryId,
        primaryMuscles,
        secondaryMuscles,
        equipment: equipmentIds,
        tags: [],
        updatedAt: now,
      };
      if (seed.rest !== undefined) setData.rest = seed.rest;
      if (seed.charge !== undefined) setData.charge = seed.charge;
      if (seed.videoUrl !== undefined) setData.videoUrl = seed.videoUrl;

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

    const res = await exercisesCol.bulkWrite(ops, { ordered: false });
    log(`exercises upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`);
  },
};

export default migration;


