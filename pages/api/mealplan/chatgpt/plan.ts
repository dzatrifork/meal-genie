import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";
import { parseJson } from "../../../../lib/parseGptJson";
import { sessionOptions } from "../../../../lib/session";

const promptGBT3PlanOld =
  'Summarize the mealplan as a list with an entry for each day. Your response should be in JSON format with two parameters "day" and "description" for each day ex. [{"day": "Day 1", "description": "..."}]. Values should be in danish. ';
const promptGBT3Plan =
  'Summarize the mealplan as a list with an entry for each day. Your response should be in JSON format with four parameters "day", "description", "ingredients" and "directions" with string values. Ex. [{"day": "Day 1", "description": "...", "ingredients": "...", "directions": "..."}]. All values should be in danish. ';

export type PlanResult = {
  plan: {
    day: string;
    description: string;
    ingredients: string;
    directions: string;
  }[];
  gptContent: CreateChatCompletionResponse;
};

type Body = {
  messages: ChatCompletionRequestMessage[];
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

  const result = await getPlan(req.body, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function getPlan(body: Body, openaiApiKey: string) {
  console.log(promptGBT3Plan);

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(body.messages, openai);
}

async function createGPT35Completion(
  messages: ChatCompletionRequestMessage[],
  openai: OpenAIApi
) {
  let planMessages = messages.concat([
    { role: "user", content: promptGBT3Plan },
  ]);

  const data = await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: planMessages,
      temperature: 0.2,
      max_tokens: 2048, // The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
    })
    .catch((error) => {
      console.log(error);
      return error;
    });

  const planJson = data.data.choices[0].message?.content;

  if (planJson != null) {
    let plan = parseJson(planJson);

    if (plan.keys != null && plan.keys().length === 1) {
      plan = plan[plan.keys()[0]];
    }

    return {
      plan,
      gptContent: data.data,
    };
  }

  throw Error("Failed to create completion");
}

export default withIronSessionApiRoute(handler, sessionOptions);
