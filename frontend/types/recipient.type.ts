import { Meta, SuccessResponse } from './sucess';

export type Recipient = {
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone_number: string;
};

export type RecipientResponse = SuccessResponse<Recipient>;

export type AllRecipientResponse = SuccessResponse<Recipient[]> & {
  meta: Meta;
};
