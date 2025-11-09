// src/components/nutrition/mealPlanBuilderTypes.ts
import type { MealPlanDaySnapshot, MealPlanMealSnapshot } from '@hooks/nutrition/useMealPlans';

export interface MealPlanBuilderForm {
  planName: string;
  description: string;
  calories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
}

export interface MealPlanBuilderMeal extends MealPlanMealSnapshot {
  uiId: string;
}

export interface MealPlanBuilderDay extends MealPlanDaySnapshot {
  uiId: string;
  meals: MealPlanBuilderMeal[];
}

export interface MealPlanBuilderCopy {
  title: string;
  edit_title?: string;
  subtitle: string;
  edit_subtitle?: string;
  config: {
    title: string;
    client_label: string;
    client_placeholder: string;
    plan_name_label: string;
    plan_name_default: string;
    plan_description_label: string;
    plan_description_placeholder: string;
    calories_label: string;
    protein_label: string;
    carbs_label: string;
    fats_label: string;
  };
  day_library: {
    title: string;
    subtitle: string;
    search_placeholder: string;
    empty_state: string;
    add_label: string;
    limit_hint?: string;
    refresh_label?: string;
  };
  meal_library: {
    title: string;
    subtitle: string;
    search_placeholder: string;
    empty_state: string;
    add_label: string;
    create_label: string;
    limit_hint?: string;
    add_tooltip: string;
    refresh_label?: string;
    menu_empty: string;
    public_tooltip?: string;
    delete_tooltip?: string;
    edit_tooltip?: string;
    edit_title?: string;
  };
  structure: {
    title: string;
    description_placeholder: string;
    empty: string;
    day_prefix: string;
    meal_prefix: string;
    foods_label: string;
    calories_label: string;
    protein_label: string;
    carbs_label: string;
    fats_label: string;
    remove_day_label: string;
    remove_meal_label: string;
    add_meal_placeholder: string;
    add_day_label: string;
    select_day_warning: string;
    move_day_up_label: string;
    move_day_down_label: string;
    move_meal_up_label: string;
    move_meal_down_label: string;
  };
  footer: {
    cancel: string;
    submit: string;
    update?: string;
  };
}
