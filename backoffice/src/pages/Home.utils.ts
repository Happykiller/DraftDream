
export const PAGE_SIZE = 100;
export const MAX_TREND_ITEMS = 30;

export type DatedItem = {
  createdAt?: string | null;
};

export type DistributionItem = {
  visibility?: string | null;
};

export type RatingItem = {
  satisfactionRating?: number | null;
};

export type ChartPoint = {
  name: string;
  value: number;
};

const MIN_RATING = 0;
const MAX_RATING = 10;

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

/**
 * Build a distribution of satisfaction ratings for record widgets.
 *
 * @param items List of items containing satisfaction ratings.
 * @param unknownLabel Label for missing or invalid ratings.
 * @returns Array of ChartPoint for ratings 0-10 plus unknown bucket.
 */
export const getRatingDistribution = <T extends RatingItem>(
  items: T[],
  unknownLabel: string,
): ChartPoint[] => {
  const ratingCounts = new Map<number, number>();
  for (let rating = MIN_RATING; rating <= MAX_RATING; rating += 1) {
    ratingCounts.set(rating, 0);
  }

  let unknownCount = 0;

  items.forEach((item) => {
    const rating = item.satisfactionRating;
    if (typeof rating !== 'number' || Number.isNaN(rating)) {
      unknownCount += 1;
      return;
    }

    const rounded = Math.round(rating);
    if (rounded < MIN_RATING || rounded > MAX_RATING) {
      unknownCount += 1;
      return;
    }

    ratingCounts.set(rounded, (ratingCounts.get(rounded) ?? 0) + 1);
  });

  const distribution = Array.from(ratingCounts.entries()).map(([rating, value]) => ({
    name: String(rating),
    value,
  }));

  if (unknownCount > 0) {
    distribution.push({ name: unknownLabel, value: unknownCount });
  }

  return distribution;
};
