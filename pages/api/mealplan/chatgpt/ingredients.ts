import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai-edge";
import { parseJson } from "../../../../lib/parseGptJson";
import { sessionOptions } from "../../../../lib/session";

const promptGPT3Ingredients =
  'Summarize all the ingredients for the whole mealplan. Only include each type of ingredient once. Your response should be in JSON format: {ingredients: {name: string, quantity: number, unit: string}[]}. Values should be in danish.';

export type IngredientsResult = {
  ingredients: {
    ingredient: string;
    quantity: string;
    unit: string;
  }[];
  gptContent: CreateChatCompletionResponse;
};

export type IngredientsRequest = NextApiRequest & {
  body: Body;
};

type Body = {
  messages: ChatCompletionRequestMessage[];
  model: string;
};

async function handler(req: IngredientsRequest, res: NextApiResponse) {
  if (
    req.session.user == null ||
    req.session.user.openaiApiKey == null ||
    !req.session.user.isLoggedIn
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await getIngredients(req, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function getIngredients(req: IngredientsRequest, openaiApiKey: string) {
  const body = req.body;
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(
    body.messages,
    openai,
    body.model
  );
}

async function createGPT35Completion(
  messages: ChatCompletionRequestMessage[],
  openai: OpenAIApi,
  model: string
): Promise<IngredientsResult> {
  let ingredientMessages = messages.concat([
    { role: "user", content: promptGPT3Ingredients },
  ]);
  const data = await openai.createChatCompletion(
    {
      model: model,
      messages: ingredientMessages,
      temperature: 0.2,
    }
  );

  const json = await data.json();

  const ingredientsJson = json.choices[0].message?.content;

  if (ingredientsJson != null) {
    const result = parseJson(ingredientsJson);
    return {
      ingredients: result.ingredients,
      gptContent: json,
    };
  }

  throw Error("Failed to create completion");
}

export default withIronSessionApiRoute(handler, sessionOptions);
