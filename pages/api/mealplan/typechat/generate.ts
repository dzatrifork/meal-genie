import fs from "fs";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import {
    Result,
    TypeChatJsonTranslator,
    TypeChatLanguageModel,
    createJsonTranslator,
    createOpenAILanguageModel
} from "typechat";
import {
    MealPlanParams,
    getMealPlanPrompt,
} from "../../../../lib/generatePrompt";
import { Plan } from "../../../../lib/mealPlanSchema";
import { sessionOptions } from "../../../../lib/session";
import { log } from "console";

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

  const model: TypeChatLanguageModel = createOpenAILanguageModel(
    openaiApiKey,
    req.body.model ?? "gpt-4"
  );

  const libDirectory = path.join(process.cwd(), "lib");
  const viewSchema = fs.readFileSync(
    libDirectory + "/mealPlanSchema.ts",
    "utf8"
  );
  const translator: TypeChatJsonTranslator<Plan> = createJsonTranslator<Plan>(
    model,
    viewSchema,
    "Plan"
  );

  var customPrompt = getMealPlanPrompt(body);
  console.log(customPrompt);

  const result: Result<Plan> = await translator.translate(customPrompt);
  console.log(result);

  if (!result.success) {
    console.log(result.message);

    throw Error(result.message);
  }
  return result.data;
}

export default withIronSessionApiRoute(handler, sessionOptions);
