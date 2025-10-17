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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';

import { ProgramBuilderSessionItem } from './ProgramBuilderSessionItem';
import { ProgramBuilderSessionLibraryItem } from './ProgramBuilderSessionLibraryItem';
import { ProgramBuilderSessionDropZone } from './ProgramBuilderSessionDropZone';
import { ProgramBuilderExerciseLibraryItem } from './ProgramBuilderExerciseLibraryItem';
import type { BuilderCopy } from './programBuilderTypes';
import { beginDrag } from './programBuilderUtils';

import type { User } from '@src/hooks/useUsers';
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
    exerciseCategories,
    exerciseTypeOptions,
    exerciseMap,
    limitHint,
    emptyExercisesMessage,
    summaryText,
    sessionDropZoneLabel,
    exerciseDropZoneLabel,
    sessionsLoading,
    exercisesLoading,
    categoriesLoading,
    usersLoading,
    isDraggingSession,
    isDraggingExercise,
    sessionDragOrigin,
    exerciseDragOrigin,
    setSessionSearch,
    setExerciseSearch,
    setExerciseCategory,
    setExerciseType,
    setUsersQ,
    handleSelectAthlete,
    handleFormChange,
    handleAddSessionFromTemplate,
    handleCreateEmptySession,
    handleRemoveSession,
    handleRemoveExercise,
    handleSessionLabelChange,
    handleExerciseLabelChange,
    handleExerciseDropAtPosition,
    handleSessionDropAtPosition,
    handleSessionDragStartFromLibrary,
    handleSessionDragStartFromDraft,
    handleSessionDragEnd,
    handleExerciseDragStartFromLibrary,
    handleExerciseDragStartFromSession,
    handleExerciseDragEnd,
    handleSubmit,
    userLabel,
  } = useProgramBuilder(builderCopy, onCancel);

  const sessionDropEffect: 'copy' | 'move' =
    sessionDragOrigin === 'draft' ? 'move' : 'copy';
  const exerciseDropEffect: 'copy' | 'move' =
    exerciseDragOrigin === 'draft' ? 'move' : 'copy';

  return (
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

                <TextField
                  label={builderCopy.config.program_name_label}
                  placeholder={builderCopy.config.client_placeholder}
                  size="small"
                  fullWidth
                  value={form.programName}
                  onChange={handleFormChange('programName')}
                />

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label={builderCopy.config.duration_label}
                    size="small"
                    fullWidth
                    value={form.duration}
                    onChange={handleFormChange('duration')}
                  />
                  <TextField
                    label={builderCopy.config.frequency_label}
                    size="small"
                    fullWidth
                    value={form.frequency}
                    onChange={handleFormChange('frequency')}
                  />
                </Stack>

                <TextField
                  label={builderCopy.config.description_label}
                  placeholder={builderCopy.config.description_placeholder}
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={handleFormChange('description')}
                />

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
                          onDragStart={(event) => {
                            handleSessionDragStartFromLibrary();
                            beginDrag(event, { type: 'session', id: template.id });
                          }}
                          onDragEnd={handleSessionDragEnd}
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
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {builderCopy.structure.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {summaryText}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {builderCopy.structure.summary}
                </Typography>
              </Stack>

              <Box
                sx={{
                  border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
                  borderRadius: 2,
                  p: 2,
                  minHeight: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                {sessions.length === 0 ? (
                  <Stack spacing={1} alignItems="center" justifyContent="center" flexGrow={1}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {builderCopy.structure.empty}
                    </Typography>
                    <ProgramBuilderSessionDropZone
                      label={sessionDropZoneLabel}
                      dropEffect={sessionDropEffect}
                      onDrop={(event) => handleSessionDropAtPosition(0, event)}
                      isVisible={isDraggingSession}
                    />
                  </Stack>
                ) : (
                  <>
                    <ProgramBuilderSessionDropZone
                      label={sessionDropZoneLabel}
                      dropEffect={sessionDropEffect}
                      onDrop={(event) => handleSessionDropAtPosition(0, event)}
                      isVisible={isDraggingSession}
                    />
                    {sessions.map((session, index) => (
                      <React.Fragment key={session.id}>
                        <ProgramBuilderSessionItem
                          session={session}
                          index={index}
                          builderCopy={builderCopy}
                          onLabelChange={handleSessionLabelChange}
                          onRemoveSession={() => handleRemoveSession(session.id)}
                          onRemoveExercise={(exerciseId) =>
                            handleRemoveExercise(session.id, exerciseId)
                          }
                          onDragStart={(event) => {
                            handleSessionDragStartFromDraft();
                            beginDrag(event, { type: 'session-move', id: session.id });
                          }}
                          onDragEnd={handleSessionDragEnd}
                          getExerciseById={(exerciseId) => exerciseMap.get(exerciseId)}
                          isDraggingExercise={isDraggingExercise}
                          exerciseDropLabel={exerciseDropZoneLabel}
                          exerciseDropEffect={exerciseDropEffect}
                          onExerciseDrop={handleExerciseDropAtPosition}
                          onExerciseLabelChange={handleExerciseLabelChange}
                          onExerciseDragStart={(sessionId, exerciseId, dragEvent) => {
                            handleExerciseDragStartFromSession();
                            beginDrag(dragEvent, {
                              type: 'exercise-move',
                              sessionId,
                              id: exerciseId,
                            });
                          }}
                          onExerciseDragEnd={handleExerciseDragEnd}
                        />
                        <ProgramBuilderSessionDropZone
                          key={`session-drop-${index + 1}`}
                          label={sessionDropZoneLabel}
                          dropEffect={sessionDropEffect}
                          onDrop={(event) => handleSessionDropAtPosition(index + 1, event)}
                          isVisible={isDraggingSession}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Add fontSize="small" />}
                onClick={handleCreateEmptySession}
              >
                {builderCopy.config.button_create}
              </Button>
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={builderCopy.library.primary_filter_label}
                  value={exerciseCategory}
                  disabled={categoriesLoading && !exerciseCategories.length}
                  onChange={(event) => setExerciseCategory(event.target.value)}
                >
                  <MenuItem value="all">{builderCopy.library.primary_filter_all}</MenuItem>
                  {exerciseCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
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
                      onDragStart={(event) => {
                        handleExerciseDragStartFromLibrary();
                        beginDrag(event, { type: 'exercise', id: exercise.id });
                      }}
                      onDragEnd={handleExerciseDragEnd}
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="text" color="inherit" onClick={onCancel}>
            {builderCopy.footer.cancel}
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {builderCopy.footer.submit}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
