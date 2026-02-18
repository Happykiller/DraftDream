import { Collection, Db, Filter, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import { DailyReport } from '@services/db/models/daily-report.model';
import {
  CreateDailyReportDto,
  GetDailyReportDto,
  ListDailyReportsDto,
  UpdateDailyReportDto,
} from '@services/db/dtos/daily-report.dto';

interface DailyReportDoc {
  _id: ObjectId;
  reportDate: string;
  trainingDone: boolean;
  nutritionPlanCompliance: number;
  nutritionDeviations: boolean;
  mealCount: number;
  hydrationLiters: number;
  cravingsSnacking: boolean;
  digestiveDiscomfort: boolean;
  transitOk: boolean;
  menstruation: boolean;
  sleepHours: number;
  sleepQuality: number;
  wakeRested: boolean;
  muscleSoreness: boolean;
  waterRetention: boolean;
  energyLevel: number;
  motivationLevel: number;
  stressLevel: number;
  moodLevel: number;
  disruptiveFactor: boolean;
  painZones: string[];
  notes?: string;
  athleteId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceDailyReportMongo {
  private col(): Collection<DailyReportDoc> {
    return inversify.mongo.collection<DailyReportDoc>('daily_reports');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<DailyReportDoc>('daily_reports') : this.col();
    await collection.createIndexes([
      { key: { athleteId: 1, reportDate: -1 }, name: 'daily_reports_athleteId_reportDate' },
      { key: { createdBy: 1 }, name: 'daily_reports_createdBy' },
      { key: { reportDate: -1 }, name: 'daily_reports_reportDate' },
      { key: { deletedAt: 1 }, name: 'daily_reports_deletedAt' },
      { key: { updatedAt: -1 }, name: 'daily_reports_updatedAt' },
    ]);
  }

  async create(dto: CreateDailyReportDto): Promise<DailyReport | null> {
    const now = new Date();
    const reportDate = dto.reportDate?.trim() || this.todayAsYyyyMmDd();
    const doc: Omit<DailyReportDoc, '_id'> = {
      reportDate,
      trainingDone: dto.trainingDone,
      nutritionPlanCompliance: dto.nutritionPlanCompliance,
      nutritionDeviations: dto.nutritionDeviations,
      mealCount: dto.mealCount,
      hydrationLiters: dto.hydrationLiters,
      cravingsSnacking: dto.cravingsSnacking,
      digestiveDiscomfort: dto.digestiveDiscomfort,
      transitOk: dto.transitOk,
      menstruation: dto.menstruation,
      sleepHours: dto.sleepHours,
      sleepQuality: dto.sleepQuality,
      wakeRested: dto.wakeRested,
      muscleSoreness: dto.muscleSoreness,
      waterRetention: dto.waterRetention,
      energyLevel: dto.energyLevel,
      motivationLevel: dto.motivationLevel,
      stressLevel: dto.stressLevel,
      moodLevel: dto.moodLevel,
      disruptiveFactor: dto.disruptiveFactor,
      painZones: dto.painZones,
      notes: dto.notes?.trim() || undefined,
      athleteId: dto.athleteId,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    const res = await this.col().insertOne(doc as DailyReportDoc);
    return { id: res.insertedId.toHexString(), ...doc };
  }

  async get(dto: GetDailyReportDto): Promise<DailyReport | null> {
    const doc = await this.col().findOne({ _id: this.toObjectId(dto.id) });
    return doc ? this.toModel(doc) : null;
  }

  async list(params: ListDailyReportsDto = {}) {
    const {
      athleteId,
      athleteIds,
      createdBy,
      reportDate,
      limit = 20,
      page = 1,
      sort = { reportDate: -1, updatedAt: -1 },
    } = params;

    const filter: Filter<DailyReportDoc> = {
      deletedAt: { $exists: false },
    };

    if (athleteId?.trim()) {
      filter.athleteId = athleteId.trim();
    } else if (athleteIds?.length) {
      filter.athleteId = { $in: athleteIds };
    }

    if (createdBy?.trim()) {
      filter.createdBy = createdBy.trim();
    }

    if (reportDate?.trim()) {
      filter.reportDate = reportDate.trim();
    }

    const cursor = this.col().find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([
      cursor.toArray(),
      this.col().countDocuments(filter),
    ]);

    return {
      items: rows.map((row) => this.toModel(row)),
      total,
      page,
      limit,
    };
  }

  async update(id: string, patch: UpdateDailyReportDto): Promise<DailyReport | null> {
    const $set: Partial<DailyReportDoc> = { updatedAt: new Date() };

    if (patch.reportDate !== undefined) $set.reportDate = patch.reportDate.trim();
    if (patch.trainingDone !== undefined) $set.trainingDone = patch.trainingDone;
    if (patch.nutritionPlanCompliance !== undefined) $set.nutritionPlanCompliance = patch.nutritionPlanCompliance;
    if (patch.nutritionDeviations !== undefined) $set.nutritionDeviations = patch.nutritionDeviations;
    if (patch.mealCount !== undefined) $set.mealCount = patch.mealCount;
    if (patch.hydrationLiters !== undefined) $set.hydrationLiters = patch.hydrationLiters;
    if (patch.cravingsSnacking !== undefined) $set.cravingsSnacking = patch.cravingsSnacking;
    if (patch.digestiveDiscomfort !== undefined) $set.digestiveDiscomfort = patch.digestiveDiscomfort;
    if (patch.transitOk !== undefined) $set.transitOk = patch.transitOk;
    if (patch.menstruation !== undefined) $set.menstruation = patch.menstruation;
    if (patch.sleepHours !== undefined) $set.sleepHours = patch.sleepHours;
    if (patch.sleepQuality !== undefined) $set.sleepQuality = patch.sleepQuality;
    if (patch.wakeRested !== undefined) $set.wakeRested = patch.wakeRested;
    if (patch.muscleSoreness !== undefined) $set.muscleSoreness = patch.muscleSoreness;
    if (patch.waterRetention !== undefined) $set.waterRetention = patch.waterRetention;
    if (patch.energyLevel !== undefined) $set.energyLevel = patch.energyLevel;
    if (patch.motivationLevel !== undefined) $set.motivationLevel = patch.motivationLevel;
    if (patch.stressLevel !== undefined) $set.stressLevel = patch.stressLevel;
    if (patch.moodLevel !== undefined) $set.moodLevel = patch.moodLevel;
    if (patch.disruptiveFactor !== undefined) $set.disruptiveFactor = patch.disruptiveFactor;
    if (patch.painZones !== undefined) $set.painZones = patch.painZones;
    if (patch.notes !== undefined) $set.notes = patch.notes?.trim() || undefined;
    if (patch.athleteId !== undefined) $set.athleteId = patch.athleteId;

    const doc = await this.col().findOneAndUpdate(
      { _id: this.toObjectId(id) },
      { $set },
      { returnDocument: 'after' },
    );

    return doc ? this.toModel(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const now = new Date();
    const res = await this.col().updateOne(
      { _id: this.toObjectId(id), deletedAt: { $exists: false } },
      { $set: { deletedAt: now, updatedAt: now } },
    );
    return res.modifiedCount === 1;
  }

  async hardDelete(id: string): Promise<boolean> {
    const res = await this.col().deleteOne({ _id: this.toObjectId(id) });
    return res.deletedCount === 1;
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private todayAsYyyyMmDd(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private toModel(doc: DailyReportDoc): DailyReport {
    return {
      id: doc._id.toHexString(),
      reportDate: doc.reportDate,
      trainingDone: doc.trainingDone,
      nutritionPlanCompliance: doc.nutritionPlanCompliance,
      nutritionDeviations: doc.nutritionDeviations,
      mealCount: doc.mealCount,
      hydrationLiters: doc.hydrationLiters,
      cravingsSnacking: doc.cravingsSnacking,
      digestiveDiscomfort: doc.digestiveDiscomfort,
      transitOk: doc.transitOk,
      menstruation: doc.menstruation ?? false,
      sleepHours: doc.sleepHours,
      sleepQuality: doc.sleepQuality,
      wakeRested: doc.wakeRested,
      muscleSoreness: doc.muscleSoreness ?? false,
      waterRetention: doc.waterRetention,
      energyLevel: doc.energyLevel,
      motivationLevel: doc.motivationLevel,
      stressLevel: doc.stressLevel,
      moodLevel: doc.moodLevel,
      disruptiveFactor: doc.disruptiveFactor,
      painZones: doc.painZones ?? [],
      notes: doc.notes,
      athleteId: doc.athleteId,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }
}
