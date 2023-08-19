import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { parseJson } from "../../../../lib/parseGptJson";
import { sessionOptions } from "../../../../lib/session";
import { MealPlan } from "./init";
import { getContext } from "../../../../utils/context";

export type MealResult = {
  link?: string;
  title: string;
  description: string;
  ingredients: {
    displayName: string;
    item: string;
    quantity?: number;
    unit: string;
  }[];
  directions: string[];
};

export type DayResult = {
  day: string;
  meals: MealResult[];
};

export type PlanResult = {
  plan: DayResult[];
};

type Body = {
  messages: ChatCompletionRequestMessage[];
  mealPlan: MealPlan;
  days: number;
  model: string;
};

type PlanRequest = NextApiRequest & {
  body: Body;
};

async function handler(req: PlanRequest, res: NextApiResponse) {
  if (
    req.session.user == null ||
    req.session.user.openaiApiKey == null ||
    !req.session.user.isLoggedIn
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await getPlan(req, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function getPlan(req: PlanRequest, openaiApiKey: string) {
  const body = req.body;
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(body, openai, body.model);
}

async function createGPT35Completion(
  body: Body,
  openai: OpenAIApi,
  model: string
) {
  const promises = [];

  for (let i = 1; i <= body.days; i++) {
    const recipes = await Promise.all(
      body.mealPlan
        .find((mp) => mp.day === i)
        ?.meals.map((m) =>
          getContext(m.title, 1, undefined, 0.8).then(
            (recipe) => recipe[0].text
          )
        ) ?? []
    );

    const planMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are a kitchen chef that can describe meals and recipes. You describe the following meal plan: ${JSON.stringify(
          body.mealPlan
        )}
        ${
          recipes.length > 0 ??
          "You describe the following recipes: " + JSON.stringify(recipes)
        }
      `,
      },
      {
        role: "user",
        content: `Give me the meal(s) of day ${i}. Your response should be in JSON format {meals: {"link": string, "title": string, "description": string, "ingredients": {name: string, quantity: number, unit: string}[], "directions": string[]}[]}`,
      },
    ];

    const dayData = openai
      .createChatCompletion({
        model: model,
        messages: planMessages,
        temperature: 0.2,
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
    promises.push(dayData);
  }

  const plan = await Promise.all(promises).then((values) => {
    return values.map((value, index) => {
      const json = parseJson(value.data.choices[0].message?.content);
      return {
        gptContent: value.data,
        day: `Dag ${index + 1}`,
        ...json,
      };
    });
  });

  return {
    plan,
  };
}

export default withIronSessionApiRoute(handler, sessionOptions);
