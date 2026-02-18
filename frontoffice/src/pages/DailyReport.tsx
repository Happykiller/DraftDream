// src/pages/DailyReport.tsx
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Info as InfoIcon,
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

/**
 * Daily Report Page
 * Allows athletes to create and submit daily reports to their coach
 */
export function DailyReport(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { create } = useDailyReports();
    const formatDate = useDateFormatter({ options: { dateStyle: 'full' } });

    const getTodayStr = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const reportDateStr = searchParams.get('date') || getTodayStr();
    const reportDate = new Date(reportDateStr);

    // Form State
    const [trainingDone, setTrainingDone] = React.useState<boolean>(false);

    // Nutrition
    const [nutritionCompliance, setNutritionCompliance] = React.useState<number>(2); // Default to Yes (2)
    const [nutritionDeviations, setNutritionDeviations] = React.useState<boolean>(false);
    const [mealCount, setMealCount] = React.useState<number>(3);
    const [hydration, setHydration] = React.useState<number>(2);
    const [cravings, setCravings] = React.useState<boolean>(false);
    const [transitOk, setTransitOk] = React.useState<boolean>(true);
    const [digestiveDiscomfort, setDigestiveDiscomfort] = React.useState<boolean>(false);

    // Sleep
    const [sleepHours, setSleepHours] = React.useState<number>(8);
    const [sleepQuality, setSleepQuality] = React.useState<number>(2); // Default to Good (2)
    const [wakeRested, setWakeRested] = React.useState<boolean>(true);
    const [waterRetention, setWaterRetention] = React.useState<boolean>(false);

    // Pain
    const [menstruation, setMenstruation] = React.useState<boolean>(false);
    const [muscleSoreness, setMuscleSoreness] = React.useState<boolean>(false);

    // Mental
    const [energyLevel, setEnergyLevel] = React.useState<number>(7);
    const [motivationLevel, setMotivationLevel] = React.useState<number>(7);
    const [stressLevel, setStressLevel] = React.useState<number>(3);
    const [moodLevel, setMoodLevel] = React.useState<number>(2); // Default to Positive (2)
    const [disruptiveFactor, setDisruptiveFactor] = React.useState<boolean>(false);

    // Notes
    const [notes, setNotes] = React.useState<string>('');

    // Pain zones
    const [painZones, setPainZones] = React.useState<string[]>([]);

    const handleCancel = React.useCallback(() => {
        navigate('/agenda');
    }, [navigate]);

    const handleSubmit = async () => {
        try {
            await create({
                reportDate: reportDateStr,
                trainingDone,
                nutritionPlanCompliance: nutritionCompliance,
                nutritionDeviations,
                mealCount,
                hydrationLiters: hydration,
                cravingsSnacking: cravings,
                transitOk,
                digestiveDiscomfort,
                menstruation,
                sleepHours,
                sleepQuality,
                wakeRested,
                muscleSoreness,
                waterRetention,
                energyLevel,
                motivationLevel,
                stressLevel,
                moodLevel,
                disruptiveFactor,
                painZones,
                notes,
            });
            navigate('/agenda');
        } catch (error) {
            console.error('Failed to submit daily report', error);
        }
    };

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

    return (
        <FixedPageLayout
            title={t('daily_report.header.title')}
            subtitle={t('daily_report.header.subtitle')}
            icon={<AssignmentIcon />}
            footer={
                <>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {t('daily_report.buttons.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                        {t('daily_report.buttons.send')}
                    </Button>
                </>
            }
        >
            <Stack spacing={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto' }}>
                {/* Date Reminder */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', mb: -2 }}>
                    <CalendarIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(reportDate)}
                    </Typography>
                </Stack>

                <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t('daily_report.info.title')}</Typography>
                    <Typography variant="body2">{t('daily_report.info.message')}</Typography>
                </Alert>

                {/* 1. TRAINING */}
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <SectionHeader
                        icon={<TrainingIcon />}
                        title={t('daily_report.sections.training.title')}
                        color="error"
                    />
                    <FormControl component="fieldset">
                        <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                            {t('daily_report.sections.training.training_done')}
                        </FormLabel>
                        <RadioGroup
                            row
                            value={trainingDone ? 'yes' : 'no'}
                            onChange={(e) => setTrainingDone(e.target.value === 'yes')}
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
                        <FormControl component="fieldset">
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.nutrition.plan_compliance')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={String(nutritionCompliance)}
                                onChange={(e) => setNutritionCompliance(Number(e.target.value))}
                            >
                                <FormControlLabel value="2" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.2')} />
                                <FormControlLabel value="1" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.1')} />
                                <FormControlLabel value="0" control={<Radio color="success" />} label={t('daily_report.sections.nutrition.options.compliance.0')} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl component="fieldset">
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.nutrition.deviations')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={nutritionDeviations ? 'yes' : 'no'}
                                onChange={(e) => setNutritionDeviations(e.target.value === 'yes')}
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
                                    type="number"
                                    value={mealCount}
                                    onChange={(e) => setMealCount(Number(e.target.value))}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label={t('daily_report.sections.nutrition.hydration')}
                                    type="number"
                                    value={hydration}
                                    onChange={(e) => setHydration(Number(e.target.value))}
                                    variant="outlined"
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
                                    control={<Checkbox checked={cravings} onChange={(e) => setCravings(e.target.checked)} color="success" />}
                                    label={t('daily_report.sections.nutrition.cravings')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={transitOk} onChange={(e) => setTransitOk(e.target.checked)} color="success" />}
                                    label={t('daily_report.sections.nutrition.transit')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={digestiveDiscomfort} onChange={(e) => setDigestiveDiscomfort(e.target.checked)} color="success" />}
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
                                    type="number"
                                    value={sleepHours}
                                    onChange={(e) => setSleepHours(Number(e.target.value))}
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl component="fieldset">
                                    <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                        {t('daily_report.sections.sleep.quality')}
                                    </FormLabel>
                                    <RadioGroup
                                        value={String(sleepQuality)}
                                        onChange={(e) => setSleepQuality(Number(e.target.value))}
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
                                control={<Checkbox checked={wakeRested} onChange={(e) => setWakeRested(e.target.checked)} color="secondary" />}
                                label={t('daily_report.sections.sleep.rested')}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={waterRetention} onChange={(e) => setWaterRetention(e.target.checked)} color="secondary" />}
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
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{energyLevel}/10</Typography>
                            </Stack>
                            <Slider
                                value={energyLevel}
                                min={1}
                                max={10}
                                step={1}
                                onChange={(_e, val) => setEnergyLevel(val as number)}
                                valueLabelDisplay="auto"
                            />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">{t('daily_report.sections.mental.labels.low')}</Typography>
                                <Typography variant="caption" color="text.secondary">{t('daily_report.sections.mental.labels.high')}</Typography>
                            </Stack>
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('daily_report.sections.mental.motivation')}</Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{motivationLevel}/10</Typography>
                            </Stack>
                            <Slider
                                value={motivationLevel}
                                min={1}
                                max={10}
                                step={1}
                                onChange={(_e, val) => setMotivationLevel(val as number)}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('daily_report.sections.mental.stress')}</Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{stressLevel}/10</Typography>
                            </Stack>
                            <Slider
                                value={stressLevel}
                                min={1}
                                max={10}
                                step={1}
                                onChange={(_e, val) => setStressLevel(val as number)}
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <FormControl component="fieldset">
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.mental.mood')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={String(moodLevel)}
                                onChange={(e) => setMoodLevel(Number(e.target.value))}
                            >
                                <FormControlLabel value="2" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.2')} />
                                <FormControlLabel value="1" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.1')} />
                                <FormControlLabel value="0" control={<Radio color="warning" />} label={t('daily_report.sections.mental.options.mood.0')} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl component="fieldset">
                            <FormLabel sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                                {t('daily_report.sections.mental.disruptive')}
                            </FormLabel>
                            <RadioGroup
                                row
                                value={disruptiveFactor ? 'yes' : 'no'}
                                onChange={(e) => setDisruptiveFactor(e.target.value === 'yes')}
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
                            control={<Checkbox checked={menstruation} onChange={(e) => setMenstruation(e.target.checked)} color="error" />}
                            label={t('daily_report.sections.pain.menstrual_cycle')}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={muscleSoreness} onChange={(e) => setMuscleSoreness(e.target.checked)} color="error" />}
                            label={t('daily_report.sections.pain.soreness')}
                        />
                    </Stack>
                    <PainZonesSelector
                        value={painZones}
                        onChange={setPainZones}
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
                        placeholder={t('daily_report.sections.notes.placeholder')}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Card>
            </Stack>
        </FixedPageLayout>
    );
}
