export interface CoverageLanguage {
  locale: string;
  total: number;
  translated: number;
  percentage: number;
}

export interface ScanResultRecord {
  id: string;
  repo: string;
  pr_number: number | null;
  hardcoded_count: number;
  missing_count: number;
  stale_count: number;
  fixed_count: number;
  coverage_overall: number;
  coverage_details: CoverageLanguage[];
  scan_timestamp: string;
}

export interface RepoRecord {
  id: string;
  full_name: string;
  latest_coverage: number;
  total_scans: number;
  total_fixes: number;
  languages: string[];
  updated_at: string;
}
