import { CircleQuestionMarkIcon } from "lucide-react";
import { Tooltip } from "flowbite-react";

import { BASE_UNITS } from "@/lib/constant";
import { FormIngredientState } from "@/types";
import { AvailabilityStatus } from "@/Hooks/useAvailabilityCheck";
import { useAutoNumberInput } from "@/Hooks/useAutoNumberInput";
import { Errors } from "@/Hooks/useFormValidator";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import Loading from "../Loading";
import SelectInput from "../SelectInput";
import TextInput from "../TextInput";
import CodeAvailability from "../CodeAvailability";

type IngredientFieldsProps = {
  data: FormIngredientState;
  onChange: <K extends keyof FormIngredientState>(
    field: K,
    value: FormIngredientState[K],
  ) => void;
  errors?: Errors;
  codeAvailability?: AvailabilityStatus;
};

/** Reusable controlled fields for creating or editing an ingredient. */
export default function IngredientFields({
  data,
  onChange,
  errors = {},
  codeAvailability,
}: IngredientFieldsProps) {
  const { handleInputChange } = useAutoNumberInput();

  const handleNumberChange = (
    field: "minimum_stock" | "expiry_alert_days",
    value: string,
  ) => {
    handleInputChange(value, String(data[field] ?? ""), (nextValue: string) => {
      onChange(field, Number(nextValue));
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <InputLabel htmlFor="name" value="Ingredient Name" />
        <TextInput
          id="name"
          type="text"
          name="name"
          value={data.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="E.g., Full Cream UHT Milk"
          required
          className="w-full"
        />
        <InputError message={errors.name} />
      </div>

      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <InputLabel htmlFor="code" value="Ingredient Code" />
          <TextInput
            id="code"
            type="text"
            name="code"
            value={data.code}
            onChange={(event) => onChange("code", event.target.value)}
            placeholder="E.g., ING-MILK-001"
            required
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Unique code to track this item in inventory.
          </p>
          {codeAvailability === "checking" && <Loading message="Checking code..." />}
          {codeAvailability === "available" && (
            <CodeAvailability status={codeAvailability}/>
          )}
          <InputError message={errors.code} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <InputLabel htmlFor="unit" value="Stock unit" />
            <Tooltip content="All stock, recipe usage, and waste are stored in this base unit.">
              <CircleQuestionMarkIcon size={10} />
            </Tooltip>
          </div>
          <SelectInput
            id="unit"
            value={data.unit}
            onChange={(event) => onChange("unit", event.target.value)}
            required
          >
            <option value="">Select unit</option>
            {BASE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </SelectInput>
          <InputError message={errors.unit} />
          <p className="mt-1 text-xs text-gray-500">Use ml for liquids, g for weight, or pcs for countable items.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <InputLabel htmlFor="minimum_stock" value="Minimum Stock Threshold" />
          <TextInput
            id="minimum_stock"
            type="number"
            step="1" 
            name="minimum_stock"
            value={String(data.minimum_stock ? +data.minimum_stock : "0")}
            onChange={(event) => handleNumberChange("minimum_stock", event.target.value)}
            min={0}
            required
            inputMode="numeric"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Triggers a low-stock alert when inventory falls below this amount.
          </p>
          <InputError message={errors.minimum_stock} />
        </div>

        <div className="flex-1">
          <InputLabel htmlFor="expiry_alert_days" value="Expiry Alert (Days)" />
          <TextInput
            id="expiry_alert_days"
            type="number"
            step="1"
            name="expiry_alert_days"
            value={String(data.expiry_alert_days ? +data.expiry_alert_days : "0")}
            onChange={(event) => handleNumberChange("expiry_alert_days", event.target.value)}
            min={0}
            required
            inputMode="numeric"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Number of days before expiration to trigger a warning notification.
          </p>
          <InputError message={errors.expiry_alert_days} />
        </div>
      </div>
    </div>
  );
}
