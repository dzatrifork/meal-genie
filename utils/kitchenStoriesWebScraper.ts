import path from "path";
import puppeteer, { Browser, Page } from "puppeteer";
import { ensureDirectoryExists, saveStringAsFile } from "./files";
import { saveRecipeAsFiles as saveRecipeAsFile } from "./scraperUtils";

export interface Recipe {
  title: string;
  link: string;
  ingredients?: string[];
  steps?: string[];
  tags?: string[];
  servings?: string;
}

const baseUrl = "https://www.kitchenstories.com";
const kitchenStoriesRecipesUrl = baseUrl + "/en/recipes";

async function main() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  // const recipesWithLink = await scrapeRecipeLinks(page);
  // console.log(`Found ${recipesWithLink.length} recipes. Scraping content from each recipe.`);

  await scrapeRecipe(browser, {
    title: "Chinese wild garlic pancake",
    link: "https://www.kitchenstories.com/en/recipes/chinese-wild-garlic-pancake",
  }).then((r) => console.log(r));

  await scrapeRecipe(browser, {
    title: "Tsukune Japanese Meatballs",
    link: "https://www.kitchenstories.com/en/recipes/tsukune-japanese-meatballs",
  }).then((r) => console.log(r));

  await scrapeRecipe(browser, {
    title: "Potato and min ravioli with sage butter",
    link: "https://www.kitchenstories.com/en/recipes/potato-and-mint-ravioli-with-sage-butter",
  }).then((r) => console.log(r));
  await scrapeRecipe(browser, {
    title: "Chicken cordon bleu with creamy white asparagus",
    link: "https://www.kitchenstories.com/en/recipes/chicken-cordon-bleu-with-creamy-white-asparagus",
  }).then((r) => console.log(r));

  // let recipesWithContent: Recipe[] = [];
  // for (let i = 4; i < recipesWithLink.length; i += 5) {
  //   const recipesToUpdate = recipesWithLink.slice(i - 4, i + 1);
  //   const updatedRecipesBatch = await Promise.all(
  //     recipesToUpdate.map((recipe) => scrapeRecipe(browser, recipe))
  //   );
  //   recipesWithContent.push(...updatedRecipesBatch);
  //   if (i % 50 <= 5) {
  //     console.log(`${i}/${recipesWithLink.length}`);
  //   }
  // }

  process.exit();
}

main();

async function scrapeRecipe(browser: Browser, recipe: Recipe): Promise<Recipe> {
  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(5000);
    await page.setJavaScriptEnabled(false);
    await page.goto(recipe.link, { waitUntil: "domcontentloaded" });
    const tags = await page.$$eval(
      'li[data-test="recipe-tags-item"]',
      (items) =>
        items.map(
          (it) =>
            it.querySelector("a")?.innerHTML.replace("#<!-- -->", "") ?? ""
        )
    );
    const servings = await page.$eval(
      'span[data-test="recipe-ingredients-servings-count"]',
      (it) => it.innerHTML
    );
    const ingredients = await page.$$eval(
      'div[data-test="recipe-ingredients-item"]',
      (items) => {
        return items.map((item) => {
          const amount = Array.from(
            item
              .querySelector('div[data-test="recipe-ingredients-item-amount"]')
              ?.querySelectorAll("span") ?? []
          )
            .map((it) => it.innerHTML)
            .join("");
          const foodItem = item.querySelector("div:last-child")?.innerHTML;
          return amount + (amount.length > 0 ? " " : "") + foodItem;
        });
      }
    );

    const stepsContainer = await page.waitForSelector(
      'section[data-test="recipe-steps"]'
    );

    let steps: string[] = [];
    if (stepsContainer) {
      steps = await stepsContainer.$$eval("*:is(p)", (elements) =>
        elements.map((el) => el.innerHTML)
      );
    }
    await page.close();
    const res = { ...recipe, ingredients, steps, tags, servings };
    saveRecipeAsFile(res, "Kitchen Stories Link", baseUrl);
    return res;
  } catch {
    await page.close();
    console.log(`Failed getting content for ${recipe.link}`);
    return { ...recipe, ingredients: [], steps: [], tags: [], servings: "2" };
  }
}

async function scrapeRecipeLinks(page: Page): Promise<Recipe[]> {
  const recipes: Recipe[] = [];
  console.log("Finding recipes...");
  await page.goto(kitchenStoriesRecipesUrl, { waitUntil: "domcontentloaded" });
  for (let i = 0; i <= 150; i++) {
    await page.keyboard.press("PageDown");
    await new Promise((r) => setTimeout(r, 500));
  }

  const recipeUl = await page.waitForSelector('ul[data-test="recipes-hits"]');

  if (recipeUl != null) {
    while (true) {
      let link = "";
      let title = "";
      try {
        const recipeItem = await recipeUl.waitForSelector(
          'li[data-test="recipes-hits-item"] > a[data-test="global-card-title"]',
          { timeout: 100 }
        );
        if (recipeItem) {
          const recipe = await recipeItem.evaluate((el) => {
            link = el.href;
            const div = el.querySelector("header > div");
            title = div?.innerHTML ?? "Failed";
            el.remove();
            const recipe = {
              link,
              title,
            };
            return recipe;
          });
          recipes.push(recipe);
          continue;
        }
      } catch {
        return recipes;
      }
    }
  }
  return recipes;
}
