import * as React from 'react';
import {
  DeleteOutline,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  Box,
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

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  totalExercises: number;
  onRemove: (exerciseId: string) => void;
  onLabelChange: (label: string) => void;
  onDescriptionChange: (description: string) => void;
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
  onDescriptionChange,
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
  const baseDescription = exercise.description ?? '';
  const displayDescription = exerciseItem.customDescription ?? baseDescription;
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [descriptionDraft, setDescriptionDraft] = React.useState(displayDescription);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const descriptionPlaceholder = React.useMemo(
    () =>
      t('programs-coatch.builder.structure.exercise_description_placeholder', {
        defaultValue: 'Exercise description (optional)...',
      }),
    [t],
  );

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

  React.useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionDraft(displayDescription);
    }
  }, [displayDescription, isEditingDescription]);

  React.useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

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

  const commitDescriptionChange = React.useCallback(() => {
    const trimmed = descriptionDraft.trim();
    const current = (exerciseItem.customDescription ?? baseDescription).trim();
    setIsEditingDescription(false);
    if (trimmed === current) {
      setDescriptionDraft(displayDescription);
      return;
    }
    onDescriptionChange(trimmed);
  }, [
    baseDescription,
    descriptionDraft,
    displayDescription,
    exerciseItem.customDescription,
    onDescriptionChange,
  ]);

  const cancelDescriptionEdition = React.useCallback(() => {
    setIsEditingDescription(false);
    setDescriptionDraft(displayDescription);
  }, [displayDescription]);

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

  const handleDescriptionClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      if (isEditingDescription) {
        return;
      }
      setDescriptionDraft(displayDescription);
      setIsEditingDescription(true);
    },
    [displayDescription, isEditingDescription],
  );

  const handleDescriptionDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      if (isEditingDescription) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setDescriptionDraft(displayDescription);
        setIsEditingDescription(true);
      }
    },
    [displayDescription, isEditingDescription],
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

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove(exerciseItem.id);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalExercises - 1;

  const handleMoveUpClick = () => {
    if (!canMoveUp) {
      return;
    }
    onMoveUp();
  };

  const handleMoveDownClick = () => {
    if (!canMoveDown) {
      return;
    }
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
            {isEditingDescription ? (
              <TextField
                inputRef={descriptionInputRef}
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                size="small"
                variant="standard"
                multiline
                minRows={2}
                placeholder={descriptionPlaceholder}
                inputProps={{ 'aria-label': 'exercise-description' }}
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
                    fontStyle: displayDescription ? 'normal' : 'italic',
                  }}
                >
                  {displayDescription || descriptionPlaceholder}
                </Box>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
            </Typography>
            {(exercise.muscles.length > 0 ||
              exercise.tags.length > 0 ||
              exercise.equipment.length > 0) && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {exercise.muscles.map((muscle) => (
                  <Tooltip
                    key={`${exercise.id}-muscle-${muscle.id}`}
                    title={tooltips.muscle_chip.replace('{{label}}', muscle.label)}
                    arrow
                  >
                    <Chip label={muscle.label} size="small" color="primary" variant="filled" />
                  </Tooltip>
                ))}
                {exercise.tags.map((tag) => (
                  <Tooltip
                    key={`${exercise.id}-tag-${tag.id}`}
                    title={tooltips.tag_chip.replace('{{label}}', tag.label)}
                    arrow
                  >
                    <Chip label={tag.label} size="small" color="secondary" variant="outlined" />
                  </Tooltip>
                ))}
                {exercise.equipment.map((eq) => (
                  <Tooltip
                    key={`${exercise.id}-equipment-${eq.id}`}
                    title={tooltips.equipment_chip.replace('{{label}}', eq.label)}
                    arrow
                  >
                    <Chip label={eq.label} size="small" variant="outlined" />
                  </Tooltip>
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
