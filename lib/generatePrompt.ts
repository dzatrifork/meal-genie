export type MealPlanParams = {
  days: string;
  persons: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  preferences?: string;
  ingredients: string[];
  types: string[];
  model: "gpt-3.5-turbo-16k" | "gpt-4";
  contextNamespace?: "kitchen-stories-3" | "mob-kitchen";
};

const prompt =
  "Make a {days} day food plan for {people} people. {meals}{preferences}{ingredients}{types}.";

export function getMealPlanPrompt(body: MealPlanParams) {
  var customPrompt = prompt
    .replace("{days}", body.days)
    .replace("{people}", body.persons)
    .replace("{meals}", getMeals(body))
    .replace("{preferences}", getPreferences(body))
    .replace("{ingredients}", getIngredientPreferences(body))
    .replace("{types}", getTypesPreferences(body));
  return customPrompt;
}

export function getContextPrompts(body: MealPlanParams) {
  if (
    body.ingredients.length === 0 &&
    body.types.length === 0 &&
    body.preferences == null
  ) {
    return [getMealPlanPrompt(body)];
  }

  const breakfastPrompts = body.breakfast ? [`${body.preferences ?? ""} breakfast`] : [];
  const lunchPrompts = body.lunch ? [`${body.preferences ?? ""} lunch brunch`] : [];
  const ingredientPrompts = body.ingredients.map(
    (ingredient) => `dinner ${body.preferences ?? ""} ${ingredient}`
  );
  const cuisinePrompts = body.types.map(
    (type) => `dinner ${body.preferences ?? ""} ${type}`
  );
  const preferencesPrompt = body.preferences ? [body.preferences] : [];
  return breakfastPrompts
    .concat(lunchPrompts)
    .concat(ingredientPrompts)
    .concat(cuisinePrompts)
    .concat(preferencesPrompt);
}

function getMeals(params: MealPlanParams): string {
  let res = [];
  if (params.breakfast) {
    res.push("breakfast");
  }
  if (params.lunch) {
    res.push("lunch");
  }
  if (params.dinner) {
    res.push("dinner");
  }

  if (res.length === 1) {
    return `Only include ${res[0]}. `;
  } else {
    return `Only include ${res.slice(0, -1).join(", ")} and ${
      res.slice(-1)[0]
    }. `;
  }
}

function getPreferences(params: MealPlanParams): string {
  if (params.preferences == null) {
    return "";
  }

  return `All meals should be ${params.preferences}. `;
}

function getIngredientPreferences(params: MealPlanParams): string {
  if (params.ingredients == null || params.ingredients.length === 0) {
    return "";
  }

  const i = params.ingredients.map(
    (v) => `The mealplan must include ${v} for 1 day`
  );

  return i.join(". ") + ". ";
}

function getTypesPreferences(params: MealPlanParams): string {
  if (params.types == null || params.types.length === 0) {
    return "";
  }

  const i = params.types.map(
    (v) => `The mealplan must include have ${v} cuisine for one day`
  );

  return i.join(". ") + ". ";
}
