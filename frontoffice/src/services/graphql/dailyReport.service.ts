// src/services/graphql/dailyReport.service.ts
import inversify from '@src/commons/inversify';
import type { DailyReport, CreateDailyReportInput, DailyReportList, ListDailyReportsInput } from '@app-types/dailyReport';
import { GraphqlServiceFetch } from './graphql.service.fetch';

const LIST_DAILY_REPORTS_QUERY = `
  query ListDailyReports($input: ListDailyReportsInput) {
    dailyReport_list(input: $input) {
      items {
        id
        reportDate
        trainingDone
        nutritionPlanCompliance
        nutritionDeviations
        mealCount
        hydrationLiters
        cravingsSnacking
        digestiveDiscomfort
        transitOk
        menstruation
        sleepHours
        sleepQuality
        wakeRested
        muscleSoreness
        waterRetention
        energyLevel
        motivationLevel
        stressLevel
        moodLevel
        disruptiveFactor
        painZones
        notes
        athleteId
      }
      total
      page
      limit
    }
  }
`;

const GET_DAILY_REPORT_QUERY = `
  query GetDailyReport($id: ID!) {
    dailyReport_get(id: $id) {
      id
      reportDate
      trainingDone
      nutritionPlanCompliance
      nutritionDeviations
      mealCount
      hydrationLiters
      cravingsSnacking
      digestiveDiscomfort
      transitOk
      menstruation
      sleepHours
      sleepQuality
      wakeRested
      muscleSoreness
      waterRetention
      energyLevel
      motivationLevel
      stressLevel
      moodLevel
      disruptiveFactor
      painZones
      notes
      athleteId
    }
  }
`;

const CREATE_DAILY_REPORT_MUTATION = `
  mutation CreateDailyReport($input: CreateDailyReportInput!) {
    dailyReport_create(input: $input) {
      id
      reportDate
      trainingDone
      nutritionPlanCompliance
      nutritionDeviations
      mealCount
      hydrationLiters
      cravingsSnacking
      digestiveDiscomfort
      transitOk
      menstruation
      sleepHours
      sleepQuality
      wakeRested
      muscleSoreness
      waterRetention
      energyLevel
      motivationLevel
      stressLevel
      moodLevel
      disruptiveFactor
      painZones
      notes
      athleteId
    }
  }
`;

/** Creates a new daily report for the authenticated athlete. */
export async function dailyReportCreate(input: CreateDailyReportInput): Promise<DailyReport | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<{ dailyReport_create: DailyReport | null }>({
    query: CREATE_DAILY_REPORT_MUTATION,
    operationName: 'CreateDailyReport',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.dailyReport_create ?? null;
}

/** Lists daily reports based on criteria. */
export async function dailyReportList(input?: ListDailyReportsInput): Promise<DailyReportList | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<{ dailyReport_list: DailyReportList | null }>({
    query: LIST_DAILY_REPORTS_QUERY,
    operationName: 'ListDailyReports',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.dailyReport_list ?? null;
}

/** Gets a single daily report by ID. */
export async function dailyReportGet(id: string): Promise<DailyReport | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<{ dailyReport_get: DailyReport | null }>({
    query: GET_DAILY_REPORT_QUERY,
    operationName: 'GetDailyReport',
    variables: { id },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.dailyReport_get ?? null;
}
