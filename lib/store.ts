import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InitResult } from "../pages/api/mealplan/chatgpt/init";
import { NemligResult } from "../pages/api/nemlig";
import { Plan } from "./mealPlanSchema";

export type Preference = "vegan" | "vegetarian";
export type LanguageModel =  'gpt-3.5-turbo-16k' | 'gpt-4'

export type ValueWithDay = {
  value?: string;
  days?: number;
};

export interface User {
  username?: string;
  password?: string;
}

export interface State {
  plan: Plan | null;
  setMealPlan: (plan: Plan | null) => void;
  nemligOrder: NemligResult | null;
  setNemligOrder: (res: NemligResult | null) => void;
  nemligUser?: User;
  setNemligUsername: (username: string) => void;
  setNemligPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  nemligLoading: boolean;
  setNemligLoading: (loading: boolean) => void;
  days: number;
  setDays: (days: number) => void;
  persons: number;
  setPersons: (persons: number) => void;
  breakfast: boolean;
  toggleBreakfast: () => void;
  lunch: boolean;
  toggleLunch: () => void;
  dinner: boolean;
  toggleDinner: () => void;
  preferences?: Preference;
  setPreferences: (preference?: Preference) => void;
  ingredients: ValueWithDay[];
  addIngredient: () => void;
  deleteIngredient: (index: number) => void;
  changeIngredientValue: (value: string, index: number) => void;
  changeIngredientDays: (days: number, index: number) => void;
  types: ValueWithDay[];
  addMealType: () => void;
  deleteMealType: (index: number) => void;
  changeMealTypeValue: (value: string, index: number) => void;
  changeMealTypeDays: (days: number, index: number) => void;
  model: LanguageModel;
  setModel: (model: LanguageModel) => void;
  submitChatGpt: () => void;
  submitTypechat: () => void;
  submitNemlig: () => void;
}

