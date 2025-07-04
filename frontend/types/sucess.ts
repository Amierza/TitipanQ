export type SuccessResponse<T = unknown> = {
  status: true;
  message: string;
  timestamp: string;
  data: T;
};

export type meta = {
  page: number;
  per_page: number;
  max_page: number;
  count: number;
};
