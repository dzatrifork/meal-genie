export type MealPlanParams = {
  days: string;
  persons: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  preferences?: string;
  ingredients: {
    value?: string;
    days?: number;
  }[];
  types: {
    value?: string;
    days?: number;
  }[];
  model: 'gpt-3.5-turbo-16k' | 'gpt-4';
};

const prompt =
  "Make a {days} day food plan for {people} people. {meals}{preferences}{ingredients}{types} Give me the answer in danish.";

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
  if (body.ingredients.length === 0 && body.types.length === 0 && body.preferences == null) {
    return [getMealPlanPrompt(body)];
  }
  const ingredientPrompts = body.ingredients.map(ingredient => `${body.preferences ?? ''}, ${ingredient.value}`);
  const cuisinePrompts = body.types.map(type => `${body.preferences ?? ''}, ${type.value}`);
  const preferencesPrompt = body.preferences ? [body.preferences] : [];
  return ingredientPrompts.concat(cuisinePrompts).concat(preferencesPrompt);
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
    return `Only include ${res.slice(0, -1).join(", ")} and ${res.slice(-1)[0]}. `;
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
    (v) =>
      `The mealplan must include ${v.value} for ${v.days} ${(v.days ?? 0) > 1 ? 'days': 'day'}`
  );

  return i.join(". ") + ". ";
}

function getTypesPreferences(params: MealPlanParams): string {
  if (params.types == null || params.types.length === 0) {
    return "";
  }

  const i = params.types.map(
    (v) =>
      `The mealplan must include ${v.days} ${(v.days ?? 0) > 1 ? 'days': 'day'} with ${v.value}`
  );

  return i.join(". ") + ". ";
}
