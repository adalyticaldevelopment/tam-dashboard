export interface KeywordData {
  keyword: string;
  currency: string;
  avgMonthlySearches: number;
  competition: string;
  topOfPageBidLow: number;
  topOfPageBidHigh: number;
  monthlySearches?: number[]; // last 3 months
} 