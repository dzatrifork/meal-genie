import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai-edge";
import {
  MealPlanParams,
  getContextPrompts,
  getMealPlanPrompt,
} from "../../../../lib/generatePrompt";
import { sessionOptions } from "../../../../lib/session";
import { getContext } from "../../../../utils/context";

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

  const result = await GetMealPlan(req, req.session.user.openaiApiKey);
  if (result == null) {
    return new Response();
  }
  return res.status(201).json(result);
}

async function GetMealPlan(req: InitRequest, openaiApiKey: string) {
  const body = req.body;
  console.log(body);

  var customPrompt = getMealPlanPrompt(body);
  console.log(customPrompt);
  let systemPrompt = `You are a kitchen chef. You describe recipes in great detail. You specify each ingredient individually.`

  if (body.usePinecone) {
    const contextPrompts = getContextPrompts(body);
    const contexts = await Promise.all(
      contextPrompts.map((p) => getContext(p, 10))
    );
    const contextStr = contexts
      .map((cs) =>
        getRandomElements(
          cs,
          numberOfRandomElements(contextPrompts.length, body.days)
        )
          .map((c) => c.text.split("## Tags")[0])
          .filter((value, index, self) => self.indexOf(value) === index)
          .join("")
      )
      .join("")
      .substring(0, body.model === 'gpt-4' ? 6000 : 10000); 
  
    systemPrompt += `START CONTEXT BLOCK
    ${contextStr}
    END OF CONTEXT BLOCK
    Take into account any CONTEXT BLOCK that is provided. `;
  }
  console.log("SYSTEM PROMPT: ", systemPrompt);

  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  return await createGPT35Completion(
    customPrompt,
    systemPrompt,
    openai,
    body.model
  );
}

async function createGPT35Completion(
  customPrompt: string,
  systemPrompt: string,
  openai: OpenAIApi,
  model: string
): Promise<InitResult> {
  let messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: customPrompt },
  ];
  const completions = [];
  const result = await openai.createChatCompletion({
    model: model,
    messages: messages,
    temperature: 1,
  });

  const mealPlan = await result.json();
  console.log(mealPlan);

  completions.push(mealPlan);

  if (mealPlan.choices[0].message?.content != null) {
    const planStr = mealPlan.choices[0].message?.content;
    console.log(mealPlan.choices[0].message?.content);
    messages.push({
      role: "assistant",
      content: mealPlan.choices[0].message?.content,
    });

    return {
      planStr,
      gptContent: completions,
      messages,
    };
  }

  throw Error("Failed to create completion");
}

function numberOfRandomElements(nrOfCustomPrompts: number, days: number): number {
  if (nrOfCustomPrompts === 1) {
    return days;
  } 

  if ( (nrOfCustomPrompts * 2) >= days && (days * 2) >= (nrOfCustomPrompts * 2)) {
    return 2;
  }

  return 1;
}

function getRandomElements<T>(array: T[], numberOfElements: number): T[] {
  if (numberOfElements > array.length) {
    throw new Error(
      "Number of elements requested is greater than the array length."
    );
  }

  const shuffledArray = array.slice(); // Create a copy of the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, numberOfElements);
}

export default withIronSessionApiRoute(handler, sessionOptions);
