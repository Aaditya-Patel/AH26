import { z } from 'zod';

// PAN format: 5 uppercase letters, 4 digits, 1 uppercase letter
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// GSTIN format: 15 characters
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  user_type: z.enum(['buyer', 'seller'], {
    required_error: 'Please select a user type',
  }),
  company_name: z.string().min(1, 'Company name is required'),
  sector: z.string().optional(),
  pan_number: z.string().optional().refine(
    (val) => !val || panRegex.test(val.toUpperCase()),
    { message: 'Invalid PAN format (e.g., ABCDE1234F)' }
  ),
  gstin: z.string().optional().refine(
    (val) => !val || gstinRegex.test(val.toUpperCase()),
    { message: 'Invalid GSTIN format' }
  ),
  gci_registration_id: z.string().optional(),
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
