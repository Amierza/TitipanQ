import z from 'zod';
import { phoneNumberRegex } from './user.schema';

export const RecipientSchema = z.object({
  recipient_name: z.string().min(3, 'Name must have at least 3 characters'),
  recipient_email: z.string().email({ message: 'Email is not valid' }),
  recipient_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Phone number format is not valid'),
});
