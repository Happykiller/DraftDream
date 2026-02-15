// src/hooks/useDailyReports.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useFlashStore } from '@hooks/useFlashStore';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { dailyReportCreate, dailyReportList, dailyReportGet } from '@services/graphql/dailyReport.service';
import type { CreateDailyReportInput, ListDailyReportsInput } from '@app-types/dailyReport';

export function useDailyReports() {
    const { t } = useTranslation();
    const { execute } = useAsyncTask();
    const flashError = useFlashStore((state) => state.error);
    const flashSuccess = useFlashStore((state) => state.success);

    const create = React.useCallback(
        async (input: CreateDailyReportInput) => {
            try {
                const created = await execute(() => dailyReportCreate(input));
                if (!created) throw new Error('CreateDailyReport returned no data');
                flashSuccess(t('daily_report.notifications.create_success'));
                return created;
            } catch (error: unknown) {
                flashError(t('daily_report.notifications.create_failure'));
                throw error;
            }
        },
        [execute, flashError, flashSuccess, t]
    );

    const list = React.useCallback(
        async (input?: ListDailyReportsInput) => {
            try {
                return await execute(() => dailyReportList(input));
            } catch (error: unknown) {
                throw error;
            }
        },
        [execute]
    );

    const get = React.useCallback(
        async (id: string) => {
            try {
                return await execute(() => dailyReportGet(id));
            } catch (error: unknown) {
                throw error;
            }
        },
        [execute]
    );

    return {
        create,
        list,
        get,
    };
}
