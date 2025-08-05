import z from 'zod';
import { phoneNumberRegex } from './user.schema';

export const SenderSchema = z.object({
  sender_name: z.string().min(3, 'Name must have at least 3 characters'),
  sender_email: z.string().email({ message: 'Email is not valid' }),
  sender_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Phone number format is not valid'),
});
