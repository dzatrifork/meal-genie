import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const prompt = "Make a {days} day food plan for {people} people. List the mealplan. Then list a summary of all the needed ingredients. Present the ingredients in CSV-format starting with $start$ and ending with $end$. Result should be in danish."

const gptResult = "Mealplan: Day 1: Morgenmad: Havregryn med mælk og frugt Frokost: Sandwich med kylling, salat og mayonnaise Aftensmad: Kylling med ris og grøntsager Day 2: Morgenmad: Æg og bacon med brød Frokost: Grøn salat med kylling og dressing Aftensmad: Fiskefilet med kartofler og salat Ingredients Summary: $start$Mælk, Havregryn, Frugt, Kylling, Salat, Mayonnaise, Ris, Grøntsager, Æg, Bacon, Brød, Dressing, Fiskefilet, Kartofler$end$"

export type GptResult = {
    plan: string,
    ingredients: Array<string> 
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
        temperature: 0.5,
        max_tokens: 1024
    });
    console.log(JSON.stringify(completion.data));

    return createObject(completion.data.choices[0].message?.content);
}

export async function GetMealPlanSimple() {
    return createObject(gptResult);
}

function createObject(gptResponse?: string) {
    if(gptResponse == null) {
        return null;
    }
    var split = gptResponse.split("$start$");
    var plan = split[0];
    var ingredients = split[1].split("$end$")[0].split(",");
    const result: GptResult = {
        plan: plan,
        ingredients: ingredients 
    } 
    console.log("ingredients:" + ingredients);
    return result;
}