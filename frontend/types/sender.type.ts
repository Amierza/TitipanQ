import { Meta, SuccessResponse } from './sucess';

export type Sender = {
  sender_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone_number: string;
};

export type SenderResponse = SuccessResponse<Sender>;

export type AllSenderResponse = SuccessResponse<Sender[]> & {
  meta: Meta;
};
