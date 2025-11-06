import * as React from 'react';
import {
  DeleteOutline,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ProgramExercise,
  ProgramSession,
} from './programBuilderTypes';
import { ProgramBuilderExerciseItem } from './ProgramBuilderExerciseItem';

type ProgramBuilderSessionItemProps = {
  session: ProgramSession;
  index: number;
  totalSessions: number;
  builderCopy: BuilderCopy;
  onLabelChange: (sessionId: string, label: string) => void;
  onDescriptionChange: (sessionId: string, description: string) => void;
  onDurationChange: (sessionId: string, duration: number) => void;
  onRemoveSession: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  getExerciseById: (exerciseId: string) => ExerciseLibraryItem | undefined;
  onExerciseLabelChange: (
    sessionId: string,
    exerciseId: string,
    label: string,
  ) => void;
  onExerciseDescriptionChange: (
    sessionId: string,
    exerciseId: string,
    description: string,
  ) => void;
  onMoveExerciseUp: (exerciseId: string) => void;
  onMoveExerciseDown: (exerciseId: string) => void;
  onEditExercise?: (sessionId: string, exerciseItem: ProgramExercise) => void;
};

export const ProgramBuilderSessionItem = React.memo(function ProgramBuilderSessionItem({
  session,
  index,
  totalSessions,
  builderCopy,
  onLabelChange,
  onDescriptionChange,
  onDurationChange,
  onRemoveSession,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  getExerciseById,
  onExerciseLabelChange,
  onExerciseDescriptionChange,
  onMoveExerciseUp,
  onMoveExerciseDown,
  onEditExercise,
}: ProgramBuilderSessionItemProps): React.JSX.Element {
  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;
  const successMain = theme.palette.success.main;
  const successBorderColor = React.useMemo(
    () => alpha(successMain, 0.45),
    [successMain],
  );
  const successHoverBackground = React.useMemo(
    () => alpha(successMain, 0.08),
    [successMain],
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

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState(session.label);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [descriptionDraft, setDescriptionDraft] = React.useState(session.description);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [isEditingDuration, setIsEditingDuration] = React.useState(false);
  const [durationDraft, setDurationDraft] = React.useState(String(session.duration));
  const durationInputRef = React.useRef<HTMLInputElement | null>(null);
  const tooltips = builderCopy.library.tooltips;
  const descriptionPlaceholder = builderCopy.structure.description_placeholder;

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(session.label);
    }
  }, [session.label, isEditingLabel]);

  React.useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  React.useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionDraft(session.description);
    }
  }, [isEditingDescription, session.description]);

  React.useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  React.useEffect(() => {
    if (!isEditingDuration) {
      setDurationDraft(String(session.duration));
    }
  }, [isEditingDuration, session.duration]);

  React.useEffect(() => {
    if (isEditingDuration && durationInputRef.current) {
      durationInputRef.current.focus();
      durationInputRef.current.select();
    }
  }, [isEditingDuration]);

  const commitLabelChange = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    const nextLabel = trimmed || builderCopy.structure.custom_session_label;
    setIsEditingLabel(false);
    if (nextLabel !== session.label) {
      onLabelChange(session.id, nextLabel);
    }
  }, [
    builderCopy.structure.custom_session_label,
    labelDraft,
    onLabelChange,
    session.id,
    session.label,
  ]);

  const cancelLabelEdition = React.useCallback(() => {
    setIsEditingLabel(false);
    setLabelDraft(session.label);
  }, [session.label]);

  const handleLabelClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      if (isEditingLabel) {
        return;
      }
      setLabelDraft(session.label);
      setIsEditingLabel(true);
    },
    [isEditingLabel, session.label],
  );

  const handleLabelDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      if (isEditingLabel) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setLabelDraft(session.label);
        setIsEditingLabel(true);
      }
    },
    [isEditingLabel, session.label],
  );

  const handleLabelKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitLabelChange();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelLabelEdition();
      }
    },
    [cancelLabelEdition, commitLabelChange],
  );

  const handleLabelBlur = React.useCallback(() => {
    if (isEditingLabel) {
      commitLabelChange();
    }
  }, [commitLabelChange, isEditingLabel]);

  const commitDescriptionChange = React.useCallback(() => {
    const nextDescription = descriptionDraft.trim();
    setIsEditingDescription(false);
    if (nextDescription !== session.description) {
      onDescriptionChange(session.id, nextDescription);
    }
  }, [descriptionDraft, onDescriptionChange, session.description, session.id]);

  const cancelDescriptionEdition = React.useCallback(() => {
    setIsEditingDescription(false);
    setDescriptionDraft(session.description);
  }, [session.description]);

  const handleDescriptionClick = React.useCallback(
    (event: React.MouseEvent<HTMLParagraphElement>) => {
      event.stopPropagation();
      if (isEditingDescription) {
        return;
      }
      setDescriptionDraft(session.description);
      setIsEditingDescription(true);
    },
    [isEditingDescription, session.description],
  );

  const handleDescriptionDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLParagraphElement>) => {
      if (isEditingDescription) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setDescriptionDraft(session.description);
        setIsEditingDescription(true);
      }
    },
    [isEditingDescription, session.description],
  );

  const handleDescriptionKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        commitDescriptionChange();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelDescriptionEdition();
      }
    },
    [cancelDescriptionEdition, commitDescriptionChange],
  );

  const handleDescriptionBlur = React.useCallback(() => {
    if (isEditingDescription) {
      commitDescriptionChange();
    }
  }, [commitDescriptionChange, isEditingDescription]);

  const commitDurationChange = React.useCallback(() => {
    const parsed = Number.parseInt(durationDraft, 10);
    const normalized = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    setIsEditingDuration(false);
    if (normalized !== session.duration) {
      onDurationChange(session.id, normalized);
    }
  }, [durationDraft, onDurationChange, session.duration, session.id]);

  const cancelDurationEdition = React.useCallback(() => {
    setIsEditingDuration(false);
    setDurationDraft(String(session.duration));
  }, [session.duration]);

  const handleDurationKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitDurationChange();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelDurationEdition();
      }
    },
    [cancelDurationEdition, commitDurationChange],
  );

  const handleDurationBlur = React.useCallback(() => {
    if (isEditingDuration) {
      commitDurationChange();
    }
  }, [commitDurationChange, isEditingDuration]);

  const handleDurationClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      if (isEditingDuration) {
        return;
      }
      setDurationDraft(String(session.duration));
      setIsEditingDuration(true);
    },
    [isEditingDuration, session.duration],
  );

  const handleDurationDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      if (isEditingDuration) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setDurationDraft(String(session.duration));
        setIsEditingDuration(true);
      }
    },
    [isEditingDuration, session.duration],
  );

  const handleRemoveSession = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
    onRemoveSession();
  };

  const handleRemoveExercise = (exerciseId: string): void => {
    onRemoveExercise(exerciseId);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalSessions - 1;

  const handleMoveUpClick = React.useCallback(() => {
    if (!canMoveUp) {
      return;
    }
    onMoveUp();
  }, [canMoveUp, index, onMoveUp]);

  const handleMoveDownClick = React.useCallback(() => {
    if (!canMoveDown) {
      return;
    }
    onMoveDown();
  }, [canMoveDown, index, onMoveDown]);

  const handleMoveExerciseUp = React.useCallback(
    (exerciseId: string, position: number) => {
      if (position === 0) {
        return;
      }
      onMoveExerciseUp(exerciseId);
    },
    [onMoveExerciseUp],
  );

  const handleMoveExerciseDown = React.useCallback(
    (exerciseId: string, position: number, lastIndex: number) => {
      if (position >= lastIndex) {
        return;
      }
      onMoveExerciseDown(exerciseId);
    },
    [onMoveExerciseDown],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        borderColor: successBorderColor,
        '&:hover': {
          borderColor: successMain,
          boxShadow: theme.shadows[2],
          backgroundColor: successHoverBackground,
        },
      }}
    >
      {/* Session item */}
      <Stack spacing={1.5}>
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0.5} alignItems="center">
                {/* Session reorder actions */}
                <Tooltip title={tooltips.move_session_up} arrow>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      size="small"
                      onClick={handleMoveUpClick}
                      disabled={!canMoveUp}
                      aria-label="move-session-up"
                    >
                      <KeyboardArrowUp fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={tooltips.move_session_down} arrow>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      size="small"
                      onClick={handleMoveDownClick}
                      disabled={!canMoveDown}
                      aria-label="move-session-down"
                    >
                      <KeyboardArrowDown fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {builderCopy.structure.session_prefix} {index + 1} -
                </Typography>
                {isEditingLabel ? (
                  <TextField
                    inputRef={inputRef}
                    value={labelDraft}
                    onChange={(event) => setLabelDraft(event.target.value)}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    size="small"
                    variant="standard"
                    inputProps={{
                      'aria-label': 'session-label',
                      sx: { fontWeight: 600 },
                    }}
                    sx={{ minWidth: 120 }}
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    component="span"
                    sx={{
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      ...interactiveSurfaceSx,
                    }}
                    onClick={handleLabelClick}
                    onKeyDown={handleLabelDisplayKeyDown}
                    tabIndex={0}
                    role="button"
                  >
                    <Edit fontSize="inherit" color="disabled" />
                    {session.label}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={tooltips.session_duration} arrow>
                {isEditingDuration ? (
                  <TextField
                    inputRef={durationInputRef}
                    value={durationDraft}
                    onChange={(event) => setDurationDraft(event.target.value)}
                    onBlur={handleDurationBlur}
                    onKeyDown={handleDurationKeyDown}
                    size="small"
                    variant="standard"
                    type="number"
                    inputProps={{
                      min: 0,
                      'aria-label': 'session-duration',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {builderCopy.structure.duration_unit}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 120 }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      ...interactiveSurfaceSx,
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: 500,
                    }}
                    onClick={handleDurationClick}
                    onKeyDown={handleDurationDisplayKeyDown}
                    tabIndex={0}
                    role="button"
                    aria-label="session-duration-display"
                  >
                    {session.duration} {builderCopy.structure.duration_unit}
                  </Typography>
                )}
              </Tooltip>
              {/* Delete session */}
              <Tooltip title={tooltips.delete_session} arrow>
                <span style={{ display: 'inline-flex' }}>
                  <IconButton
                    size="small"
                    onClick={handleRemoveSession}
                    aria-label="delete-session"
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        {/* Session description */}
        {isEditingDescription ? (
          <TextField
            inputRef={descriptionInputRef}
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            size="small"
            variant="standard"
            placeholder={descriptionPlaceholder}
            multiline
            minRows={1}
            inputProps={{
              'aria-label': 'session-description',
            }}
            fullWidth
          />
        ) : (
          <Typography
            variant="body2"
            component="p"
            color="text.secondary"
            sx={{
              ...interactiveSurfaceSx,
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 0.5,
              maxWidth: '100%',
            }}
            onClick={handleDescriptionClick}
            onKeyDown={handleDescriptionDisplayKeyDown}
            tabIndex={0}
            role="button"
          >
            <Edit fontSize="inherit" color="disabled" />
            <Box
              component="span"
              sx={{
                whiteSpace: 'pre-wrap',
                fontStyle: session.description ? 'normal' : 'italic',
              }}
            >
              {session.description || descriptionPlaceholder}
            </Box>
          </Typography>
        )}
      </Stack>

        {/* Session tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {session.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        {/* Exercises list */}
        <Stack spacing={1}>
          {session.exercises.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {builderCopy.library.subtitle}
            </Typography>
          ) : (
            session.exercises.map((exerciseItem, exerciseIndex) => {
              const exercise = getExerciseById(exerciseItem.exerciseId);
              if (!exercise) {
                return null;
              }

              return (
                <ProgramBuilderExerciseItem
                  key={exerciseItem.id}
                  exerciseItem={exerciseItem}
                  exercise={exercise}
                  index={exerciseIndex}
                  totalExercises={session.exercises.length}
                  onRemove={handleRemoveExercise}
                  onLabelChange={(nextLabel) =>
                    onExerciseLabelChange(session.id, exerciseItem.id, nextLabel)
                  }
                  onDescriptionChange={(nextDescription) =>
                    onExerciseDescriptionChange(session.id, exerciseItem.id, nextDescription)
                  }
                  onMoveUp={() => handleMoveExerciseUp(exerciseItem.id, exerciseIndex)}
                  onMoveDown={() =>
                    handleMoveExerciseDown(
                      exerciseItem.id,
                      exerciseIndex,
                      session.exercises.length - 1,
                    )
                  }
                  onEdit={
                  onEditExercise
                    ? () => onEditExercise(session.id, exerciseItem)
                    : undefined
                  }
                />
              );
            })
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
