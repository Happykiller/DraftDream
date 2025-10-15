import * as React from 'react';
import { DeleteOutline, DragIndicator } from '@mui/icons-material';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import type { ExerciseLibraryItem, ProgramExercise } from './ProgramBuilderPanel';

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  onRemove: (exerciseId: string) => void;
  onLabelChange: (label: string) => void;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export function ProgramBuilderExerciseItem({
  exerciseItem,
  exercise,
  index,
  onRemove,
  onLabelChange,
  onDragStart,
  onDragEnd,
}: ProgramBuilderExerciseItemProps): React.JSX.Element {
  const theme = useTheme();

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

  const handleLabelDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      setLabelDraft(displayLabel);
      setIsEditingLabel(true);
    },
    [displayLabel],
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
    onRemove(exerciseItem.id);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (isEditingLabel) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    onDragStart?.(event);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onDragEnd?.();
  };

  return (
    <Paper
      variant="outlined"
      draggable={!isEditingLabel}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'grab',
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
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <DragIndicator fontSize="small" color="disabled" />
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
                sx={{ fontWeight: 600, cursor: 'text' }}
                onDoubleClick={handleLabelDoubleClick}
              >
                {displayLabel}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.tags.map((tag) => (
                <Chip
                  key={`${exercise.id}-${tag}`}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Stack>

        <IconButton
          size="small"
          onClick={handleRemoveClick}
          aria-label="delete-exercise"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
