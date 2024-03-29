export type Meal = {
    link?: string;
    title: string;
    description: string;
    ingredients: Ingredient[];
    directions: string[];
};

export type Ingredient = {
    name: string;
    quantity?: string;
    unit?: string;
    danishName?: string;
}

export type Day = {
    day: string;
    meals: Meal[];
};

export type Plan = {
    planStr?: string;
    plan?: Day[];
    allIngredients?: Ingredient[];
};
