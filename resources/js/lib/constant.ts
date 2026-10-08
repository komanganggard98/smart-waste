// All stock, consumption, template, and waste quantities use one of these base units.
const BASE_UNITS = [
    'ml',
    'g',
    'pcs',
] as const;

// These describe supplier packaging only; they are converted to a base unit per batch.
const PURCHASE_UNITS = [
    'galon',
    'liter',
    'kg',
    'ml',
    'g',
    'pcs',
    'box',
    'pack',
    'bag',
    'bottle',
    'can',
    'carton',
    'case',
    'tray',
    'dozen',
    'roll',
    'set',
    'bundle',
] as const;

const PURPOSE_OPTIONS = [
    'Daily Operations (Prep & Cooking)',
    'Catering / Special Event',
    'Recipe Testing / R&D',
    'Staff Training',
    'Internal Consumption (Staff Meal)',
    'Other'
];

export {
    BASE_UNITS,
    PURCHASE_UNITS,
    PURPOSE_OPTIONS
}
