type IngredientFormHeaderProps = {
  title?: string;
  description?: string;
  branchName?: string;
};

/** Optional heading and branch context for an ingredient form. */
export default function IngredientFormHeader({
  title = "Ingredient Form",
  description = "Manage ingredient details and stock reminders",
  branchName,
}: IngredientFormHeaderProps) {
  return (
    <div className="mb-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>

      {branchName && (
        <div className="mt-4">
          <b>Branch:</b>
          <span className="mx-2 inline-block rounded border border-green-300 bg-green-50 px-2 text-sm font-semibold text-green-500">
            {branchName}
          </span>
        </div>
      )}
    </div>
  );
}
