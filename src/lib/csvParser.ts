import Papa from 'papaparse';
import { KeywordData } from './types';

export function parseCsvWithDetection(text: string): { data: KeywordData[]; months: string[] } {
  // Find the header row: starts with 'Keyword' and has more than one tab (real header)
  const lines = text.split(/\r?\n/).map(line => line.trim());
  const headerIdx = lines.findIndex(line => line.startsWith('Keyword') && line.split('\t').length > 1);
  if (headerIdx === -1) {
    throw new Error('Could not find header row (missing "Keyword" column)');
  }
  const dataLines = lines.slice(headerIdx).join('\n');

  // Force delimiter to tab for this template
  const result = Papa.parse<KeywordData>(dataLines, {
    header: true,
    skipEmptyLines: true,
    delimiter: '\t',
  });

  // Map trimmed headers to original headers
  const rawHeaders = Object.keys(result.data[0] || {});
  const headerMap: Record<string, string> = {};
  rawHeaders.forEach(h => { headerMap[h.trim()] = h; });
  // Prefer columns that start with 'Searches:' (with or without a space)
  let searchCols = rawHeaders.filter(h => /^Searches:\s*/i.test(h.trim()));
  // Fallback: any column containing 'Searches'
  if (searchCols.length === 0) {
    searchCols = rawHeaders.filter(h => /searches/i.test(h));
  }
  if (searchCols.length === 0) {
    // Log all headers for debugging
    console.error('CSV HEADER DEBUG:', rawHeaders);
    throw new Error('No month/search columns found. Please check your CSV header format.');
  }
  // Debug: log searchCols and first row
  if ((result.data as KeywordData[]).length > 0) {
    const firstRow = result.data[0];
    console.log('DEBUG searchCols:', searchCols);
    console.log('DEBUG firstRow:', firstRow);
    console.log('DEBUG monthlySearches values:', searchCols.map(col => firstRow[headerMap[col.trim()]]));
  }
  const data: KeywordData[] = (result.data as KeywordData[]).map((row: KeywordData) => {
    const monthlySearches = searchCols.map(col => Number((row as any)[headerMap[col.trim()]]) || 0);
    return {
      keyword: (row as any)[headerMap['Keyword']],
      currency: (row as any)[headerMap['Currency']],
      avgMonthlySearches: Number((row as any)[headerMap['Avg. monthly searches']]) || 0,
      competition: (row as any)[headerMap['Competition']],
      topOfPageBidLow: Number((row as any)[headerMap['Top of page bid (low range)']]) || 0,
      topOfPageBidHigh: Number((row as any)[headerMap['Top of page bid (high range)']]) || 0,
      monthlySearches,
    };
  });
  return { data, months: searchCols };
} 