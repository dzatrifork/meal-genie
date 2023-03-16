import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const prompt = "Make a {days} day food plan for {people} people, with {meals}. {preferences} List the mealplan. Then list a summary of all the needed ingredients. Present the ingredients in json-format as a list with form {name, quantity, unit}. Put \"$startIngredients\" before the list og ingredients and end the result with \"$endResult\". Result should be in danish."

export type GptResult = {
    plan: string,
    ingredients: Array<{
        navn: string,
        mængde: string,
        enhed: string
    }>
}

type Params = {
    days: string,
    persons: string,
    breakfast: boolean,
    lunch: boolean,
    dinner: boolean,
    preferences?: string,
}

type GptRequest = NextApiRequest & {
    body: Params
}

export default async function handler(req: GptRequest, res: NextApiResponse) {
    const result = await GetMealPlan(req.body);
    if (result == null) {
        return new Response();
    }
    return res.status(201).json(result);
}

async function GetMealPlan(body: Params) {
    var customPrompt = prompt
        .replace("{days}", body.days)
        .replace("{people}", body.persons)
        .replace("{meals}", getMeals(body))
        .replace("{preferences}", getPreferences(body));

    console.log(customPrompt);

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: customPrompt }],
        temperature: 0.2,
        max_tokens: 1024
    });
    console.log(JSON.stringify(completion.data));

    return createObject(completion.data.choices[0].message?.content);
}

function createObject(gptResponse?: string) {
    if (gptResponse == null) {
        return null;
    }
    var split = gptResponse.split("$startIngredients");
    var plan = split[0];
    const ingredientsStr = split[1].split("$endResult")[0].trim()
        .replace('name', 'navn')
        .replace('quantity', 'mængde')
        .replace('unit', 'endhed');
    const ingredients = JSON.parse(ingredientsStr);
    const result: GptResult = {
        plan: plan,
        ingredients: ingredients
    }
    console.log("ingredients:" + JSON.stringify(ingredients));
    return result;
}

function getMeals(params: Params): string {
    let res = [];
    if (params.breakfast) {
        res.push('breakfast');
    }
    if (params.lunch) {
        res.push('lunch');
    }
    if (params.dinner) {
        res.push('evening meal');
    }

    if (res.length === 1) {
        return 'only ' + res[0];
    } else {
        return `${res.slice(0, -1).join(", ")} and ${res.slice(-1)[0]}`;
    }
}

function getPreferences(params: Params): string {
    if (params.preferences == null) {
        return '';
    }

    return `All meals should be ${params.preferences}.`
}