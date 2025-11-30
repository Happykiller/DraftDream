export const VISIBILITY_OPTIONS = [
    { value: 'PRIVATE', label: 'common.visibility.private' },
    { value: 'PUBLIC', label: 'common.visibility.public' },
] as const;

export type Visibility = (typeof VISIBILITY_OPTIONS)[number]['value'];

export const getVisibilityLabel = (value: string, t: (key: string) => string) => {
    const option = VISIBILITY_OPTIONS.find(o => o.value.toUpperCase() === value?.toUpperCase());
    return option ? t(option.label) : value;
};
