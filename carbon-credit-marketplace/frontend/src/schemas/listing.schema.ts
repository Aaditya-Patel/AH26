import { z } from 'zod';

export const listingSchema = z.object({
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  }).min(1, 'Quantity must be at least 1'),
  price_per_credit: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  }).min(0, 'Price must be positive'),
  vintage: z.number({
    required_error: 'Vintage is required',
    invalid_type_error: 'Vintage must be a number',
  }).int('Vintage must be a whole number')
    .min(2000, 'Vintage must be 2000 or later')
    .max(new Date().getFullYear(), `Vintage cannot exceed ${new Date().getFullYear()}`),
  project_type: z.string().min(1, 'Project type is required'),
  description: z.string().optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
