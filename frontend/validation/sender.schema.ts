import z from 'zod';
import { phoneNumberRegex } from './user.schema';

export const SenderSchema = z.object({
  user_name: z.string().min(3, 'Name must have at least 3 characters'),
  user_email: z.string().email({ message: 'Email is not valid' }),
  user_phone_number: z
    .string()
    .regex(phoneNumberRegex, 'Phone number format is not valid'),
});
