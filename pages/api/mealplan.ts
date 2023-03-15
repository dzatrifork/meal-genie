import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const prompt = "Make a {days} day food plan for {people} people, with breakfast, lunch and dinner. List the mealplan. Then list a summary of all the needed ingredients. Present the ingredients in json-format as a list with form {name, quantity, unit}. End the result with \"endResult\" Result should be in danish."

export type GptResult = {
    plan: string,
    ingredients: Array<{
        navn: string,
        mængde: string,
        enhed: string
    }> 
}

type GptRequest = NextApiRequest & {
    body: {
        days: string,
        persons: string
    }
}

export default async function handler(req: GptRequest, res: NextApiResponse) {
    const result = await GetMealPlan(req.body.days, req.body.persons);
    if(result == null) {
        return new Response();
    }
    return res.status(201).json(result);
}

async function GetMealPlan(days: string, people: string) {
    var customPrompt = prompt.replace("{days}", days).replace("{people}", people);
    const configuration = new Configuration({
        apiKey: "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",
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "You are a helpful assistant."},
            {role: "user", content: customPrompt}],
        temperature: 0.2,
        max_tokens: 1024
    });
    console.log(JSON.stringify(completion.data));

    return createObject(completion.data.choices[0].message?.content);
}

function createObject(gptResponse?: string) {
    if(gptResponse == null) {
        return null;
    }
    var split = gptResponse.split("Ingredienser:");
    var plan = split[0];
    console.log(split[1].split("endResult")[0].trim());
    let ingredients = JSON.parse(split[1].split("endResult")[0].trim());
    const result: GptResult = {
        plan: plan,
        ingredients: ingredients 
    } 
    console.log("ingredients:" + ingredients);
    return result;
}