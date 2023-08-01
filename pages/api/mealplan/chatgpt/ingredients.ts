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

const promptGPT3Ingredients =
  'Summarize all the ingredients as one list with an entry for each ingredient in danish. Your response should be in JSON format with three parameters "name", "quantity" and "unit" for each ingredient ex. [{"name": "Flour", "quantity":"1", "unit": "kg"}]. ';

export type IngredientsResult = {
  ingredients: {
    name: string;
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
    body.model ?? "gpt-3.5-turbo"
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
    },
    { timeout: 180000 }
  );

  const ingredientsJson = data.data.choices[0].message?.content;

  if (ingredientsJson != null) {
    let ingredients = parseJson(ingredientsJson);
    if (ingredients.keys != null && ingredients.keys().length === 1) {
      ingredients = ingredients[ingredients.keys()[0]];
    }
    return {
      ingredients,
      gptContent: data.data,
    };
  }

  throw Error("Failed to create completion");
}

export default withIronSessionApiRoute(handler, sessionOptions);
