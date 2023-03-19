import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import {
  getMealPlanPrompt,
  MealPlanParams,
} from "../../../../lib/generatePrompt";
import { sessionOptions } from "../../../../lib/session";

const promptDavinci =
  'Summarize the mealplan as a list with an entry for each day as well as all the ingredients in json-format as a list. Your response should be in JSON format ex. {"plan": [{"day": "Day 1", "description": "...", "ingredients": "...", "directions": "..."}], "ingredients": [{"name": "Flour", "quantity":"1", "unit": "kg"}]}. Values should be in danish. ';

export type DavinciResult = {
  planStr: string;
  plan: {
    day: string;
    description: string;
    ingredients: string;
    directions: string;
  }[];
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
  gptContent: (CreateChatCompletionResponse | CreateCompletionResponse)[];
};

type GptRequest = NextApiRequest & {
  body: MealPlanParams;
};

async function handler(req: GptRequest, res: NextApiResponse) {
  if (
    req.session.user == null ||
    req.session.user.openaiApiKey == null ||
    !req.session.user.isLoggedIn
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await GetMealPlan(req.body, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function GetMealPlan(body: MealPlanParams, openaiApiKey: string) {
  var customPrompt = getMealPlanPrompt(body);

  console.log(customPrompt);

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);
  return await createDavinciCompletion(customPrompt, openai);
}

async function createDavinciCompletion(
  customPrompt: string,
  openai: OpenAIApi
) {
  console.log(promptDavinci);
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: customPrompt + promptDavinci,
    temperature: 0.5,
    max_tokens: 2048,
  });
  if (completion.data?.choices[0]?.text != null) {
    console.log(completion.data.choices[0].text.trim());
    const json = JSON.parse(completion.data.choices[0].text.trim());
    if (Array.isArray(json.plan.ingredients)) {
      json.plan.ingredients = json.plan.ingredients.join(", ");
    }
    if (Array.isArray(json.plan.directions)) {
      json.plan.directions = json.plan.directions.join(", ");
    }
    return {
      planStr: "",
      ...json,
      completions: [completion.data],
    };
  }

  throw Error("Failed to create completion.");
}

export default withIronSessionApiRoute(handler, sessionOptions);