const fetcher = (url: string, body: string) =>
  fetch(url, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((res) => res.json());

export const useMealPlanStore = create<State>()((set, get) => ({
  plan: null,
  setMealPlan: (plan: Plan | null) => {
    set((state: State) => ({ ...state, plan }));
  },
  nemligOrder: null,
  setNemligOrder: (nemligOrder: NemligResult | null) => {
    set((state: State) => ({ ...state, nemligOrder }));
  },
  setNemligUsername: (username: string) => {
    const nemligUser = { ...get().nemligUser, username };
    set((state) => ({ ...state, nemligUser }));
  },
  setNemligPassword: (password: string) => {
    const nemligUser = { ...get().nemligUser, password };
    set((state) => ({ ...state, nemligUser }));
  },
  loading: false,
  setLoading: (loading: boolean) => {
    set((state) => ({ ...state, loading }));
  },
  nemligLoading: false,
  setNemligLoading: (loading: boolean) => {
    set((state) => ({ ...state, loading }));
  },
  days: 5,
  setDays: (days: number) => {
    set((state) => ({ ...state, days }));
  },
  persons: 2,
  setPersons: (persons: number) => {
    set((state) => ({ ...state, persons }));
  },
  breakfast: false,
  toggleBreakfast: () => {
    set((state: State) => ({ ...state, breakfast: !state.breakfast }));
  },
  lunch: false,
  toggleLunch: () => {
    set((state: State) => ({ ...state, lunch: !state.lunch }));
  },
  dinner: true,
  toggleDinner: () => {
    set((state: State) => ({ ...state, dinner: !state.dinner }));
  },
  preferences: undefined,
  setPreferences: (preferences?: Preference) => {
    set((state) => ({ ...state, preferences }));
  },
  ingredients: [],
  addIngredient: () => {
    const ingredients = get().ingredients;
    ingredients.push({});
    set((state: State) => ({ ...state, ingredients }));
  },
  deleteIngredient: (index: number) => {
    const ingredients = get().ingredients;
    ingredients.splice(index, 1);
    set((state) => ({ ...state, ingredients }));
  },
  changeIngredientValue: (value: string, index: number) => {
    const ingredients = get().ingredients;
    ingredients[index].value = value;
    set((state: State) => ({ ...state, ingredients }));
  },
  changeIngredientDays: (days: number, index: number) => {
    const ingredients = get().ingredients;
    ingredients[index].days = days;
    set((state: State) => ({ ...state, ingredients }));
  },
  types: [],
  addMealType: () => {
    const types = get().types;
    types.push({});
    set((state: State) => ({ ...state, types }));
  },
  deleteMealType: (index: number) => {
    const types = get().types;
    types.splice(index, 1);
    set((state) => ({ ...state, types }));
  },
  changeMealTypeValue: (value: string, index: number) => {
    const types = get().types;
    types[index].value = value;
    set((state: State) => ({ ...state, types }));
  },
  changeMealTypeDays: (days: number, index: number) => {
    const types = get().types;
    types[index].days = days;
    set((state: State) => ({ ...state, types }));
  },
  model: "gpt-3.5-turbo-16k",
  setModel: (model: LanguageModel) => {
    set((state: State) => ({ ...state, model }));
  },
  submitChatGpt: async () => {
    get().setLoading(true);
    get().setMealPlan(null);
    if (get().days == null || get().persons == null) {
      get().setLoading(false);
      return;
    }

    const body = {
      days: get().days,
      persons: get().persons,
      breakfast: get().breakfast,
      lunch: get().lunch,
      dinner: get().dinner,
      preferences: get().preferences,
      ingredients: get().ingredients,
      types: get().types,
      model: get().model,
    };
    const init: InitResult = await fetcher(
      "/api/mealplan/chatgpt/init",
      JSON.stringify(body)
    ).catch((e: Error) => e);

    let result: Plan | null = {
      planStr: init.planStr,
    };
    get().setMealPlan(result);

    const ingredients = fetcher(
      "/api/mealplan/chatgpt/ingredients",
      JSON.stringify({
        messages: init.messages,
        model: get().model,
      })
    )
      .then((res) => {
        result = {
          ...result,
          allIngredients: res.ingredients,
        };
        get().setMealPlan(result);
      })
      .catch((e: Error) => {
        console.log(e);
        return null;
      });

    const plan = fetcher(
      "/api/mealplan/chatgpt/plan",
      JSON.stringify({
        messages: init.messages,
        days: get().days,
        model: get().model,
      })
    )
      .then((res) => {
        result = {
          ...result,
          plan: res.plan,
          planStr: res.planStr,
        };
        get().setMealPlan(result);
      })
      .catch((e: Error) => {
        console.log(e);
        return null;
      });

    await Promise.all([ingredients, plan]);
    console.log(result);

    if (result != null) {
      get().setMealPlan(result);
    }
    get().setLoading(false);
  },
  submitTypechat: async () => {
    get().setLoading(true);
    get().setMealPlan(null);
    if (get().days == null || get().persons == null) {
      get().setLoading(false);
      return;
    }

    const body = {
      days: get().days,
      persons: get().persons,
      breakfast: get().breakfast,
      lunch: get().lunch,
      dinner: get().dinner,
      preferences: get().preferences,
      ingredients: get().ingredients,
      types: get().types,
      model: get().model,
    };
    const plan: Plan = await fetcher(
      "/api/mealplan/typechat/generate",
      JSON.stringify(body)
    ).catch((e: Error) => e);

    if (plan != null) {
      get().setMealPlan(plan);
    }
    get().setLoading(false);
  },
  submitNemlig: async () => {
    get().setNemligLoading(true);
    const names = get().plan?.allIngredients?.map((i) => i.name);
    const nemligResult = await fetcher(
      "api/nemlig",
      JSON.stringify({
        username: get().nemligUser?.username,
        password: get().nemligUser?.password,
        productNames: names,
      })
    );
    get().setNemligOrder(nemligResult);
    get().setNemligLoading(false);
  },
}));
