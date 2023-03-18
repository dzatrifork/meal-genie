import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";
import { sessionOptions } from "../../../../lib/session";

const promptGPT3Ingredients =
  'Summarize the Ingredients as a list with an entry for each ingredient. Your response should be in JSON format with three parameters "name", "quantity" and "unit" for each ingredient ex. [{"name": "Flour", "quantity":"1", "unit": "kg"}]. Values should be in danish. ';

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
};

async function handler(req: IngredientsRequest, res: NextApiResponse) {
  if (
    req.session.user == null ||
    req.session.user.openaiApiKey == null ||
    !req.session.user.isLoggedIn
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await getIngredients(req.body, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function getIngredients(body: Body, openaiApiKey: string) {
  console.log(promptGPT3Ingredients);

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(
    body.messages,
    openai
  );
}

async function createGPT35Completion(
  messages: ChatCompletionRequestMessage[],
  openai: OpenAIApi
): Promise<IngredientsResult> {
  let ingredientMessages = messages.concat([
    { role: "user", content: promptGPT3Ingredients },
  ]);

  const data = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: ingredientMessages,
    temperature: 0.2,
    max_tokens: 2024,
  });

  const ingredientsJson = data.data.choices[0].message?.content;

  if (ingredientsJson != null) {
    console.log(ingredientsJson.split("```")[1]);
    let ingredients = JSON.parse(ingredientsJson.split("```")[1]);
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
