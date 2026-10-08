import { useEffect, useState } from "react";

import useAvailabilityCheck from "@/Hooks/useAvailabilityCheck";
import useFormValidator from "@/Hooks/useFormValidator";
import { checkIngredientCodeApi } from "@/services/ingredientService";
import { ingredientFormSchema } from "@/types/form";
import { FormIngredientState } from "@/types";

const emptyIngredient: FormIngredientState = {
  branch_id: undefined,
  code: "",
  name: "",
  unit: "",
  minimum_stock: 0,
  expiry_alert_days: 0,
  with_batch: true,
};

type UseIngredientEditorOptions = {
  initialData?: Partial<FormIngredientState>;
  /** Ingredient ID excluded when checking a code during edit. */
  ingredientId?: number | null;
  syncInitialData?: boolean;
};

/**
 * Shared ingredient form state, field validation, and asynchronous code check.
 * API submission intentionally stays in the page or modal using this hook.
 */
export default function useIngredientEditor({
  initialData,
  ingredientId = null,
  syncInitialData = true,
}: UseIngredientEditorOptions = {}) {
  // Compare the values, not the object reference: callers may pass an inline object.
  const initialDataKey = JSON.stringify(initialData ?? {});

  const createInitialData = (): FormIngredientState => ({
    ...emptyIngredient,
    ...initialData,
  });

  const [data, setData] = useState<FormIngredientState>(createInitialData);
  const { clientErrors, isError, handleValidate, validateField, setClientErrors, clearErrors } =
    useFormValidator<FormIngredientState>(ingredientFormSchema);

  useEffect(() => {
    if (!syncInitialData) return;

    setData(createInitialData());
    clearErrors();
  }, [initialDataKey, syncInitialData]);

  const handleChange = <K extends keyof FormIngredientState>(
    field: K,
    value: FormIngredientState[K],
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
    validateField(field, value);
  };

  const codeAvailability = useAvailabilityCheck({
    value: data.code,
    enabled: Boolean(data.branch_id),
    isValid: (code) => code.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(code),
    check: (code, signal) =>
      checkIngredientCodeApi(code, data.branch_id as string | number, ingredientId, signal),
    onStatusChange: (status) => {
      setClientErrors((previousErrors) => {
        const nextErrors = { ...previousErrors };

        if (status === "available") delete nextErrors.code;
        if (status === "unavailable") {
          nextErrors.code = "This ingredient code is already used in the selected branch.";
        }

        return nextErrors;
      });
    },
  });

  const reset = (nextData: Partial<FormIngredientState> = {}) => {
    setData({ ...emptyIngredient, ...nextData });
    clearErrors();
  };

  return {
    data,
    setData,
    handleChange,
    reset,
    clientErrors,
    isError,
    handleValidate,
    setClientErrors,
    codeAvailability,
  };
}
