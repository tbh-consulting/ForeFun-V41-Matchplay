import { z } from 'zod';

const dogPolicyEnum = z.enum(['yes', 'no', 'na']);

// Schema for individual hole data
export const holeSchema = z.object({
  holeNumber: z.number().min(1).max(18),
  par: z.number().min(3).max(5),
  handicap: z.number().min(1).max(18).nullable().optional(),
  distanceBlackMeters: z.number().min(1).nullable().optional(),
  distanceWhiteMeters: z.number().min(1).nullable().optional(),
  distanceYellowMeters: z.number().min(1).nullable().optional(),
  distanceBlueMeters: z.number().min(1).nullable().optional(),
  distanceRedMeters: z.number().min(1).nullable().optional()
});

// Schema for course form data
export const courseFormSchema = z.object({
  course: z.object({
    name: z.string().min(3, 'Course name must be at least 3 characters'),
    address: z.string().min(3, 'Address must be at least 3 characters'),
    country: z.string().min(2, 'Please select a country'),
    description: z.string().nullable().optional(),
    holes: z.union([z.literal(9), z.literal(18)]),
    imageUrl: z.string().url().nullable().optional(),
    dogPolicy: dogPolicyEnum
  }),
  holes: z.array(holeSchema)
    .min(9)
    .max(18)
});