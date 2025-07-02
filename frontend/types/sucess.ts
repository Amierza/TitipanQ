export type SuccessResponse<T = unknown> = {
  status: true;
  message: string;
  timestamp: string;
  data: T;
};
