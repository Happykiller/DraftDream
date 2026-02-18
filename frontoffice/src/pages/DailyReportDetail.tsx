// src/pages/DailyReportDetail.tsx
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Button,
    Stack,
    Typography,
    Box,
    Card,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Slider,
    Checkbox,
    Grid,
    InputAdornment,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    CalendarMonth as CalendarIcon,
    FitnessCenter as TrainingIcon,
    Restaurant as NutritionIcon,
    Bedtime as SleepIcon,
    Psychology as MentalIcon,
    Description as NotesIcon,
    AccessibilityNew as PainIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FixedPageLayout } from '@components/common/FixedPageLayout';
import { PainZonesSelector } from '@components/daily-report/PainZonesSelector';
import { useDailyReports } from '@hooks/useDailyReports';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { DailyReport } from '@app-types/dailyReport';

/**
 * Daily Report Detail Page
 * Displays a submitted daily report in read-only mode
 */
export function DailyReportDetail(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { reportId } = useParams<{ reportId: string }>();
    const { get } = useDailyReports();
    const formatDateTime = useDateFormatter({ options: { dateStyle: 'full', timeStyle: 'short' } });

    const [report, setReport] = React.useState<DailyReport | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchReport = React.useCallback(async () => {
        if (!reportId) return;
        try {
            setLoading(true);
            const data = await get(reportId);
            if (data) {
                setReport(data);
            } else {
                setError(t('daily_report.errors.not_found'));
            }
        } catch (err) {
            console.error('Failed to fetch report', err);
            setError(t('daily_report.errors.fetch_failed'));
        } finally {
            setLoading(false);
        }
    }, [reportId, get, t]);

    React.useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleBack = React.useCallback(() => {
        navigate('/agenda');
    }, [navigate]);

    const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode, title: string, color: 'error' | 'success' | 'secondary' | 'warning' | 'info' }) => (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${color}.main`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette[color].main, 0.24)}`,
            }}>
                {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                {title}
            </Typography>
        </Stack>
    );

    if (loading) {
        return (
            <FixedPageLayout title={t('daily_report.header.title')} icon={<AssignmentIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </FixedPageLayout>
        );
    }

    if (error || !report) {
        return (
            <FixedPageLayout title={t('daily_report.header.title')} icon={<AssignmentIcon />}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 2 }}>{error || t('daily_report.errors.generic')}</Alert>
                    <Button onClick={handleBack} variant="contained">{t('daily_report.buttons.back')}</Button>
                </Box>
            </FixedPageLayout>
        );
    }

    const reportDate = new Date(report.reportDate);

    return (
        <FixedPageLayout
            title={t('daily_report.header.title_view')}
            subtitle={t('daily_report.header.subtitle_view')}
            icon={<AssignmentIcon />}
            footer={
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {t('daily_report.buttons.back')}
                </Button>
            }
        >
            <Stack spacing={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto' }}>
                {/* Date Reminder */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', mb: -2 }}>
                    <CalendarIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDateTime(reportDate)}
                    </Typography>
                </Stack>

                {/* 1. TRAINING */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<TrainingIcon />}
                        title={t('daily_report.sections.training.title')}
                        color="error"
                    />
                    <FormControl component="fieldset" disabled>
                        <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                            {t('daily_report.sections.training.training_done')}
                        </FormLabel>
                        <RadioGroup
                            row
                            value={report.trainingDone ? 'yes' : 'no'}
                        >
                            <FormControlLabel value="yes" control={<Radio color="error" />} label={t('daily_report.options.yes')} />
                            <FormControlLabel value="no" control={<Radio color="error" />} label={t('daily_report.options.no')} />
                        </RadioGroup>
                    </FormControl>
                </Card>

                {/* 2. NUTRITION */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<NutritionIcon />}
                        title={t('daily_report.sections.nutrition.title')}
                        color="success"
                    />
                    <Stack spacing={3}>
                        <FormControl component="fieldset" disabled>
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.nutrition.plan_compliance')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={String(report.nutritionPlanCompliance)}
                            >
                                <FormControlLabel value="2" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.2')} />
                                <FormControlLabel value="1" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.1')} />
                                <FormControlLabel value="0" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.0')} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl component="fieldset" disabled>
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.nutrition.deviations')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={report.nutritionDeviations ? 'yes' : 'no'}
                            >
                                <FormControlLabel value="no" control={<Radio color="success" />} label={t('daily_report.options.no')} />
                                <FormControlLabel value="yes" control={<Radio color="success" />} label={t('daily_report.options.yes')} />
                            </RadioGroup>
                        </FormControl>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label={t('daily_report.sections.nutrition.meal_count')}
                                    value={report.mealCount}
                                    variant="outlined"
                                    disabled
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label={t('daily_report.sections.nutrition.hydration')}
                                    value={report.hydrationLiters}
                                    variant="outlined"
                                    disabled
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">L</InputAdornment>,
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={1}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    disabled
                                    control={<Checkbox checked={report.cravingsSnacking} color="success" />}
                                    label={t('daily_report.sections.nutrition.cravings')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    disabled
                                    control={<Checkbox checked={report.transitOk} color="success" />}
                                    label={t('daily_report.sections.nutrition.transit')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    disabled
                                    control={<Checkbox checked={report.digestiveDiscomfort} color="success" />}
                                    label={t('daily_report.sections.nutrition.discomfort')}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Card>

                {/* 3. SLEEP */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<SleepIcon />}
                        title={t('daily_report.sections.sleep.title')}
                        color="secondary"
                    />
                    <Stack spacing={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label={t('daily_report.sections.sleep.hours')}
                                    value={report.sleepHours}
                                    variant="outlined"
                                    disabled
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl component="fieldset" disabled>
                                    <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                        {t('daily_report.sections.sleep.quality')}
                                    </FormLabel>
                                    <RadioGroup
                                        value={String(report.sleepQuality)}
                                    >
                                        <FormControlLabel value="0" control={<Radio color="secondary" />} label={t('daily_report.sections.sleep.options.quality.0')} />
                                        <FormControlLabel value="1" control={<Radio color="secondary" />} label={t('daily_report.sections.sleep.options.quality.1')} />
                                        <FormControlLabel value="2" control={<Radio color="secondary" />} label={t('daily_report.sections.sleep.options.quality.2')} />
                                        <FormControlLabel value="3" control={<Radio color="secondary" />} label={t('daily_report.sections.sleep.options.quality.3')} />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Stack spacing={1}>
                            <FormControlLabel
                                disabled
                                control={<Checkbox checked={report.wakeRested} color="secondary" />}
                                label={t('daily_report.sections.sleep.rested')}
                            />
                            <FormControlLabel
                                disabled
                                control={<Checkbox checked={report.waterRetention} color="secondary" />}
                                label={t('daily_report.sections.sleep.retention')}
                            />
                        </Stack>
                    </Stack>
                </Card>

                {/* 4. MENTAL */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<MentalIcon />}
                        title={t('daily_report.sections.mental.title')}
                        color="warning"
                    />
                    <Stack spacing={4}>
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('daily_report.sections.mental.energy')}</Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{report.energyLevel}/10</Typography>
                            </Stack>
                            <Slider
                                disabled
                                value={report.energyLevel}
                                min={1}
                                max={10}
                                step={1}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('daily_report.sections.mental.motivation')}</Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{report.motivationLevel}/10</Typography>
                            </Stack>
                            <Slider
                                disabled
                                value={report.motivationLevel}
                                min={1}
                                max={10}
                                step={1}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('daily_report.sections.mental.stress')}</Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{report.stressLevel}/10</Typography>
                            </Stack>
                            <Slider
                                disabled
                                value={report.stressLevel}
                                min={1}
                                max={10}
                                step={1}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <FormControl component="fieldset" disabled>
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.mental.mood')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={String(report.moodLevel)}
                            >
                                <FormControlLabel value="2" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.2')} />
                                <FormControlLabel value="1" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.1')} />
                                <FormControlLabel value="0" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.0')} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl component="fieldset" disabled>
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.mental.disruptive')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={report.disruptiveFactor ? 'yes' : 'no'}
                            >
                                <FormControlLabel value="no" control={<Radio color="warning" />} label={t('daily_report.options.no')} />
                                <FormControlLabel value="yes" control={<Radio color="warning" />} label={t('daily_report.options.yes')} />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </Card>

                {/* 5. PAIN */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<PainIcon />}
                        title={t('daily_report.sections.pain.title')}
                        color="error"
                    />
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <FormControlLabel
                            disabled
                            control={<Checkbox checked={report.menstruation} color="error" />}
                            label={t('daily_report.sections.pain.menstrual_cycle')}
                        />
                        <FormControlLabel
                            disabled
                            control={<Checkbox checked={report.muscleSoreness} color="error" />}
                            label={t('daily_report.sections.pain.soreness')}
                        />
                    </Stack>
                    <PainZonesSelector
                        value={report.painZones}
                        readOnly
                    />
                </Card>

                {/* 6. NOTES */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<NotesIcon />}
                        title={t('daily_report.sections.notes.title')}
                        color="info"
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={t('daily_report.sections.notes.label')}
                        value={report.notes || ''}
                        variant="outlined"
                        disabled
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Card>
            </Stack>
        </FixedPageLayout>
    );
}
