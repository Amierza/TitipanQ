import z from 'zod';

export const LockerSchema = z.object({
  locker_code: z.string().min(3, 'Locker code at least 3 character'),
  location: z.string().min(1, 'Location must be filled'),
});
