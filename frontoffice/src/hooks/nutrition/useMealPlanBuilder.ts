// src/hooks/nutrition/useMealPlanBuilder.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { UserType } from '@src/commons/enums';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { useCoachAthleteUsers } from '@hooks/athletes/useCoachAthleteUsers';
import type { User } from '@src/hooks/useUsers';
import { slugify } from '@src/utils/slugify';
import { session } from '@stores/session';

import {
  useMealPlans,
  type MealPlan,
  type MealPlanDaySnapshot,
  type MealPlanMealSnapshot,
  type MealPlanMealTypeSnapshot,
  type MealPlanUserSummary,
} from './useMealPlans';
import { useMealDays, type MealDay } from './useMealDays';
import { useMeals, type Meal } from './useMeals';
import { useMealTypes, type MealType } from './useMealTypes';

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderDay,
  MealPlanBuilderForm,
  MealPlanBuilderMeal,
  MealPlanBuilderNutritionSummary,
} from '@components/nutrition/mealPlanBuilderTypes';

import { computePlanNutritionSummary } from '@components/nutrition/mealPlanBuilderUtils';

interface UseMealPlanBuilderOptions {
  onCancel: () => void;
  onCreated?: (plan: MealPlan) => void;
  onUpdated?: (plan: MealPlan) => void;
  mealPlan?: MealPlan | null;
}

