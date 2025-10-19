import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
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

interface ProgramBuilderPanelProps {
  builderCopy: BuilderCopy;
  onCancel: () => void;
}

export function ProgramBuilderPanel({
  builderCopy,
  onCancel,
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
    registerExercise,
  } = useProgramBuilder(builderCopy, onCancel);

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

  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = React.useState(false);

  const [structureTitle, setStructureTitle] = React.useState(builderCopy.structure.title);
  const [structureTitleDraft, setStructureTitleDraft] = React.useState(builderCopy.structure.title);
  const [structureDescription, setStructureDescription] = React.useState(
    builderCopy.structure.header_description,
  );
  const [structureDescriptionDraft, setStructureDescriptionDraft] = React.useState(
    builderCopy.structure.header_description,
  );
  const [isEditingStructureTitle, setIsEditingStructureTitle] = React.useState(false);
  const [isEditingStructureDescription, setIsEditingStructureDescription] = React.useState(false);
  const structureTitleRef = React.useRef<HTMLInputElement | null>(null);
  const structureDescriptionRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prevStructureDescriptionRef = React.useRef(builderCopy.structure.header_description);
  const debouncedStructureTitleDraft = useDebouncedValue(structureTitleDraft, 300);
  const debouncedStructureDescriptionDraft = useDebouncedValue(structureDescriptionDraft, 300);

  React.useEffect(() => {
    setIsEditingStructureTitle(false);
    setStructureTitle(builderCopy.structure.title);
    setStructureTitleDraft(builderCopy.structure.title);
  }, [builderCopy.structure.title]);

  React.useEffect(() => {
    updateProgramName(builderCopy.structure.title);
  }, [builderCopy.structure.title, updateProgramName]);

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
    if (!isEditingStructureDescription) {
      return;
    }
    const trimmed = debouncedStructureDescriptionDraft.trim();
    const fallback = structureDescription || builderCopy.structure.header_description;
    updateProgramDescription(trimmed || fallback);
  }, [
    builderCopy.structure.header_description,
    debouncedStructureDescriptionDraft,
    isEditingStructureDescription,
    structureDescription,
    updateProgramDescription,
  ]);

  React.useEffect(() => {
    const previous = prevStructureDescriptionRef.current;
    const next = builderCopy.structure.header_description;
    if (previous !== next) {
      prevStructureDescriptionRef.current = next;
      if (!isEditingStructureDescription) {
        setStructureDescription(next);
        setStructureDescriptionDraft(next);
        updateProgramDescription(next);
      }
    }
  }, [
    builderCopy.structure.header_description,
    isEditingStructureDescription,
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
    setIsCreateExerciseDialogOpen(true);
  }, []);

  const handleCloseCreateExerciseDialog = React.useCallback(() => {
    setIsCreateExerciseDialogOpen(false);
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
      handleCloseCreateExerciseDialog();
    },
    [
      exerciseCategory,
      exerciseType,
      handleCloseCreateExerciseDialog,
      registerExercise,
      setExerciseCategory,
      setExerciseType,
    ],
  );

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          bgcolor: alpha(theme.palette.background.paper, 0.98),
        }}
      >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {builderCopy.title}
          </Typography>
          <Chip
            label={builderCopy.draft_label}
            variant="outlined"
            size="small"
            color="default"
          />
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {builderCopy.subtitle}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <Stack spacing={3}>
              <Paper
                sx={{
                  p: 2.5,
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
                  />
                  <TextField
                    label={builderCopy.config.frequency_label}
                    size="small"
                    fullWidth
                    value={form.frequency}
                    onChange={handleFormChange('frequency')}
                    required
                    inputProps={{ 'aria-required': true }}
                  />
                </Stack>

                <Divider />

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
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 5 }}>
            <Paper
              sx={{
                p: 2.5,
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
                  border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
                  borderRadius: 2,
                  p: 2,
                  minHeight: 280,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
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
                    variant="outlined"
                    size="small"
                    startIcon={<Add fontSize="small" />}
                    fullWidth
                    onClick={handleCreateEmptySession}
                  >
                    {builderCopy.config.button_create}
                  </Button>
                </span>
              </Tooltip>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <Paper
              sx={{
                p: 2.5,
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
              />

              <Button
                variant="contained"
                size="small"
                startIcon={<Add fontSize="small" />}
                sx={{ alignSelf: 'flex-start' }}
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
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Tooltip title={builderCopy.footer.cancel} arrow>
            <span style={{ display: 'inline-flex' }}>
              <Button variant="text" color="inherit" onClick={onCancel}>
                {builderCopy.footer.cancel}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={builderCopy.footer.submit} arrow>
            <span style={{ display: 'inline-flex' }}>
              <Button
                variant="contained"
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {builderCopy.footer.submit}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      </Paper>

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

      <ProgramBuilderCreateExerciseDialog
        open={isCreateExerciseDialogOpen}
        categoryOptions={exerciseCategoryOptions}
        createExercise={createExercise}
        onClose={handleCloseCreateExerciseDialog}
        onCreated={handleExerciseCreated}
      />
    </>
  );
}

export type { BuilderCopy } from './programBuilderTypes';
