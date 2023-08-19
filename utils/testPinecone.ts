import * as dotenv from "dotenv";
import { MealPlanParams, getContextPrompts } from "../lib/generatePrompt";
import { getContext } from "./context";
import { getPineconeClient } from "./pinecone";

async function testPinecone() {
  dotenv.config({ path: ".env.local" });
  try {
    // await testMealPlanParams();

    // const specificDish = await testSpecificDish();

    await deletePineconeNamespace();
  } catch (e) {
    console.log(e);
  }
}

testPinecone();
async function deletePineconeNamespace() {
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("kitchen-stories-recipes");

    pineconeIndex.delete1({ deleteAll: true, namespace: "kitchen-stories-3" });
}

async function testSpecificDish() {
    const specificDish = await getContext(
        "# Crispy Curry Chicken Burger\n",
        3,
        undefined,
        0.9
    );    
    console.log(specificDish);
}

async function testMealPlanParams() {
    const body: MealPlanParams = {
        breakfast: true,
        lunch: true,
        dinner: true,
        days: "3",
        ingredients: ["chicken", "beef"],
        types: ["italian"],
        preferences: "vegan",
        contextNamespace: "mob-kitchen",
        persons: "2",
        model: "gpt-4",
    };
    const contextPrompts = getContextPrompts(body);
    const contexts = await Promise.all(
        contextPrompts.map((p) => {
            console.log(p);
            return getContext(p, 1, "mob-kitchen");
        })
    );
}