export interface UseMealPlanBuilderResult {
  form: MealPlanBuilderForm;
  selectedAthlete: User | null;
  users: User[];
  usersLoading: boolean;
  setUsersQ: React.Dispatch<React.SetStateAction<string>>;
  daySearch: string;
  setDaySearch: React.Dispatch<React.SetStateAction<string>>;
  mealSearch: string;
  setMealSearch: React.Dispatch<React.SetStateAction<string>>;
  dayLibrary: MealDay[];
  dayLibraryLoading: boolean;
  mealLibrary: Meal[];
  mealLibraryLoading: boolean;
  mealTypes: MealType[];
  mealTypesLoading: boolean;
  selectedMealTypeId: string | null;
  days: MealPlanBuilderDay[];
  handleSelectAthlete: (_event: unknown, user: User | null) => void;
  handleFormChange: (
    field: keyof MealPlanBuilderForm,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddDayFromTemplate: (template: MealDay) => void;
  handleCreateEmptyDay: () => void;
  handleRemoveDay: (dayId: string) => void;
  handleMoveDayUp: (dayId: string) => void;
  handleMoveDayDown: (dayId: string) => void;
  handleUpdateDay: (dayId: string, patch: Partial<MealPlanBuilderDay>) => void;
  handleAddMealToDay: (dayId: string, meal: Meal) => void;
  handleRemoveMeal: (dayId: string, mealUiId: string) => void;
  handleMoveMealUp: (dayId: string, mealUiId: string) => void;
  handleMoveMealDown: (dayId: string, mealUiId: string) => void;
  handleUpdateMeal: (
    dayId: string,
    mealUiId: string,
    patch: Partial<MealPlanBuilderMeal>,
  ) => void;
  handleSelectMealType: (type: MealType | null) => void;
  handleSubmit: (event?: React.SyntheticEvent) => Promise<void>;
  isSubmitDisabled: boolean;
  submitting: boolean;
  mode: 'create' | 'edit';
  reloadMeals: () => Promise<void>;
  createMeal: ReturnType<typeof useMeals>['create'];
  updateMeal: ReturnType<typeof useMeals>['update'];
  removeMeal: ReturnType<typeof useMeals>['remove'];
  reloadMealDays: () => Promise<void>;
  updatePlanName: (value: string) => void;
  nutritionSummary: MealPlanBuilderNutritionSummary;
  totalMeals: number;
}

function generateUiId() {
  return `ui-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

type MealTypeFallback = {
  label: string;
  id?: string | null;
  templateMealTypeId?: string | null;
  slug?: string | null;
  locale?: string | null;
  visibility?: string | null;
  icon?: string | null;
};

function coerceMealTypeSnapshot(
  input: Partial<MealPlanMealTypeSnapshot> | null | undefined,
  fallback: MealTypeFallback,
): MealPlanMealTypeSnapshot {
  const id = input?.id ?? fallback.id ?? undefined;
  const templateMealTypeId =
    input?.templateMealTypeId ?? fallback.templateMealTypeId ?? id;

  return {
    id,
    templateMealTypeId,
    slug: input?.slug ?? fallback.slug ?? undefined,
    locale: input?.locale ?? fallback.locale ?? undefined,
    label: input?.label ?? fallback.label,
    visibility: input?.visibility ?? fallback.visibility ?? undefined,
    icon: input?.icon ?? fallback.icon ?? undefined,
  };
}

function mapMealPlanAthleteToUser(summary: MealPlanUserSummary | null | undefined): User | null {
  if (!summary) {
    return null;
  }

  return {
    id: summary.id,
    type: UserType.Athlete,
    first_name: summary.first_name ?? '',
    last_name: summary.last_name ?? '',
    email: summary.email,
    phone: null,
    address: null,
    company: null,
    createdAt: null,
    updatedAt: null,
    is_active: true,
    createdBy: '',
  };
}

function cloneMealSnapshot(meal: MealPlanMealSnapshot): MealPlanBuilderMeal {
  const type = coerceMealTypeSnapshot(meal.type, {
    label: meal.type.label ?? meal.label,
    id: meal.type.id ?? undefined,
    templateMealTypeId: meal.type.templateMealTypeId ?? undefined,
    slug: meal.type.slug ?? undefined,
    locale: meal.type.locale ?? meal.locale ?? undefined,
    visibility: meal.type.visibility ?? undefined,
    icon: meal.type.icon ?? undefined,
  });

  return {
    ...meal,
    uiId: generateUiId(),
    description: meal.description ?? '',
    foods: meal.foods ?? '',
    calories: meal.calories ?? 0,
    proteinGrams: meal.proteinGrams ?? 0,
    carbGrams: meal.carbGrams ?? 0,
    fatGrams: meal.fatGrams ?? 0,
    type,
  };
}

function normalizeMealForSubmission(meal: MealPlanBuilderMeal): MealPlanMealSnapshot {
  const type = coerceMealTypeSnapshot(meal.type ?? null, {
    label: meal.type?.label ?? meal.label,
    id: meal.type?.id ?? undefined,
    templateMealTypeId: meal.type?.templateMealTypeId ?? undefined,
    slug: meal.type?.slug ?? undefined,
    locale: meal.type?.locale ?? meal.locale ?? undefined,
    visibility: meal.type?.visibility ?? undefined,
    icon: meal.type?.icon ?? undefined,
  });

  return {
    id: meal.id ?? undefined,
    templateMealId: meal.templateMealId ?? undefined,
    slug: meal.slug ?? undefined,
    locale: meal.locale ?? undefined,
    label: meal.label,
    description: meal.description ?? undefined,
    foods: meal.foods ?? '',
    calories: Number(meal.calories ?? 0),
    proteinGrams: Number(meal.proteinGrams ?? 0),
    carbGrams: Number(meal.carbGrams ?? 0),
    fatGrams: Number(meal.fatGrams ?? 0),
    type,
  };
}

function cloneDaySnapshot(day: MealPlanDaySnapshot): MealPlanBuilderDay {
  return {
    ...day,
    uiId: generateUiId(),
    description: day.description ?? '',
    meals: day.meals.map(cloneMealSnapshot),
  };
}

function createMealFromTemplate(meal: Meal): MealPlanBuilderMeal {
  const type = coerceMealTypeSnapshot(
    meal.type
      ? {
          id: meal.type.id ?? undefined,
          templateMealTypeId: meal.type.id ?? undefined,
          slug: meal.type.slug ?? undefined,
          locale: meal.type.locale ?? undefined,
          label: meal.type.label,
          visibility: meal.type.visibility ?? undefined,
          icon: meal.type.icon ?? undefined,
        }
      : {
          id: meal.typeId ?? undefined,
          templateMealTypeId: meal.typeId ?? undefined,
        },
    {
      label: meal.type?.label ?? meal.label,
      id: meal.type?.id ?? meal.typeId ?? undefined,
      templateMealTypeId: meal.type?.id ?? meal.typeId ?? undefined,
      slug: meal.type?.slug ?? undefined,
      locale: meal.type?.locale ?? meal.locale ?? undefined,
      visibility: meal.type?.visibility ?? meal.visibility ?? undefined,
      icon: meal.type?.icon ?? undefined,
    },
  );

  const snapshot: MealPlanMealSnapshot = {
    id: undefined,
    templateMealId: meal.id,
    slug: meal.slug,
    locale: meal.locale,
    label: meal.label,
    description: undefined,
    foods: meal.foods,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbGrams: meal.carbGrams,
    fatGrams: meal.fatGrams,
    type,
  };

  return {
    ...snapshot,
    uiId: generateUiId(),
  };
}

export function useMealPlanBuilder(
  builderCopy: MealPlanBuilderCopy,
  { onCreated, onUpdated, mealPlan }: UseMealPlanBuilderOptions,
): UseMealPlanBuilderResult {
  const { i18n } = useTranslation();
  const basePlan = mealPlan ?? null;
  const mode: 'create' | 'edit' = basePlan ? 'edit' : 'create';
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(() => session.getState().id);

  React.useEffect(() => {
    const unsubscribe = session.subscribe((state) => {
      setCurrentUserId(state.id);
    });
    return unsubscribe;
  }, []);

  const [form, setForm] = React.useState<MealPlanBuilderForm>(() => ({
    planName: (() => {
      const candidate = basePlan?.label?.trim() ?? '';
      return candidate.length > 0 ? candidate : builderCopy.config.plan_name_default;
    })(),
    description: basePlan?.description?.trim() ?? '',
  }));

  const [selectedAthlete, setSelectedAthlete] = React.useState<User | null>(
    () => mapMealPlanAthleteToUser(basePlan?.athlete),
  );
  const [days, setDays] = React.useState<MealPlanBuilderDay[]>(() =>
    basePlan?.days?.length ? basePlan.days.map(cloneDaySnapshot) : [],
  );

  const [daySearch, setDaySearch] = React.useState('');
  const [mealSearch, setMealSearch] = React.useState('');
  const [selectedMealTypeId, setSelectedMealTypeId] = React.useState<string | null>(null);
  const debouncedDaySearch = useDebouncedValue(daySearch, 300);
  const debouncedMealSearch = useDebouncedValue(mealSearch, 300);

  const [usersQ, setUsersQ] = React.useState('');
  const debouncedUsersQ = useDebouncedValue(usersQ, 300);

  const { items: users, loading: usersLoading } = useCoachAthleteUsers({
    coachId: currentUserId,
    search: debouncedUsersQ,
  });

  const {
    items: mealDays,
    loading: dayLibraryLoading,
    reload: reloadMealDays,
  } = useMealDays({
    page: 1,
    limit: 10,
    q: debouncedDaySearch,
  });

  const {
    items: meals,
    loading: mealLibraryLoading,
    reload: reloadMeals,
    create: createMeal,
    update: updateMeal,
    remove: removeMeal,
  } = useMeals({
    page: 1,
    limit: 10,
    q: debouncedMealSearch,
    typeId: selectedMealTypeId ?? undefined,
  });

  const {
    items: mealTypes,
    loading: mealTypesLoading,
  } = useMealTypes({
    page: 1,
    limit: 25,
    q: '',
  });

  const filteredMealTypes = React.useMemo(
    () => mealTypes.filter((type) => type.locale === i18n.language),
    [i18n.language, mealTypes],
  );

  React.useEffect(() => {
    if (!selectedMealTypeId) {
      return;
    }

    const stillAvailable = filteredMealTypes.some((type) => type.id === selectedMealTypeId);
    if (!stillAvailable) {
      setSelectedMealTypeId(null);
    }
  }, [filteredMealTypes, selectedMealTypeId]);

  const { create, update } = useMealPlans({
    page: 1,
    limit: 1,
    q: '',
  });

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!basePlan) {
      return;
    }

    setForm({
      planName: basePlan.label,
      description:
        basePlan.description && basePlan.description.length > 0
          ? basePlan.description
          : builderCopy.structure.description_placeholder,
    });
    setSelectedAthlete(mapMealPlanAthleteToUser(basePlan.athlete));
    setDays(basePlan.days.map(cloneDaySnapshot));
  }, [basePlan, builderCopy.structure.description_placeholder]);

  const handleSelectAthlete = React.useCallback(
    (_event: unknown, user: User | null) => {
      setSelectedAthlete(user);
      setUsersQ('');
    },
    [],
  );

  const handleFormChange = React.useCallback(
    (field: keyof MealPlanBuilderForm) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const updatePlanName = React.useCallback((value: string) => {
    setForm((prev) => ({ ...prev, planName: value }));
  }, []);

  const handleSelectMealType = React.useCallback(
    (type: MealType | null) => {
      setSelectedMealTypeId(type?.id ?? null);
    },
    [],
  );

  const handleAddDayFromTemplate = React.useCallback((template: MealDay) => {
    const daySnapshot: MealPlanDaySnapshot = {
      id: undefined,
      templateMealDayId: template.id,
      slug: template.slug,
      locale: template.locale,
      label: template.label,
      description: template.description ?? undefined,
      meals: (template.meals ?? []).map((meal) => {
        const type = coerceMealTypeSnapshot(
          meal.type
            ? {
                id: meal.type.id ?? undefined,
                templateMealTypeId: meal.type.id ?? undefined,
                slug: meal.type.slug ?? undefined,
                locale: meal.type.locale ?? undefined,
                label: meal.type.label,
                visibility: meal.type.visibility ?? undefined,
              }
            : undefined,
          {
            label: meal.type?.label ?? meal.label,
            id: meal.type?.id ?? undefined,
            templateMealTypeId: meal.type?.id ?? undefined,
            slug: meal.type?.slug ?? undefined,
            locale: meal.type?.locale ?? meal.locale ?? undefined,
            visibility: meal.type?.visibility ?? meal.visibility ?? undefined,
          },
        );

        return {
          id: meal.id,
          templateMealId: meal.id,
          slug: meal.slug,
          locale: meal.locale,
          label: meal.label,
          description: undefined,
          foods: meal.foods ?? '',
          calories: meal.calories ?? 0,
          proteinGrams: meal.proteinGrams ?? 0,
          carbGrams: meal.carbGrams ?? 0,
          fatGrams: meal.fatGrams ?? 0,
          type,
        };
      }),
    };

    const cloned = cloneDaySnapshot(daySnapshot);
    setDays((prev) => [...prev, cloned]);
  }, []);

  const handleCreateEmptyDay = React.useCallback(() => {
    const emptyDay: MealPlanDaySnapshot = {
      id: undefined,
      templateMealDayId: undefined,
      slug: undefined,
      locale: i18n.language,
      label: `${builderCopy.structure.day_prefix} ${days.length + 1}`,
      description: '',
      meals: [],
    };

    const cloned = cloneDaySnapshot(emptyDay);
    setDays((prev) => [...prev, cloned]);
  }, [builderCopy.structure.day_prefix, days.length, i18n.language]);

  const handleRemoveDay = React.useCallback((dayId: string) => {
    setDays((prev) => prev.filter((day) => day.uiId !== dayId));
  }, []);

  const handleMoveDayUp = React.useCallback((dayId: string) => {
    setDays((prev) => {
      const index = prev.findIndex((day) => day.uiId === dayId);
      if (index <= 0) {
        return prev;
      }
      const clone = [...prev];
      const [target] = clone.splice(index, 1);
      clone.splice(index - 1, 0, target);
      return clone;
    });
  }, []);

  const handleMoveDayDown = React.useCallback((dayId: string) => {
    setDays((prev) => {
      const index = prev.findIndex((day) => day.uiId === dayId);
      if (index < 0 || index === prev.length - 1) {
        return prev;
      }
      const clone = [...prev];
      const [target] = clone.splice(index, 1);
      clone.splice(index + 1, 0, target);
      return clone;
    });
  }, []);

  const handleUpdateDay = React.useCallback((dayId: string, patch: Partial<MealPlanBuilderDay>) => {
    setDays((prev) =>
      prev.map((day) =>
        day.uiId === dayId
          ? {
              ...day,
              ...patch,
            }
          : day,
      ),
    );
  }, []);

  const handleAddMealToDay = React.useCallback((dayId: string, meal: Meal) => {
    setDays((prev) => {
      const hasTargetDay = prev.some((day) => day.uiId === dayId);
      if (!hasTargetDay) {
        return prev;
      }

      const nextMeal = createMealFromTemplate(meal);

      return prev.map((day) =>
        day.uiId === dayId
          ? {
              ...day,
              meals: [...day.meals, nextMeal],
            }
          : day,
      );
    });
  }, []);

  const handleRemoveMeal = React.useCallback((dayId: string, mealUiId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.uiId === dayId
          ? {
              ...day,
              meals: day.meals.filter((meal) => meal.uiId !== mealUiId),
            }
          : day,
      ),
    );
  }, []);

  const handleMoveMealUp = React.useCallback((dayId: string, mealUiId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.uiId !== dayId) {
          return day;
        }

        const index = day.meals.findIndex((meal) => meal.uiId === mealUiId);
        if (index <= 0) {
          return day;
        }

        const clone = [...day.meals];
        const [target] = clone.splice(index, 1);
        clone.splice(index - 1, 0, target);
        return { ...day, meals: clone };
      }),
    );
  }, []);

  const handleMoveMealDown = React.useCallback((dayId: string, mealUiId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.uiId !== dayId) {
          return day;
        }

        const index = day.meals.findIndex((meal) => meal.uiId === mealUiId);
        if (index < 0 || index === day.meals.length - 1) {
          return day;
        }

        const clone = [...day.meals];
        const [target] = clone.splice(index, 1);
        clone.splice(index + 1, 0, target);
        return { ...day, meals: clone };
      }),
    );
  }, []);

  const handleUpdateMeal = React.useCallback(
    (dayId: string, mealUiId: string, patch: Partial<MealPlanBuilderMeal>) => {
      setDays((prev) =>
        prev.map((day) =>
          day.uiId === dayId
            ? {
                ...day,
                meals: day.meals.map((meal) =>
                  meal.uiId === mealUiId
                    ? {
                        ...meal,
                        ...patch,
                      }
                    : meal,
                ),
              }
            : day,
        ),
      );
    },
    [],
  );

  const nutritionSummary = React.useMemo(
    () => computePlanNutritionSummary(days),
    [days],
  );

  const totalMeals = React.useMemo(
    () =>
      days.reduce((accumulator, day) => {
        return accumulator + day.meals.length;
      }, 0),
    [days],
  );

  const isSubmitDisabled = React.useMemo(() => {
    if (!form.planName.trim()) {
      return true;
    }

    return submitting;
  }, [form.planName, submitting]);

  const handleSubmit = React.useCallback(
    async (event?: React.SyntheticEvent) => {
      event?.preventDefault();

      if (isSubmitDisabled) {
        return;
      }

      setSubmitting(true);

      const payloadDays: MealPlanDaySnapshot[] = days.map((day, index) => ({
        id: day.id ?? undefined,
        templateMealDayId: day.templateMealDayId ?? undefined,
        slug: day.slug ?? undefined,
        locale: day.locale ?? i18n.language,
        label: day.label ?? `${builderCopy.structure.day_prefix} ${index + 1}`,
        description: day.description ?? undefined,
        meals: day.meals.map(normalizeMealForSubmission),
      }));

      const submission = {
        slug: slugify(form.planName, `${Date.now()}`),
        locale: i18n.language,
        label: form.planName.trim(),
        description: form.description?.trim() ?? '',
        calories: nutritionSummary.calories,
        proteinGrams: nutritionSummary.proteinGrams,
        carbGrams: nutritionSummary.carbGrams,
        fatGrams: nutritionSummary.fatGrams,
        days: payloadDays,
        userId: selectedAthlete?.id ?? null,
      };

      try {
        if (mode === 'create') {
          const created = await create(submission);
          onCreated?.(created);
        } else if (basePlan) {
          await update({
            id: basePlan.id,
            ...submission,
          });
          const refreshedPlan = {
            ...basePlan,
            ...submission,
          } as MealPlan;
          onUpdated?.(refreshedPlan);
        }
      } catch (caught: unknown) {
        console.error('[useMealPlanBuilder] Failed to persist meal plan', caught);
      } finally {
        setSubmitting(false);
      }
    },
    [
      basePlan,
      builderCopy.structure.day_prefix,
      create,
      days,
      form.description,
      form.planName,
      i18n.language,
      isSubmitDisabled,
      mode,
      nutritionSummary.carbGrams,
      nutritionSummary.calories,
      nutritionSummary.fatGrams,
      nutritionSummary.proteinGrams,
      onCreated,
      onUpdated,
      selectedAthlete?.id,
      update,
    ],
  );

  return {
    form,
    selectedAthlete,
    users,
    usersLoading,
    setUsersQ,
    daySearch,
    setDaySearch,
    mealSearch,
    setMealSearch,
    dayLibrary: mealDays,
    dayLibraryLoading,
    mealLibrary: meals,
    mealLibraryLoading,
    mealTypes: filteredMealTypes,
    mealTypesLoading,
    selectedMealTypeId,
    days,
    handleSelectAthlete,
    handleFormChange,
    handleAddDayFromTemplate,
    handleCreateEmptyDay,
    handleRemoveDay,
    handleMoveDayUp,
    handleMoveDayDown,
    handleUpdateDay,
    handleAddMealToDay,
    handleRemoveMeal,
    handleMoveMealUp,
    handleMoveMealDown,
    handleUpdateMeal,
    handleSelectMealType,
    handleSubmit,
    isSubmitDisabled,
    submitting,
    mode,
    reloadMeals,
    createMeal,
    updateMeal,
    removeMeal,
    reloadMealDays,
    updatePlanName,
    nutritionSummary,
    totalMeals,
  };
}
