/**
 * Alpha Vantage Helpers Module
 * Converted from Python OpenBB alpha_vantage utils
 */

export const INTERVALS_DICT: Record<string, string> = {
  m: 'TIME_SERIES_INTRADAY',
  d: 'TIME_SERIES_DAILY',
  W: 'TIME_SERIES_WEEKLY',
  M: 'TIME_SERIES_MONTHLY',
};

/**
 * Get the interval string for Alpha Vantage API
 */
export function getInterval(value: string): string {
  const intervals: Record<string, string> = {
    m: 'min',
    d: 'day',
    W: 'week',
    M: 'month',
  };

  const lastChar = value.slice(-1);
  const prefix = value.slice(0, -1);
  return `${prefix}${intervals[lastChar]}`;
}

/**
 * Extract the alphabetical part of the key using regex
 */
export function extractKeyName(key: string): string {
  const match = key.match(/\d+\.\s+([a-z]+)/i);
  return match ? match[1] : key;
}

/**
 * Filter data by start and end dates
 */
export function filterByDates(
  data: Array<{ date: string; [key: string]: any }>,
  startDate: Date,
  endDate: Date
): Array<{ date: string; [key: string]: any }> {
  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}
