import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { sessionOptions } from "../../../../lib/session";

export type PlanResult = {
  plan: {
    day: string;
    description: string;
    ingredients: string;
    directions: string;
  }[];
};

type Body = {
  messages: ChatCompletionRequestMessage[];
  days: number;
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
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(body, openai);
}

async function createGPT35Completion(body: Body, openai: OpenAIApi) {
  const messages = body.messages;

  const promises = [];

  for (let i = 1; i <= body.days; i++) {
    const planMessages = messages.concat([
      {
        role: "user",
        content: `Give me steps by step directions for the all meals of day ${i} in danish.`,
      },
    ]);
    const dayData = openai
      .createChatCompletion(
        {
          model: "gpt-3.5-turbo",
          messages: planMessages,
          temperature: 0.2,
          max_tokens: 2048, // The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        },
        { timeout: 180000 }
      )
      .catch((error) => {
        console.log(error);
        return error;
      });
    promises.push(dayData);
  }

  const plan = await Promise.all(promises).then((values) => {
    return values.map((value, index) => {
      console.log(index, value.data.choices[0].message?.content);
      return {
        day: `Dag ${index + 1}`,
        directions: value.data.choices[0].message?.content,
      };
    });
  });

  return {
    plan,
  };
}

export default withIronSessionApiRoute(handler, sessionOptions);
