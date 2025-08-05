import { Meta, SuccessResponse } from './sucess';

export type Locker = {
  locker_code: string;
  location: string;
};

export type LockerResponse = SuccessResponse<Locker>;

export type AllLockerResponse = SuccessResponse<Locker[]> & {
  meta: Meta;
};
