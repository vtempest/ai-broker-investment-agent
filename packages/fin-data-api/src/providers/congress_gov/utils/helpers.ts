/**
 * Congress.gov helpers
 * Converted from Python OpenBB congress_gov helpers
 */

import { BASE_URL, BillType, BillTypes } from './constants';
import { makeRequest } from '../../../utils/http';

/**
 * Map a year (1935-present) to the corresponding U.S. Congress number.
 * Raises Error if the year is before 1935.
 */
export function yearToCongress(year: number): number {
  if (year < 1935) {
    throw new Error('Year must be 1935 or later.');
  }
  // 74th Congress started in 1935
  const congressNumber = 74 + Math.floor((year - 1935) / 2);
  return congressNumber;
}

/**
 * Interface for bill query parameters
 */
export interface GetBillsByTypeParams {
  congress?: number;
  billType?: BillType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'asc' | 'desc';
}

/**
 * Fetch bills of a specific type for a given Congress number.
 * Results are sorted by date of the latest action on the bill.
 */
export async function getBillsByType(
  params: GetBillsByTypeParams,
  apiKey: string
): Promise<any> {
  let { congress, billType = 'hr', startDate, endDate, limit = 10, offset = 0, sortBy = 'desc' } = params;

  if (billType && !BillTypes.includes(billType)) {
    throw new Error(
      `Invalid bill type: ${billType}. Must be one of ${BillTypes.join(', ')}.`
    );
  }

  // Determine congress number if not provided
  if (!congress) {
    const currentYear = new Date().getFullYear();
    if (startDate) {
      congress = yearToCongress(new Date(startDate).getFullYear());
    } else if (endDate && !startDate) {
      congress = yearToCongress(new Date(endDate).getFullYear());
    } else {
      congress = yearToCongress(currentYear);
    }
  }

  let url = `${BASE_URL}bill/${congress}/${billType}`;
  const queryParams: string[] = [];

  if (startDate) {
    queryParams.push(`fromDateTime=${startDate}T00:00:00Z`);
  }
  if (endDate) {
    queryParams.push(`toDateTime=${endDate}T23:59:59Z`);
  }

  queryParams.push(`limit=${limit}`);
  queryParams.push(`offset=${offset}`);
  queryParams.push(`sort=updateDate+${sortBy}`);
  queryParams.push('format=json');
  queryParams.push(`api_key=${apiKey}`);

  url += '?' + queryParams.join('&');

  return await makeRequest(url);
}

/**
 * Fetch all bills of a specific type for a given Congress number.
 */
export async function getAllBillsByType(
  congress?: number,
  billType: BillType = 'hr',
  startDate?: string,
  endDate?: string,
  apiKey: string = ''
): Promise<any[]> {
  if (!BillTypes.includes(billType)) {
    throw new Error(
      `Invalid bill type: ${billType}. Must be one of ${BillTypes.join(', ')}.`
    );
  }

  const results: any[] = [];
  const limit = 250;
  let offset = 0;

  // Fetch first page to get total count
  const res = await getBillsByType(
    { congress, billType, startDate, endDate, limit, offset },
    apiKey
  );

  results.push(...(res.bills || []));

  const totalBills = res.pagination?.count || 0;
  const nextUrl = res.pagination?.next;

  if (!nextUrl || totalBills <= limit) {
    return results.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  }

  // Fetch remaining pages in parallel
  const numPages = Math.ceil(totalBills / limit);
  const urls: string[] = [];

  for (let i = 1; i < numPages; i++) {
    offset = i * limit;
    const url =
      nextUrl
        .replace(`offset=${limit}`, `offset=${offset}`)
        .replace('updateDate ', 'updateDate+') + `&api_key=${apiKey}`;
    urls.push(url);
  }

  // Fetch all pages in parallel
  const responses = await Promise.all(
    urls.map(async (url) => {
      try {
        return await makeRequest(url);
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
      }
    })
  );

  // Collect all bills from responses
  responses.forEach((response) => {
    if (response && response.bills) {
      results.push(...response.bills);
    }
  });

  // Sort by update date descending
  return results.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
}

/**
 * Get bill text versions and download links
 */
export async function getBillTextVersions(billUrl: string, apiKey: string): Promise<any[]> {
  const url = billUrl.replace('?', '/text?') + `&api_key=${apiKey}`;
  const response = await makeRequest(url);
  const billText = response.textVersions || [];

  if (!billText || billText.length === 0) {
    throw new Error('No text available for this bill currently.');
  }

  const textOutput: any[] = [];

  for (const version of billText) {
    const billVersion: any = {};
    const formats = version.formats || [];
    const billType = version.type || '';
    const versionDate = version.date || '';

    if (!formats || !versionDate) {
      continue;
    }

    billVersion.versionType = billType;
    billVersion.versionDate = versionDate;

    for (const fmt of formats) {
      const docUrl = fmt.url;
      const docType = fmt.type?.replace('Formatted ', '').toLowerCase();
      if (docType) {
        billVersion[docType] = docUrl;
      }
    }

    if (Object.keys(billVersion).length > 0) {
      textOutput.push(billVersion);
    }
  }

  return textOutput;
}
