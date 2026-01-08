
export const PAGE_SIZE = 100;
export const MAX_TREND_ITEMS = 30;

export type DatedItem = {
  createdAt?: string | null;
};

export type DistributionItem = {
  visibility?: string | null;
};

export type ChartPoint = {
  name: string;
  value: number;
};

/**
 * Build a cumulative trend dataset for the growth widgets.
 * 
 * @param items List of items containing a date field (default: createdAt).
 * @param dateKey The key to use for the date property.
 * @returns Array of ChartPoint for the recent trend.
 */
export const getGrowthData = <T extends DatedItem>(
  items: T[],
  dateKey: keyof T = 'createdAt' as keyof T
): ChartPoint[] => {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => {
    const left = a[dateKey] ? new Date(String(a[dateKey])).getTime() : 0;
    const right = b[dateKey] ? new Date(String(b[dateKey])).getTime() : 0;
    return left - right;
  });

  const recent = sorted.slice(-MAX_TREND_ITEMS);

  return recent.map((item, index) => {
    const dateValue = item[dateKey];
    const label = dateValue ? new Date(String(dateValue)).toLocaleDateString() : 'Unknown';

    return {
      name: label,
      value: index + 1,
    };
  });
};

/**
 * Aggregate distribution values for the split widgets.
 * 
 * @param items List of items to categorize.
 * @param key The property key to group by.
 * @param labelMap Optional mapping from raw value to display label.
 * @returns Array of ChartPoint with counts per category.
 */
export const getDistributionData = <T extends DistributionItem>(
  items: T[],
  key: keyof T,
  labelMap?: Record<string, string>,
): ChartPoint[] => {
  const counts = items.reduce<Record<string, number>>((accumulator, item) => {
    const rawValue = item[key];
    const value = rawValue ? String(rawValue) : 'Unknown';
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.keys(counts).map((label) => ({
    name: labelMap?.[label] ?? label,
    value: counts[label],
  }));
};
