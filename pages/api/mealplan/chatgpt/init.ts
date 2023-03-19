import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";
import {
  getMealPlanPrompt,
  MealPlanParams,
} from "../../../../lib/generatePrompt";
import { sessionOptions } from "../../../../lib/session";

export type InitResult = {
  planStr: string;
  gptContent: CreateChatCompletionResponse[];
  messages: ChatCompletionRequestMessage[];
};

export type InitRequest = NextApiRequest & {
  body: MealPlanParams;
};

async function handler(req: InitRequest, res: NextApiResponse) {
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
  const systemPrompt =
    "You are a helpful kitchen chef. You describe recipes in great detail. You specify each ingredient individually." +
    (body.preferences != null
      ? ` You only propose ${body.preferences} dishes.`
      : "");
  console.log(systemPrompt);

  var customPrompt = getMealPlanPrompt({ ...body, preferences: undefined });
  console.log(customPrompt);

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(customPrompt, systemPrompt, openai);
}

async function createGPT35Completion(
  customPrompt: string,
  systemPrompt: string,
  openai: OpenAIApi
): Promise<InitResult> {
  let messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: customPrompt },
  ];
  const completions = [];
  const mealPlan = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.5,
    max_tokens: 2048, // The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
  });

  completions.push(mealPlan.data);

  if (mealPlan.data.choices[0].message?.content != null) {
    const planStr = mealPlan.data.choices[0].message?.content;
    console.log(mealPlan.data.choices[0].message?.content);
    messages.push({
      role: "assistant",
      content: mealPlan.data.choices[0].message?.content,
    });

    return {
      planStr,
      gptContent: completions,
      messages,
    };
  }

  throw Error("Failed to create completion");
}

export default withIronSessionApiRoute(handler, sessionOptions);
