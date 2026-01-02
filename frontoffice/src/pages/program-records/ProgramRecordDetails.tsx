import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Rating,
    TextField,
    Typography,
    Stack,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import {
    useProgramRecords,
    type ProgramRecord,
    ProgramRecordState
} from '@hooks/program-records/useProgramRecords';
import { useProgram } from '@hooks/programs/useProgram';
import { FixedPageLayout } from '@src/components/common/FixedPageLayout';

export function ProgramRecordDetails(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();

    const { get: getRecord, updateState } = useProgramRecords();
    const [record, setRecord] = React.useState<ProgramRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);
    const [comment, setComment] = React.useState('');
    const [satisfactionRating, setSatisfactionRating] = React.useState<number | null>(null);

    const fetchRecord = React.useCallback(() => {
        if (!recordId) return;
        setRecordLoading(true);
        getRecord(recordId)
            .then(setRecord)
            .finally(() => setRecordLoading(false));
    }, [recordId, getRecord]);

    // Fetch Record on mount
    React.useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    React.useEffect(() => {
        setComment(record?.comment ?? '');
        setSatisfactionRating(record?.satisfactionRating ?? null);
    }, [record]);

    // Fetch Program once we have the record
    const { program, loading: programLoading } = useProgram({
        programId: record?.programId ?? null
    });

    const loading = recordLoading || programLoading;

    // Derive Labels
    const programLabel = program?.label ?? '-';
    const sessionLabel = React.useMemo(() => {
        if (!program || !record) return '';
        const foundSession = program.sessions.find(s => s.id === record.sessionId);
        return foundSession?.label ?? record.sessionId;
    }, [program, record]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUpdateState = async (newState: ProgramRecordState) => {
        if (!record) return;
        try {
            await updateState(record.id, newState, {
                comment: comment.trim() || undefined,
                satisfactionRating: satisfactionRating ?? undefined,
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to update state', error);
        }
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComment(event.target.value);
    };

    const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
        setSatisfactionRating(value);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // If loading finished but no record found
    if (!record) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography>{t('common.not_found', 'Record not found')}</Typography>
            </Box>
        );
    }

    const renderFooter = () => {
        if (record.state === ProgramRecordState.CREATE || record.state === ProgramRecordState.DRAFT) {
            return (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleUpdateState(ProgramRecordState.DRAFT)}
                    >
                        {t('common.actions.save', 'Save')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateState(ProgramRecordState.FINISH)}
                    >
                        {t('common.actions.finish', 'Finish')}
                    </Button>
                </Stack>
            );
        }

        return (
            <Button
                variant="contained"
                color="primary"
                onClick={handleBackToHome}
            >
                {t('common.back_to_home', 'Back to Home')}
            </Button>
        );
    };

    return (
        <FixedPageLayout
            title={sessionLabel}
            subtitle={programLabel}
            icon={<PlayCircleOutlineIcon fontSize="medium" />}
            footer={renderFooter()}
        >
            {/* General information */}
            <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {t('program_record.form.satisfaction_label')}
                        </Typography>
                        <Rating
                            value={satisfactionRating}
                            onChange={handleRatingChange}
                            max={5}
                            size="large"
                        />
                    </Stack>
                    <TextField
                        label={t('program_record.form.comment_label')}
                        placeholder={t('program_record.form.comment_placeholder')}
                        value={comment}
                        onChange={handleCommentChange}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Stack>
            </Box>
        </FixedPageLayout>
    );
}
