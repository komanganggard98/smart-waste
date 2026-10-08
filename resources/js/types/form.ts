import { InputHTMLAttributes, PropsWithChildren } from 'react';
import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string({ error: 'Please enter your password' }).min(1, 'Please enter your password')
})

export const userFormSchema = z.object({
  name: z.string({ error: 'Please enter your name' })
    .trim()
    .min(3, 'Name must be at least 3 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string({ error: 'Please create a password' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
    .regex(/[a-z]/, 'Password needs at least one lowercase letter')
    .regex(/[0-9]/, 'Password needs at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password needs at least one special character'),
});

export const userDetailFormSchema = userFormSchema.extend({
  branch_id: z.number({ error: 'Please select a branch' }),
  role_id: z.number({ error: 'Please select a role' }),
})

export const userUpdateSchema = userDetailFormSchema.omit({password:true})

// Ekstrak type untuk digunakan di React Hook Form
export type UserFormData = z.infer<typeof userFormSchema>;

// Type untuk InputPasswordProps, menambahkan properti className opsional
export type InputPasswordProps = PropsWithChildren<{
    className?:string
}>
// Type untuk InputProps, menambahkan properti isFocused opsional
export type InputProps = InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean };

export const branchFormSchema = z.object({
  name: z.string({ error: 'Please enter a branch name' })
  .trim()
  .min(1, 'Please enter a branch name'),
  address: z.string({ error: 'Please enter the branch address' })
  .trim()
  .min(1, 'Please enter the branch address')
});

export const ingredientFormSchema = z.object({
  branch_id: z.number({ error: 'Please select a branch' }),
  code: z.string({ error: 'Please enter an ingredient code' })
    .trim()
    .min(1, 'Please enter an ingredient code'),
  name: z.string({ error: 'Please enter an ingredient name' })
    .trim()
    .min(1, 'Please enter an ingredient name'),
  unit: z.enum(['ml', 'g', 'pcs'], {
    error: 'Stock unit must be ml, g, or pcs',
  }),
  minimum_stock: z.number({ error: 'Please enter the minimum stock' })
    .min(0, 'Minimum stock cannot be negative'),
  expiry_alert_days: z.number({ error: 'Please enter the expiry alert period' })
    .min(0, 'Expiry alert days cannot be negative')
})

export const ingredientBatchFormSchema = z.object({
  batch_number: z.nullable(z.string({ error: 'Please enter a batch number' })),
  purchase_date: z.string({ error: 'Please select the purchase date' })
    .min(1, 'Please select the purchase date'),
  expiration_date: z.string({ error: 'Please select the expiration date' })
    .min(1, 'Please select the expiration date')
    .refine(
      (expirationDate) => expirationDate > new Date().toISOString().split('T')[0],
      'Expiration date must be after today'
    ),
  purchase_unit: z.string({ error: 'Please select the purchase unit' })
  .min(1, 'Please select the purchase unit'),
  purchase_quantity: z.coerce.number({ error: 'Please enter the purchase quantity' })
  .min(0.01, 'Purchase quantity must be greater than zero'),
  units_per_purchase: z.coerce.number({ error: 'Please enter the pack size' })
  .min(0.0001, 'Pack size must be greater than zero'),
  purchase_total_cost: z.coerce.number({ error: 'Please enter the total purchase cost' })
  .min(0, 'Total purchase cost cannot be negative'),
  quantity_remaining: z.coerce.number({ error: 'Please enter a valid remaining quantity' })
  .min(0, 'Remaining quantity cannot be negative'),
  quantity_received: z.coerce.number({ error: 'Please enter a valid received quantity' })
  .min(0, 'Received quantity cannot be negative'),
  unit_cost: z.coerce.number({ error: 'Please enter a valid unit cost' })
  .min(0, 'Unit cost cannot be negative')
})
  .refine(
    ({ purchase_date, expiration_date }) => !purchase_date || !expiration_date || purchase_date <= expiration_date,
    {
      path: ['purchase_date'],
      message: 'Purchase date must be on or before the expiration date'
    }
  )
