// Interface untuk setiap item histori
export interface PackageHistoryItem {
  history_id: string;
  history_status: string;
  changed_by: string;
  created_at: string;
}

// Interface response dari API
export interface PackageHistoryResponse {
  status: boolean;
  message: string;
  timestamp: string;
  data: PackageHistoryItem[];
  meta: {
    page: number;
    per_page: number;
    max_page: number;
    count: number;
  };
}