import { userFormSchema } from "@/types/form";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const focusValidationField = (fieldName: string) => {
    const input = (document.getElementsByName(fieldName)[0] ?? document.getElementById(fieldName)) as HTMLElement | undefined;

    if (!input) return;

    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

export const copyText = async (text:string) => {
    try{
        await navigator.clipboard.writeText(text)
    }catch(err){
        console.error('Failed to copy text: ', err);
    }
}

export function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one of each required character type
  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the remaining 4 characters (total 8) with random mix
  const allChars = upper + lower + numbers + special;
  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password characters randomly
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function formatExpiry(date?: string) {
    if (!date) return '-';

    const expiryDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(expiryDate.getTime())) return date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000);

    if (daysLeft < 0) return 'Expired';
    if (daysLeft < 7) return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;

    return expiryDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}


export const handleServerValidation = ({
    serverErrors,
    setClientErrors,
    setFormState,
    normalizeField,
    onFirstField,
    fallbackError = 'Please review the highlighted fields.',
}: {
    serverErrors: Record<string, unknown>;
    setClientErrors: (errors: Record<string, string>) => void;
    setFormState?: (state: { loading: boolean; error?: string }) => void;
    normalizeField?: (field: string) => string;
    onFirstField?: (field: string) => void;
    fallbackError?: string;
}) => {
    const normalizedErrors: Record<string, string> = {};
    const fields = Object.keys(serverErrors);

    fields.forEach((field) => {
        const messages = serverErrors[field];
        const message = Array.isArray(messages)
            ? String(messages[0] ?? '')
            : String(messages ?? '');

        const normalizedField = normalizeField ? normalizeField(field) : field;
        normalizedErrors[normalizedField] = message;
    });

    setClientErrors(normalizedErrors);
    setFormState?.({ loading: false, error: fallbackError });

    const firstField = fields[0];
    if (!firstField) return;

    const firstFocusableField = normalizeField ? normalizeField(firstField) : firstField;
    onFirstField?.(firstField);

    window.setTimeout(() => focusValidationField(firstFocusableField), 0);
};

export const validateField = (fieldName: string, value: any, fullData?: Record<string, any>) => {
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

    // Ambil skema parsial hanya untuk field yang sedang di-blur
    const fieldSchema = userFormSchema.shape[fieldName as keyof typeof userFormSchema.shape];
    
    if (!fieldSchema) {
        console.warn(`Field schema not found for: ${fieldName}`);
        return { success: false, data: value, error:{ issues:[] } };
    }

    return fieldSchema.safeParse(value);
};

export const validateForm = (data: Record<string, any>, setError?: (field: string, message: string) => void) => {
    const result = userFormSchema.safeParse(data);
    if (!result.success) {
        // Format ulang error dari Zod menjadi object { field: message }
        // const formattedErrors: Record<string, string> = {};
        const errorMessage = JSON.parse(result.error.message);
        let field = ''
        let message = ''

        errorMessage.forEach((err:any) => {
            if (err.path[0]) {
                field = err.path[0]
                message = err.message
                // formattedErrors[err.path[0] as string] = err.message;
            }
        });
        // Set semua error ke dalam state Inertia sekaligus
        if(setError !== undefined){
            setError(field, message);
        }
        return false; // Batalkan submit ke server jika ada yang salah
    }
    return true; // Validasi berhasil
}