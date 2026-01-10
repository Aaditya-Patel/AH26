import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  user_type: z.enum(['buyer', 'seller'], {
    required_error: 'Please select a user type',
  }),
  company_name: z.string().min(1, 'Company name is required'),
  sector: z.string().optional(),
}).refine(
  (data) => {
    // Sector is required only for buyers
    if (data.user_type === 'buyer' && !data.sector) {
      return false;
    }
    return true;
  },
  {
    message: 'Sector is required for buyers',
    path: ['sector'],
  }
);

export type RegisterFormData = z.infer<typeof registerSchema>;
