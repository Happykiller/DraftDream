import type { ExerciseVisibility } from '@hooks/useExercises';

export type ExerciseLibraryItem = {
  id: string;
  label: string;
  level: string;
  categoryId: string;
  categoryLabel: string;
  type: ExerciseVisibility;
  visibility: ExerciseVisibility;
  duration: number;
  sets: number;
  reps: string;
  rest: string;
  description?: string;
  muscles: { id: string; label: string; role: 'primary' | 'secondary' }[];
  tags: { id: string; label: string }[];
  equipment: { id: string; label: string }[];
};

export type TemplateExerciseRef = {
  exerciseId: string;
  label: string;
  sets?: number;
  reps?: string;
  rest?: string;
};

export type SessionTemplate = {
  id: string;
  label: string;
  duration: number;
  description: string;
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
  customDescription?: string;
};

export type ProgramSession = {
  id: string;
  sessionId: string;
  label: string;
  duration: number;
  description: string;
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
  templates_limit_hint?: string;
  structure: {
    title: string;
    summary: string;
    header_description: string;
    session_counter_one: string;
    session_counter_other: string;
    exercise_counter_one: string;
    exercise_counter_other: string;
    empty: string;
    session_prefix: string;
    duration_unit: string;
    description_placeholder: string;
    exercise_description_placeholder?: string;
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
    tooltips: {
      add_exercise: string;
      public_exercise: string;
      primary_muscle_chip: string;
      secondary_muscle_chip: string;
      equipment_chip: string;
      tag_chip: string;
      move_session_up: string;
      move_session_down: string;
      delete_session: string;
      move_exercise_up: string;
      move_exercise_down: string;
      delete_exercise: string;
      add_empty_session: string;
      session_duration: string;
      add_session_template: string;
    };
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
