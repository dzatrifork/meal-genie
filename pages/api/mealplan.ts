import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const prompt = "Make a {days} day food plan for {people} people, with {meals}. {preferences} {ingredients} List the mealplan. Then list a summary of all the needed ingredients. Present the mealplan in json-format as a list with form {day, description} with \"$startMealPlan\" at the start and \"$endMealPlan\" at the end. Present the ingredients in json-format as a list with form {name, quantity, unit}. Put \"$startIngredients\" before the list of ingredients and  \"$endIngredients\" at the end. Result should be in danish."

export type GptResult = {
    plan: {
        dag: string,
        beskrivelse: string
    }[],
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
    model: string,
    ingredients: {
        value?: string,
        days?: number
    }[]
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
        .replace("{preferences}", getPreferences(body))
        .replace("{ingredients}", getIngredientPreferences(body));

    console.log(customPrompt);

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    if (body.model === "davinci") {
        return await createDavinciCompletion(customPrompt, openai);
    } else {
        return await createGPT35Completion(customPrompt, openai);
    }
}

async function createDavinciCompletion(customPrompt: string, openai: OpenAIApi) {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: customPrompt,
        temperature: 0.2,
        max_tokens: 2048
    });
    console.log(JSON.stringify(completion.data));
    return createObject(completion.data.choices[0].text);
}

async function createGPT35Completion(customPrompt: string, openai: OpenAIApi) {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: customPrompt }],
        temperature: 0.2,
        max_tokens: 2048
    });
    console.log(JSON.stringify(completion.data));
    return createObject(completion.data.choices[0].message?.content);
}

function createObject(gptResponse?: string) {
    if (gptResponse == null) {
        return null;
    }
    var split = gptResponse.split("$startIngredients");
    let ingredientsStr = split[1].split("$endIngredients")[0].trim()
        .replaceAll('name', 'navn')
        .replaceAll('quantity', 'mængde')
        .replaceAll('unit', 'enhed');
    console.log(ingredientsStr)
    if (!ingredientsStr.startsWith('[')) {
        ingredientsStr = '[' + ingredientsStr;
    }
    if (ingredientsStr.endsWith(',')) {
        ingredientsStr.slice(1,-1)
    }
    if (!ingredientsStr.endsWith(']')) {
        ingredientsStr += ']';
    }
    console.log(ingredientsStr)
    const ingredients = JSON.parse(ingredientsStr);

    let planStr = gptResponse
        .split("$startMealPlan")[1]
        .split("$endMealPlan")[0]
        .trim()
        .replaceAll('day', 'dag')
        .replaceAll('description', 'beskrivelse');

    if (!planStr.startsWith('[')) {
        planStr = '[' + planStr;
    }
    if (planStr.endsWith(',')) {
        planStr.slice(1,-1)
    }
    if (!planStr.endsWith(']')) {
        planStr += ']';
    }
    console.log(planStr)

    const plan = JSON.parse(planStr);

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
        res.push('evening meals');
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

function getIngredientPreferences(params: Params): string {
    if (params.ingredients == null || params.ingredients.length === 0) {
        return '';
    }

    const i = params.ingredients.map((v) => `The mealplan must include ${v.value} for ${v.days} days out of ${params.days} days`)

    return i.join('. ') + '. '
}