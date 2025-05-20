import { z } from 'zod';

export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string(), // Keep email in schema but don't validate it since it's read-only
  fullName: z.string().nullable().optional(),
  handicap: z.number()
    .nullable()
    .optional()
    .refine(val => val === null || (val >= -10 && val <= 54), {
      message: 'Handicap must be between -10 and 54'
    })
    .refine(val => val === null || Number.isFinite(val), {
      message: 'Invalid handicap value'
    })
    .refine(
      val => val === null || Number(val.toFixed(1)) === val,
      { message: 'Handicap can only have 1 decimal place' }
    ),
  homeClub: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});