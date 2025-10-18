import * as React from 'react';
import {
  DeleteOutline,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ProgramExercise,
} from './programBuilderTypes';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  totalExercises: number;
  onRemove: (exerciseId: string) => void;
  onLabelChange: (label: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export const ProgramBuilderExerciseItem = React.memo(function ProgramBuilderExerciseItem({
  exerciseItem,
  exercise,
  index,
  totalExercises,
  onRemove,
  onLabelChange,
  onMoveUp,
  onMoveDown,
}: ProgramBuilderExerciseItemProps): React.JSX.Element {
  const theme = useTheme();
  const primaryMain = theme.palette.primary.main;
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
  const { t } = useTranslation();
  const tooltips = React.useMemo(
    () =>
      t('programs-coatch.builder.library.tooltips', {
        returnObjects: true,
      }) as BuilderCopy['library']['tooltips'],
    [t],
  );

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const displayLabel = exerciseItem.customLabel ?? exercise.label;
  const [labelDraft, setLabelDraft] = React.useState(displayLabel);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(displayLabel);
    }
  }, [displayLabel, isEditingLabel]);

  React.useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  const commitLabelChange = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    const nextLabel = trimmed || exercise.label;
    setIsEditingLabel(false);
    if (nextLabel !== displayLabel) {
      onLabelChange(nextLabel);
    }
  }, [displayLabel, exercise.label, labelDraft, onLabelChange]);

  const cancelLabelEdition = React.useCallback(() => {
    setIsEditingLabel(false);
    setLabelDraft(displayLabel);
  }, [displayLabel]);

  const handleLabelClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      if (isEditingLabel) {
        return;
      }
      setLabelDraft(displayLabel);
      setIsEditingLabel(true);
    },
    [displayLabel, isEditingLabel],
  );

  const handleLabelDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      if (isEditingLabel) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setLabelDraft(displayLabel);
        setIsEditingLabel(true);
      }
    },
    [displayLabel, isEditingLabel],
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

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] remove exercise clicked', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
    });
    onRemove(exerciseItem.id);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalExercises - 1;

  const handleMoveUpClick = () => {
    if (!canMoveUp) {
      return;
    }
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] move exercise up', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
      fromIndex: index,
    });
    onMoveUp();
  };

  const handleMoveDownClick = () => {
    if (!canMoveDown) {
      return;
    }
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] move exercise down', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
      fromIndex: index,
    });
    onMoveDown();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Stack spacing={0.5} alignItems="center" pt={0.25}>
            <Tooltip title={tooltips.move_exercise_up} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleMoveUpClick}
                  disabled={!canMoveUp}
                  aria-label="move-exercise-up"
                >
                  <KeyboardArrowUp fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={tooltips.move_exercise_down} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleMoveDownClick}
                  disabled={!canMoveDown}
                  aria-label="move-exercise-down"
                >
                  <KeyboardArrowDown fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 24 }}>
            {index + 1}.
          </Typography>

          <Stack spacing={0.5}>
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
                  'aria-label': 'exercise-label',
                  sx: { fontWeight: 600 },
                }}
                sx={{ minWidth: 160 }}
              />
            ) : (
              <Typography
                variant="subtitle2"
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
                {displayLabel}
              </Typography>
            )}
            {exercise.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {exercise.description}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
            </Typography>
            {(exercise.muscles.length > 0 ||
              exercise.tags.length > 0 ||
              exercise.equipment.length > 0) && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {exercise.muscles.map((muscle) => (
                  <Chip
                    key={`${exercise.id}-muscle-${muscle.id}`}
                    label={muscle.label}
                    size="small"
                    color={muscle.role === 'primary' ? 'primary' : 'default'}
                    variant={muscle.role === 'primary' ? 'filled' : 'outlined'}
                  />
                ))}
                {exercise.tags.map((tag) => (
                  <Chip
                    key={`${exercise.id}-tag-${tag.id}`}
                    label={tag.label}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))}
                {exercise.equipment.map((eq) => (
                  <Chip
                    key={`${exercise.id}-equipment-${eq.id}`}
                    label={eq.label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>

        <Tooltip title={tooltips.delete_exercise} arrow>
          <span style={{ display: 'inline-flex' }}>
            <IconButton
              size="small"
              onClick={handleRemoveClick}
              aria-label="delete-exercise"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
});
