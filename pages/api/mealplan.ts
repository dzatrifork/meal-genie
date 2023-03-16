import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionResponse, CreateCompletionResponse, OpenAIApi } from "openai";

const prompt = "Make a {days} day food plan for {people} people, with {meals}. {preferences} {ingredients} "
const promptGPT3Ingredients = ". Your response should be in JSON format with three parameters \"name\", \"quantity\" and \"unit\" for each ingredient ex. [{'name': 'Flour', 'quantity':'1', 'unit': 'kg'}]. Values should be in danish. "
const promptGBT3Plan = "Summarize the mealplan as a list with an entry for each day. Your response should be in JSON format with two parameters \"day\" and \"description\" for each day ex. [{'day': 'Day 1', 'description': '...'}]. Values should be in danish. "
const promptDavinci = "Summarize the mealplan as a list with an entry for each day as well as all the ingredients in json-format as a list. Your response should be in JSON format ex. {\"plan\": [{\"day\": \"Day 1\", \"description\": \"...\"}], \"ingredients\": [{\"name\": \"Flour\", \"quantity\":\"1\", \"unit\": \"kg\"}]}. Values should be in danish. "

export type GptResult = {
    planStr: string,
    plan: {
        day: string,
        description: string
    }[],
    ingredients: {
        name: string,
        quantity: string,
        unit: string
    }[]
    gptContent: (CreateChatCompletionResponse | CreateCompletionResponse)[]
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
    console.log(promptDavinci);    
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: customPrompt + promptDavinci,
        temperature: 0.5,
        max_tokens: 2048
    });
    if (completion.data?.choices[0]?.text != null) {
        console.log(completion.data.choices[0].text.trim());
        const json = JSON.parse(completion.data.choices[0].text.trim());
        return {
            planStr: '',
            ...json,
            completions: [completion.data]
        };
    }

    throw Error('Failed to create completion.')
}

async function createGPT35Completion(customPrompt: string, openai: OpenAIApi) {
    console.log(promptGBT3Plan);
    console.log(promptGPT3Ingredients);
    let messages: ChatCompletionRequestMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: customPrompt }
    ];
    const completions = [];
    const mealPlan = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.2,
        max_tokens: 1024
    });

    completions.push(mealPlan.data)

    if (mealPlan.data.choices[0].message?.content != null) {
        const planStr = mealPlan.data.choices[0].message?.content;
        console.log(mealPlan.data.choices[0].message?.content);
        messages.push({ role: "assistant", content: mealPlan.data.choices[0].message?.content });

        let ingredientMessages = messages.concat([{ role: "user", content: promptGPT3Ingredients }])
        let planMessages = messages.concat([{ role: "user", content: promptGBT3Plan }])

        const planPromise = openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: planMessages,
            temperature: 0.2,
            max_tokens: 2024
        });
        const ingredientsPromise = openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: ingredientMessages,
            temperature: 0.2,
            max_tokens: 2024
        });

        const [planJson, ingredientsJson] = await Promise.all([planPromise, ingredientsPromise])
            .then((v) => v.map(i => {
                completions.push(i.data);
                return i.data.choices[0].message?.content
            }))

        if (planJson != null && ingredientsJson != null) {
            console.log(ingredientsJson.split('\`\`\`')[1]);
            console.log(planJson.split('\`\`\`')[1]);
            let plan = JSON.parse(planJson.split('\`\`\`')[1]);
            let ingredients = JSON.parse(ingredientsJson.split('\`\`\`')[1]);
            if (ingredients.keys != null && ingredients.keys().length === 1) {
                ingredients = ingredients[ingredients.keys()[0]];
            }
            if (plan.keys != null && plan.keys().length === 1) {
                plan = plan[plan.keys()[0]];
            }
            
            return {
                planStr,
                plan,
                ingredients,
                completions
            }
        }

    }

    throw Error('Failed to create completion');
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
        ingredientsStr.slice(1, -1)
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
        planStr.slice(1, -1)
    }
    if (!planStr.endsWith(']')) {
        planStr += ']';
    }
    console.log(planStr)

    const plan = JSON.parse(planStr);

    const result: GptResult = {
        planStr: '',
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