export type SuccessResponse<T = unknown> = {
  status: true;
  message: string;
  timestamp: string;
  data: T;
};

export type Meta = {
  page: number;
  per_page: number;
  max_page: number;
  count: number;
};
