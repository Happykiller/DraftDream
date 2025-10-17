import type { ExerciseVisibility } from '@hooks/useExercises';

export type ExerciseLibraryItem = {
  id: string;
  label: string;
  level: string;
  categoryId: string;
  categoryLabel: string;
  type: string;
  duration: number;
  sets: number;
  reps: string;
  rest: string;
  tags: string[];
};

export type TemplateExerciseRef = {
  exerciseId: string;
  sets?: number;
  reps?: string;
  rest?: string;
};

export type SessionTemplate = {
  id: string;
  label: string;
  duration: number;
  tags: string[];
  exercises: TemplateExerciseRef[];
};

export type ProgramExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
  customLabel?: string;
};

export type ProgramSession = {
  id: string;
  sessionId: string;
  label: string;
  duration: number;
  tags: string[];
  exercises: ProgramExercise[];
};

export type ProgramForm = {
  athlete: string;
  programName: string;
  duration: string;
  frequency: string;
  description: string;
};

export type DragPayload =
  | { type: 'session'; id: string }
  | { type: 'exercise'; id: string }
  | { type: 'session-move'; id: string }
  | { type: 'exercise-move'; sessionId: string; id: string };

export type BuilderCopy = {
  title: string;
  subtitle: string;
  config: {
    title: string;
    client_label: string;
    client_placeholder: string;
    program_name_label: string;
    duration_label: string;
    frequency_label: string;
    description_label: string;
    description_placeholder: string;
    search_placeholder: string;
    filter_label: string;
    filter_all: string;
    button_create: string;
  };
  templates_title: string;
  templates_subtitle: string;
  structure: {
    title: string;
    summary: string;
    empty: string;
    session_prefix: string;
    duration_unit: string;
    tags_label: string;
    exercise_drop_zone: string;
    custom_session_label: string;
  };
  library: {
    title: string;
    subtitle: string;
    search_placeholder: string;
    primary_filter_label: string;
    primary_filter_all: string;
    secondary_filter_label: string;
    secondary_filter_all: string;
    button_create: string;
    limit_hint?: string;
    type_private?: string;
    type_public?: string;
    empty_state?: string;
  };
  footer: {
    cancel: string;
    submit: string;
  };
  draft_label: string;
};

export type ExerciseTypeOption = {
  value: 'all' | ExerciseVisibility;
  label: string;
};

export type ExerciseCategoryOption = {
  id: string;
  label: string;
};
