import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { parseJson } from "../../../../lib/parseGptJson";
import { sessionOptions } from "../../../../lib/session";

export type MealResult = {
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
  const messages = body.messages;

  const promises = [];

  for (let i = 1; i <= body.days; i++) {
    const planMessages = messages.concat([
      {
        role: "user",
        content: `Give me steps by step directions for the meal(s) of day ${i}. Your response should be in JSON format {meals: {"description": string, "ingredients": {ingredient: string, quantity: number, unit: string}[], "directions": string[]}[]}. Values should be in danish.`,
      },
    ]);
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
