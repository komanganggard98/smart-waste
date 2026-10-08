import { useMemo, useState } from 'react';
import type { z, ZodObject, ZodSchema } from 'zod';
import { ZodError } from 'zod';

export type Errors = Record<string, string>;

export default function useFormValidator<T = any>(schema: z.ZodObject<any>) {
  const [clientErrors, setClientErrors] = useState<Errors>({});

  function mapZodError(err: ZodError): Errors {
    const out: Errors = {};
    err.issues.forEach(e => {
      const key = e.path.length ? e.path.join('.') : '_';
      out[key] = e.message;
    });
    return out;
  }

  function handleValidate(values: Partial<T>) {
    if (!schema) {
      setClientErrors({});
      return { valid: true, errors: {} as Errors };
    }

    try {
      schema.parse(values as T);
      setClientErrors({});
      return { valid: true, errors: {} as Errors };
    } catch (e) {
      if (e instanceof ZodError) {
        const errs = mapZodError(e);
        setClientErrors(errs);
        return { valid: false, errors: errs };
      }
      throw e;
    }
  }

  const validateField = ( fieldName: string, value: any, fullData?: Record<string, any>) => {
      // Special handling untuk password_confirmation - manual validation
      if (fieldName === 'password_confirmation' && fullData) {
          if (value !== fullData.password) {
              return {
                  success: false,
                  error: {
                      issues: [{
                          message: "Passwords do not match",
                          path: ["password_confirmation"]
                      }]
                  }
              };
          }
          return { success: true, data: value, error:{ issues:[] } };
      }
  
      if (fullData) {
        const parse = schema.safeParse(fullData);
        const errors = parse.success ? {} : mapZodError(parse.error);

        setClientErrors(errors);

        return parse;
      }

        // Ambil skema parsial hanya untuk field yang sedang di-blur
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape];
      
      if (!fieldSchema) {
          return { success: false, data: value, error:{ issues:[] } };
      }
  
      const parse = fieldSchema.safeParse(value)
      setClientErrors((previousErrors) => {
        const nextErrors = { ...previousErrors };
        const message = parse.error?.issues[0]?.message;

        if (message) {
          nextErrors[fieldName] = message;
        } else {
          delete nextErrors[fieldName];
        }

        return nextErrors;
      });
      
      return parse;
  };

  const isError = useMemo(() => {
    return Object.values(clientErrors).some((message) => Boolean(message));
  },[clientErrors])
  
  return { clientErrors, isError, setClientErrors, handleValidate, validateField, clearErrors: () => setClientErrors({}) };
}