import puppeteer, { Browser, Page } from "puppeteer";
import { Recipe, saveRecipeAsFiles, waitForSelectorNullable } from "./scraperUtils";

const baseUrl = "https://www.mob.co.uk";
const recipesUrl = baseUrl + "/recipes";

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  // await scrapeRecipe(browser, {
  //   title: "Spicy Turkey Ragù",
  //   link: "https://www.mob.co.uk/recipes?page=1",
  // }).then((r) => console.log(r));

  let pageNum = 1;
  while (true) {
    const recipesWithLink = await scrapeRecipeLinks(page, pageNum);
    console.log(
      `Found ${recipesWithLink.length} recipes for page ${pageNum}. Scraping content from each recipe.`
    );

    if (recipesWithLink.length === 0) {
      console.log(`Finished scraping all recipes`);
      break;
    }

    let recipesWithContent: Recipe[] = [];
    for (let i = 4; i < recipesWithLink.length; i += 5) {
      const recipesToUpdate = recipesWithLink.slice(i - 4, i + 1);
      const updatedRecipesBatch = await Promise.all(
        recipesToUpdate.map((recipe) => scrapeRecipe(browser, recipe))
      );
      recipesWithContent.push(...updatedRecipesBatch);
      console.log(updatedRecipesBatch.map((r) => r.title + " - " + r.tags));
    }
    console.log(`Finished scraping content for page ${pageNum}`);
    pageNum++;
  }
  process.exit();
}

main();

// 48 pages normal https://www.mob.co.uk/recipes?page=48
// 34 pages veggie https://www.mob.co.uk/recipes?refinementList%5BdietaryRequirements.title%5D%5B0%5D=Veggie&page=34

async function scrapeRecipeLinks(
  page: Page,
  pageNum: number
): Promise<Recipe[]> {
  console.log(`Loading recipes for page ${pageNum}`);
  const recipes: Recipe[] = [];
  await page.goto(recipesUrl + `?page=${pageNum}`, {
    waitUntil: "domcontentloaded",
  });
  const cookieBtn = await waitForSelectorNullable(
    page,
    ".didomi-continue-without-agreeing",
    1000
  );
  if (cookieBtn != null) {
    cookieBtn.click();
  }

  const recipeGrid = await waitForSelectorNullable(page, ".Hits__grid");

  if (recipeGrid != null) {
    while (true) {
      let link = "";
      let title = "";
      try {
        const recipeItem = await recipeGrid.waitForSelector(
          ".EntryThumbnail__caption",
          { timeout: 1000 }
        );
        if (recipeItem) {
          const recipe = await recipeItem.evaluate((el) => {
            const a = el.querySelector("a");
            link = a?.href ?? "Failed";
            title =
              a?.innerHTML
                .replace("&amp;", "and")
                .replace(/[^a-zA-Z0-9\u00C0-\u017F ]/g, "") ?? "Failed";
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

async function scrapeRecipe(browser: Browser, recipe: Recipe): Promise<Recipe> {
  const recipeTitleKebabCase = recipe.title.toLowerCase().split(" ").join("-");
  const url = recipe.link.includes("recipes?page=")
    ? baseUrl + "/recipes/" + recipeTitleKebabCase
    : recipe.link;
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(5000);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const error = await waitForSelectorNullable(page, ".next-error-h1", 200);
    if (error != null) {
      await page.goto(
        baseUrl +
          "/recipes/" +
          recipeTitleKebabCase.split("-").splice(1).join("-"),
        { waitUntil: "domcontentloaded" }
      );
    }

    // Tags
    const tagsContainer = await waitForSelectorNullable(
      page,
      ".HeroRecipeMeta__categories"
    );
    const dietaryImgs = ["Veggie", "Vegan", "Pescetarian", "Gluten-free"];
    let tags: string[] = [];
    dietaryImgs.map(async (dietary) => {
      const dietaryImg = await waitForSelectorNullable(
        page,
        `img[alt='${dietary}']`
      );
      if (dietaryImg != null) {
        tags.push(dietary === "Veggie" ? "Vegetarian" : dietary);
      }
    });

    if (tagsContainer != null) {
      tags = tags.concat(
        await tagsContainer?.$$eval("a", (elements) =>
          elements.map((el) => el.innerHTML)
        )
      );
    }

    // Servings
    const servingsEl = await waitForSelectorNullable(
      page,
      ".ServingSizeControl__servingSize"
    );
    let servings = "4";
    if (servingsEl != null) {
      servings = await servingsEl?.evaluate((el) => el.innerHTML);
    }

    // Ingredients
    const ingredientsContainer = await waitForSelectorNullable(
      page,
      ".Recipe__ingredients"
    );
    let ingredients: string[] = [];
    if (ingredientsContainer != null) {
      ingredients = await ingredientsContainer.$$eval(
        ".Ingredients__ingredient > div > div",
        (elements) => elements.map((el) => el.innerHTML)
      );
    }

    // Steps
    const stepsContainer = await waitForSelectorNullable(
      page,
      ".Recipe__steps"
    );
    let steps: string[] = [];
    if (stepsContainer != null) {
      steps = await stepsContainer.$$eval(
        ".Step__description > p",
        (elements) => elements.map((el) => el.innerHTML)
      );
    }
    await page.close();
    const res = { ...recipe, steps, servings, ingredients, tags };

    if (
      res.ingredients?.length > 0 ||
      res.steps?.length > 0 ||
      res.tags?.length > 0
    ) {
      saveRecipeAsFiles(res, "Mob Kitchen Link", baseUrl);
    }

    return res;
  } catch (e) {
    await page.close();
    console.log(`Failed getting content for ${recipe.title} - ${url}`);
    console.log(e);
    return { ...recipe, ingredients: [], steps: [], tags: [], servings: "2" };
  }
}
