import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Edit, Search } from '@mui/icons-material';

import { ProgramBuilderSessionItem } from './ProgramBuilderSessionItem';
import { ProgramBuilderSessionLibraryItem } from './ProgramBuilderSessionLibraryItem';
import { ProgramBuilderExerciseLibraryItem } from './ProgramBuilderExerciseLibraryItem';
import { ProgramBuilderCreateExerciseDialog } from './ProgramBuilderCreateExerciseDialog';
import type { BuilderCopy } from './programBuilderTypes';

import type { Exercise } from '@hooks/useExercises';
import type { User } from '@src/hooks/useUsers';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { useProgramBuilder } from '@src/hooks/useProgramBuilder';
import type { Program } from '@src/hooks/usePrograms';

interface ProgramBuilderPanelProps {
  builderCopy: BuilderCopy;
  onCancel: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
  program?: Program;
}

export function ProgramBuilderPanel({
  builderCopy,
  onCancel,
  onCreated,
  onUpdated,
  program,
}: ProgramBuilderPanelProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;

  const {
    form,
    sessions,
    selectedAthlete,
    users,
    sessionSearch,
    exerciseSearch,
    exerciseCategory,
    exerciseType,
    sessionTemplates,
    filteredExercises,
    exerciseCategoryOptions,
    exerciseTypeOptions,
    exerciseMap,
    limitHint,
    sessionLimitHint,
    emptyExercisesMessage,
    summaryText: _summaryText,
    sessionsLoading,
    exercisesLoading,
    categoriesLoading,
    usersLoading,
    setSessionSearch,
    setExerciseSearch,
    setExerciseCategory,
    setExerciseType,
    setUsersQ,
    handleSelectAthlete,
    handleFormChange,
    updateProgramName,
    updateProgramDescription,
    handleAddSessionFromTemplate,
    handleCreateEmptySession,
    handleRemoveSession,
    handleRemoveExercise,
    handleSessionLabelChange,
    handleSessionDescriptionChange,
    handleSessionDurationChange,
    handleExerciseLabelChange,
    handleExerciseDescriptionChange,
    handleAddExerciseToSession,
    handleMoveSessionUp,
    handleMoveSessionDown,
    handleMoveExerciseUp,
    handleMoveExerciseDown,
    handleSubmit,
    userLabel,
    isSubmitDisabled,
    createExercise,
    updateExercise,
    registerExercise,
    getRawExerciseById,
    mode,
  } = useProgramBuilder(builderCopy, onCancel, {
    onCreated,
    onUpdated,
    program,
  });

  const isEditing = mode === 'edit';
  const panelTitle = React.useMemo(
    () =>
      isEditing
        ? builderCopy.edit_title ??
        t('programs-coatch.builder.edit_title', { defaultValue: 'Edit program' })
        : builderCopy.title,
    [builderCopy.edit_title, builderCopy.title, isEditing, t],
  );
  const panelSubtitle = React.useMemo(
    () =>
      isEditing
        ? builderCopy.edit_subtitle ??
        t('programs-coatch.builder.edit_subtitle', {
          defaultValue: 'Update the existing sessions and exercises.',
        })
        : builderCopy.subtitle,
    [builderCopy.edit_subtitle, builderCopy.subtitle, isEditing, t],
  );
  const submitLabel = React.useMemo(
    () =>
      isEditing
        ? builderCopy.footer.update ??
        t('programs-coatch.builder.footer.update', { defaultValue: 'Save changes' })
        : builderCopy.footer.submit,
    [builderCopy.footer.submit, builderCopy.footer.update, isEditing, t],
  );

  const interactiveSurfaceSx = React.useMemo(
    () => ({
      cursor: 'pointer',
      borderRadius: 1,
      px: 0.75,
      py: 0.25,
      transition: 'background-color 120ms ease',
      '&:hover': {
        backgroundColor: alpha(primaryMain, 0.08),
      },
      '&:focus-visible': {
        outline: `2px solid ${alpha(primaryMain, 0.32)}`,
        outlineOffset: 2,
      },
    }),
    [primaryMain],
  );

  void _summaryText;

  const addExerciseFallbackLabel = t(
    'programs-coatch.builder.library.no_sessions_warning',
    { defaultValue: 'Create a session before adding exercises.' },
  );

  const [exerciseMenuAnchor, setExerciseMenuAnchor] = React.useState<{
    anchor: HTMLElement;
    exerciseId: string;
  } | null>(null);

  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = React.useState(false);
  const [exerciseBeingEdited, setExerciseBeingEdited] = React.useState<Exercise | null>(null);

  const [structureTitle, setStructureTitle] = React.useState(() => {
    const candidate = program?.label?.trim();
    return candidate && candidate.length > 0 ? candidate : builderCopy.structure.title;
  });
  const [structureTitleDraft, setStructureTitleDraft] = React.useState(structureTitle);
  const [structureDescription, setStructureDescription] = React.useState(() => {
    const base = (program?.description ?? '').trim();
    const fallback = builderCopy.structure.header_description ?? '';
    return base.length > 0 ? base : fallback;
  });
  const [structureDescriptionDraft, setStructureDescriptionDraft] = React.useState(
    structureDescription,
  );
  const [isEditingStructureTitle, setIsEditingStructureTitle] = React.useState(false);
  const [isEditingStructureDescription, setIsEditingStructureDescription] = React.useState(false);
  const structureTitleRef = React.useRef<HTMLInputElement | null>(null);
  const structureDescriptionRef = React.useRef<HTMLTextAreaElement | null>(null);
  const debouncedStructureTitleDraft = useDebouncedValue(structureTitleDraft, 300);
  const debouncedStructureDescriptionDraft = useDebouncedValue(structureDescriptionDraft, 300);

  const resolvedStructureTitle = React.useMemo(() => {
    const candidate = program?.label?.trim();
    return candidate && candidate.length > 0 ? candidate : builderCopy.structure.title;
  }, [builderCopy.structure.title, program]);

  const resolvedStructureDescription = React.useMemo(() => {
    const base = (program?.description ?? '').trim();
    const fallback = builderCopy.structure.header_description ?? '';
    return base.length > 0 ? base : fallback;
  }, [builderCopy.structure.header_description, program]);

  React.useEffect(() => {
    setIsEditingStructureTitle(false);
    setIsEditingStructureDescription(false);
  }, [program]);

  React.useEffect(() => {
    setStructureTitle(resolvedStructureTitle);
    setStructureTitleDraft(resolvedStructureTitle);
    updateProgramName(resolvedStructureTitle);
  }, [resolvedStructureTitle, updateProgramName]);

  React.useEffect(() => {
    if (!isEditingStructureTitle) {
      return;
    }
    const trimmed = debouncedStructureTitleDraft.trim();
    const fallback = structureTitle || builderCopy.structure.title;
    updateProgramName(trimmed || fallback);
  }, [
    builderCopy.structure.title,
    debouncedStructureTitleDraft,
    isEditingStructureTitle,
    structureTitle,
    updateProgramName,
  ]);

  React.useEffect(() => {
    setStructureDescription(resolvedStructureDescription);
    setStructureDescriptionDraft(resolvedStructureDescription);
    updateProgramDescription(resolvedStructureDescription);
  }, [resolvedStructureDescription, updateProgramDescription]);

  React.useEffect(() => {
    if (!isEditingStructureDescription) {
      return;
    }
    const trimmed = debouncedStructureDescriptionDraft.trim();
    const fallback =
      structureDescription || builderCopy.structure.header_description || '';
    updateProgramDescription(trimmed || fallback);
  }, [
    builderCopy.structure.header_description,
    debouncedStructureDescriptionDraft,
    isEditingStructureDescription,
    structureDescription,
    updateProgramDescription,
  ]);

  React.useEffect(() => {
    if (isEditingStructureTitle && structureTitleRef.current) {
      structureTitleRef.current.focus();
      structureTitleRef.current.select();
    }
  }, [isEditingStructureTitle]);

  React.useEffect(() => {
    if (isEditingStructureDescription && structureDescriptionRef.current) {
      structureDescriptionRef.current.focus();
      structureDescriptionRef.current.select();
    }
  }, [isEditingStructureDescription]);

  const sessionCount = sessions.length;
  const exerciseCount = React.useMemo(
    () => sessions.reduce((total, sessionItem) => total + sessionItem.exercises.length, 0),
    [sessions],
  );

  const sessionCountLabel = React.useMemo(() => {
    const raw =
      sessionCount === 1
        ? builderCopy.structure.session_counter_one
        : builderCopy.structure.session_counter_other;
    return raw.replace('{{count}}', String(sessionCount));
  }, [
    builderCopy.structure.session_counter_one,
    builderCopy.structure.session_counter_other,
    sessionCount,
  ]);

  const exerciseCountLabel = React.useMemo(() => {
    const raw =
      exerciseCount === 1
        ? builderCopy.structure.exercise_counter_one
        : builderCopy.structure.exercise_counter_other;
    return raw.replace('{{count}}', String(exerciseCount));
  }, [
    builderCopy.structure.exercise_counter_one,
    builderCopy.structure.exercise_counter_other,
    exerciseCount,
  ]);

  const commitStructureTitle = React.useCallback(() => {
    const trimmed = structureTitleDraft.trim();
    const fallback = builderCopy.structure.title;
    const next = trimmed || fallback;
    setStructureTitle(next);
    setStructureTitleDraft(next);
    setIsEditingStructureTitle(false);
    updateProgramName(next);
  }, [builderCopy.structure.title, structureTitleDraft, updateProgramName]);

  const cancelStructureTitle = React.useCallback(() => {
    setStructureTitleDraft(structureTitle);
    setIsEditingStructureTitle(false);
    updateProgramName(structureTitle);
  }, [structureTitle, updateProgramName]);

  const handleStructureTitleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitStructureTitle();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelStructureTitle();
      }
    },
    [cancelStructureTitle, commitStructureTitle],
  );

  const handleStructureTitleBlur = React.useCallback(() => {
    if (isEditingStructureTitle) {
      commitStructureTitle();
    }
  }, [commitStructureTitle, isEditingStructureTitle]);

  const handleStructureTitleClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLHeadingElement>) => {
      event.stopPropagation();
      if (isEditingStructureTitle) {
        return;
      }
      setStructureTitleDraft(structureTitle);
      setIsEditingStructureTitle(true);
    },
    [isEditingStructureTitle, structureTitle],
  );

  const handleStructureTitleDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement | HTMLHeadingElement>) => {
      if (isEditingStructureTitle) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setStructureTitleDraft(structureTitle);
        setIsEditingStructureTitle(true);
      }
    },
    [isEditingStructureTitle, structureTitle],
  );

  const commitStructureDescription = React.useCallback(() => {
    const trimmed = structureDescriptionDraft.trim();
    const fallback = builderCopy.structure.header_description;
    const next = trimmed || fallback;
    setStructureDescription(next);
    setStructureDescriptionDraft(next);
    setIsEditingStructureDescription(false);
    updateProgramDescription(next);
  }, [
    builderCopy.structure.header_description,
    structureDescriptionDraft,
    updateProgramDescription,
  ]);

  const cancelStructureDescription = React.useCallback(() => {
    setStructureDescriptionDraft(structureDescription);
    setIsEditingStructureDescription(false);
    updateProgramDescription(structureDescription);
  }, [structureDescription, updateProgramDescription]);

  const handleStructureDescriptionInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        commitStructureDescription();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelStructureDescription();
      }
    },
    [cancelStructureDescription, commitStructureDescription],
  );

  const handleStructureDescriptionBlur = React.useCallback(() => {
    if (isEditingStructureDescription) {
      commitStructureDescription();
    }
  }, [commitStructureDescription, isEditingStructureDescription]);

  const handleStructureDescriptionClick = React.useCallback(
    (event: React.MouseEvent<HTMLParagraphElement | HTMLSpanElement>) => {
      event.stopPropagation();
      if (isEditingStructureDescription) {
        return;
      }
      setStructureDescriptionDraft(structureDescription);
      setIsEditingStructureDescription(true);
    },
    [isEditingStructureDescription, structureDescription],
  );

  const handleStructureDescriptionDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLParagraphElement | HTMLSpanElement>) => {
      if (isEditingStructureDescription) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setStructureDescriptionDraft(structureDescription);
        setIsEditingStructureDescription(true);
      }
    },
    [isEditingStructureDescription, structureDescription],
  );

  const handleOpenExerciseMenu = React.useCallback(
    (exerciseId: string, anchor: HTMLElement) => {
      setExerciseMenuAnchor({ exerciseId, anchor });
    },
    [],
  );

  const handleCloseExerciseMenu = React.useCallback(() => {
    setExerciseMenuAnchor(null);
  }, []);

  const handleAddExerciseFromMenu = React.useCallback(
    (sessionId: string) => {
      if (!exerciseMenuAnchor) {
        return;
      }
      handleAddExerciseToSession(sessionId, exerciseMenuAnchor.exerciseId);
      handleCloseExerciseMenu();
    },
    [exerciseMenuAnchor, handleAddExerciseToSession, handleCloseExerciseMenu],
  );

  const handleOpenCreateExerciseDialog = React.useCallback(() => {
    setExerciseBeingEdited(null);
    setIsExerciseDialogOpen(true);
  }, []);

  const handleCloseExerciseDialog = React.useCallback(() => {
    setIsExerciseDialogOpen(false);
    setExerciseBeingEdited(null);
  }, []);

  const handleExerciseCreated = React.useCallback(
    (exercise: Exercise) => {
      registerExercise(exercise);
      if (exerciseCategory !== 'all' && exerciseCategory !== exercise.categoryId) {
        setExerciseCategory('all');
      }
      if (exerciseType !== 'all' && exerciseType !== exercise.visibility) {
        setExerciseType('all');
      }
      handleCloseExerciseDialog();
    },
    [
      exerciseCategory,
      exerciseType,
      handleCloseExerciseDialog,
      registerExercise,
      setExerciseCategory,
      setExerciseType,
    ],
  );

  const handleExerciseUpdated = React.useCallback(
    (exercise: Exercise) => {
      registerExercise(exercise);
      if (exerciseCategory !== 'all' && exerciseCategory !== exercise.categoryId) {
        setExerciseCategory('all');
      }
      if (exerciseType !== 'all' && exerciseType !== exercise.visibility) {
        setExerciseType('all');
      }
      handleCloseExerciseDialog();
    },
    [
      exerciseCategory,
      exerciseType,
      handleCloseExerciseDialog,
      registerExercise,
      setExerciseCategory,
      setExerciseType,
    ],
  );

  const handleOpenEditExerciseDialog = React.useCallback(
    (exerciseId: string) => {
      const exercise = getRawExerciseById(exerciseId);
      if (!exercise) {
        return;
      }
      setExerciseBeingEdited(exercise);
      setIsExerciseDialogOpen(true);
    },
    [getRawExerciseById],
  );

  return (
    <>
      {/* Main Panel */}
      <Stack>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: alpha(theme.palette.success.main, 0.20), p: 1 }}>
          <Box
            aria-hidden
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'success.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isEditing ? <Edit fontSize="large" /> : <Add fontSize="large" />}
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              {panelTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {panelSubtitle}
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        {/* Content Grid */}
        <Grid container>
          {/* Configuration Panel */}
          <Grid size={{ xs: 12, md: 3, lg: 3 }} sx={{ backgroundColor: '#f3f2f2e0', p: 1 }}>
            <Grid spacing={3}>
              <Grid
                sx={{
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {builderCopy.config.title}
                </Typography>

                <Autocomplete<User>
                  options={users}
                  value={selectedAthlete}
                  loading={usersLoading}
                  onChange={handleSelectAthlete}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={userLabel}
                  noOptionsText={t('common.field_incorrect')}
                  onInputChange={(_event, value) => setUsersQ(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={builderCopy.config.client_label}
                      placeholder={builderCopy.config.client_placeholder}
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" color="disabled" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {usersLoading ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        'aria-label': 'Select athlete',
                      }}
                    />
                  )}
                  sx={{ backgroundColor: theme.palette.background.default }}
                />

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label={builderCopy.config.duration_label}
                    size="small"
                    fullWidth
                    value={form.duration}
                    onChange={handleFormChange('duration')}
                    required
                    inputProps={{ 'aria-required': true }}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                  <TextField
                    label={builderCopy.config.frequency_label}
                    size="small"
                    fullWidth
                    value={form.frequency}
                    onChange={handleFormChange('frequency')}
                    required
                    inputProps={{ 'aria-required': true }}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Stack>

                <Divider />

                {/* Session Templates Library */}
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {builderCopy.templates_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {builderCopy.templates_subtitle}
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder={builderCopy.config.search_placeholder}
                    value={sessionSearch}
                    onChange={(event) => setSessionSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    {sessionLimitHint}
                  </Typography>

                  <Stack spacing={1.5}>
                    {sessionsLoading ? (
                      <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : sessionTemplates.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {builderCopy.structure.empty}
                      </Typography>
                    ) : (
                      sessionTemplates.map((template) => (
                        <ProgramBuilderSessionLibraryItem
                          key={template.id}
                          template={template}
                          builderCopy={builderCopy}
                          onAdd={() => handleAddSessionFromTemplate(template.id)}
                        />
                      ))
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* Structure Panel */}
          <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ p: 1 }}>
            <Box
              sx={{
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack spacing={0.75} flexGrow={1} minWidth={0}>
                    {isEditingStructureTitle ? (
                      <TextField
                        inputRef={structureTitleRef}
                        value={structureTitleDraft}
                        onChange={(event) => setStructureTitleDraft(event.target.value)}
                        onBlur={handleStructureTitleBlur}
                        onKeyDown={handleStructureTitleInputKeyDown}
                        size="small"
                        variant="standard"
                        inputProps={{ 'aria-label': 'structure-title' }}
                        fullWidth
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          ...interactiveSurfaceSx,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          width: 'fit-content',
                        }}
                        onClick={handleStructureTitleClick}
                        onKeyDown={handleStructureTitleDisplayKeyDown}
                        tabIndex={0}
                        role="button"
                      >
                        <Edit fontSize="inherit" color="disabled" />
                        {structureTitle}
                      </Typography>
                    )}
                    {isEditingStructureDescription ? (
                      <TextField
                        inputRef={structureDescriptionRef}
                        value={structureDescriptionDraft}
                        onChange={(event) => setStructureDescriptionDraft(event.target.value)}
                        onBlur={handleStructureDescriptionBlur}
                        onKeyDown={handleStructureDescriptionInputKeyDown}
                        size="small"
                        variant="standard"
                        multiline
                        minRows={1}
                        inputProps={{ 'aria-label': 'structure-description' }}
                        fullWidth
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          ...interactiveSurfaceSx,
                          display: 'inline-flex',
                          alignItems: 'flex-start',
                          gap: 0.5,
                          maxWidth: '100%',
                        }}
                        onClick={handleStructureDescriptionClick}
                        onKeyDown={handleStructureDescriptionDisplayKeyDown}
                        tabIndex={0}
                        role="button"
                      >
                        <Edit fontSize="inherit" color="disabled" />
                        <Box
                          component="span"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            fontStyle: structureDescription ? 'normal' : 'italic',
                          }}
                        >
                          {structureDescription}
                        </Box>
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap', ml: 2 }}
                  >
                    {sessionCountLabel} · {exerciseCountLabel}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                spacing={1.5}
                sx={{
                  border:
                    sessionCount === 0
                      ? `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`
                      : 'none',
                  borderRadius: 2,
                  p: sessions.length === 0 ? 2 : 0,
                  minHeight: 280,
                  bgcolor:
                    sessions.length === 0
                      ? alpha(theme.palette.background.default, 0.4)
                      : 'transparent',
                }}
              >
                {sessions.length === 0 ? (
                  <Stack spacing={1} alignItems="center" justifyContent="center" flexGrow={1}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {builderCopy.structure.empty}
                    </Typography>
                  </Stack>
                ) : (
                  sessions.map((session, index) => (
                    <ProgramBuilderSessionItem
                      key={session.id}
                      session={session}
                      index={index}
                      totalSessions={sessions.length}
                      builderCopy={builderCopy}
                      onLabelChange={handleSessionLabelChange}
                      onDescriptionChange={handleSessionDescriptionChange}
                      onDurationChange={handleSessionDurationChange}
                      onRemoveSession={() => handleRemoveSession(session.id)}
                      onRemoveExercise={(exerciseId) =>
                        handleRemoveExercise(session.id, exerciseId)
                      }
                      onMoveUp={() => handleMoveSessionUp(session.id)}
                      onMoveDown={() => handleMoveSessionDown(session.id)}
                      getExerciseById={(exerciseId) => exerciseMap.get(exerciseId)}
                      onExerciseLabelChange={handleExerciseLabelChange}
                      onExerciseDescriptionChange={handleExerciseDescriptionChange}
                      onMoveExerciseUp={(exerciseId) =>
                        handleMoveExerciseUp(session.id, exerciseId)
                      }
                      onMoveExerciseDown={(exerciseId) =>
                        handleMoveExerciseDown(session.id, exerciseId)
                      }
                    />
                  ))
                )}
              </Stack>

              <Tooltip title={builderCopy.library.tooltips.add_empty_session} arrow>
                <span style={{ display: 'flex', width: '100%' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add fontSize="small" />}
                    fullWidth
                    onClick={handleCreateEmptySession}
                  >
                    {builderCopy.config.button_create}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Grid>

          {/* Exercise Library Panel */}
          <Grid size={{ xs: 12, md: 4, lg: 4 }} sx={{ backgroundColor: '#f3f2f2e0', p: 1 }}>
            <Box
              sx={{
                borderRadius: 2,
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {builderCopy.library.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {builderCopy.library.subtitle}
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder={builderCopy.library.search_placeholder}
                value={exerciseSearch}
                onChange={(event) => setExerciseSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" color="disabled" />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: theme.palette.background.default }}
              />

              <Button
                variant="contained"
                size="small"
                startIcon={<Add fontSize="small" />}
                fullWidth
                onClick={handleOpenCreateExerciseDialog}
              >
                {builderCopy.library.button_create}
              </Button>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={builderCopy.library.primary_filter_label}
                  value={exerciseCategory}
                  disabled={categoriesLoading && !exerciseCategoryOptions.length}
                  onChange={(event) => setExerciseCategory(event.target.value)}
                  sx={{ backgroundColor: theme.palette.background.default }}
                >
                  <MenuItem value="all">{builderCopy.library.primary_filter_all}</MenuItem>
                  {exerciseCategoryOptions.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={builderCopy.library.secondary_filter_label}
                  value={exerciseType}
                  onChange={(event) => setExerciseType(event.target.value as typeof exerciseType)}
                  sx={{ backgroundColor: theme.palette.background.default }}
                >
                  {exerciseTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {limitHint}
              </Typography>

              <Stack spacing={1.5}>
                {exercisesLoading ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : filteredExercises.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {emptyExercisesMessage}
                  </Typography>
                ) : (
                  filteredExercises.map((exercise) => (
                    <ProgramBuilderExerciseLibraryItem
                      key={exercise.id}
                      exercise={exercise}
                      disabled={sessions.length === 0}
                      onAdd={(event) =>
                        handleOpenExerciseMenu(exercise.id, event.currentTarget)
                      }
                      onEdit={handleOpenEditExerciseDialog}
                    />
                  ))
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Footer */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: 2, backgroundColor: '#e0dcdce0' }}>
          <Tooltip title={builderCopy.footer.cancel} arrow>
            <span style={{ display: 'inline-flex' }}>
              <Button variant="text" color="inherit" onClick={onCancel}>
                {builderCopy.footer.cancel}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={submitLabel} arrow>
            <span style={{ display: 'inline-flex' }}>
              <Button
                variant="contained"
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                color="success"
              >
                {submitLabel}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Exercise Add Menu */}
      <Menu
        anchorEl={exerciseMenuAnchor?.anchor ?? null}
        open={Boolean(exerciseMenuAnchor)}
        onClose={handleCloseExerciseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {sessions.length === 0 ? (
          <MenuItem disabled>{addExerciseFallbackLabel}</MenuItem>
        ) : (
          sessions.map((session) => (
            <MenuItem key={session.id} onClick={() => handleAddExerciseFromMenu(session.id)}>
              {session.label}
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Exercise Create/Edit Dialog */}
      <ProgramBuilderCreateExerciseDialog
        open={isExerciseDialogOpen}
        mode={exerciseBeingEdited ? 'edit' : 'create'}
        exercise={exerciseBeingEdited ?? undefined}
        categoryOptions={exerciseCategoryOptions}
        createExercise={createExercise}
        updateExercise={updateExercise}
        onClose={handleCloseExerciseDialog}
        onCreated={handleExerciseCreated}
        onUpdated={handleExerciseUpdated}
      />
    </>
  );
}

export type { BuilderCopy } from './programBuilderTypes';
