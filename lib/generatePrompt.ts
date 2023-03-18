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
};

const prompt =
  "Make a {days} day food plan for {people} people, with {meals}. {preferences} {ingredients} {types} ";

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

function getMeals(params: MealPlanParams): string {
  let res = [];
  if (params.breakfast) {
    res.push("breakfast");
  }
  if (params.lunch) {
    res.push("lunch");
  }
  if (params.dinner) {
    res.push("evening meals");
  }

  if (res.length === 1) {
    return "only " + res[0];
  } else {
    return `${res.slice(0, -1).join(", ")} and ${res.slice(-1)[0]}`;
  }
}

function getPreferences(params: MealPlanParams): string {
  if (params.preferences == null) {
    return "";
  }

  return `All meals should be ${params.preferences}.`;
}

function getIngredientPreferences(params: MealPlanParams): string {
  if (params.ingredients == null || params.ingredients.length === 0) {
    return "";
  }

  const i = params.ingredients.map(
    (v) =>
      `The mealplan must include ${v.value} for ${v.days} days out of ${params.days} days`
  );

  return i.join(". ") + ". ";
}

function getTypesPreferences(params: MealPlanParams): string {
  if (params.types == null || params.types.length === 0) {
    return "";
  }

  const i = params.types.map(
    (v) =>
      `The mealplan must include ${v.days} days with ${v.value} out of ${params.days} days`
  );

  return i.join(". ") + ". ";
}
