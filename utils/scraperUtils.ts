import path from "path";
import { ensureDirectoryExists, saveStringAsFile } from "./files";
import { Page } from "puppeteer";

export interface Recipe {
  title: string;
  link: string;
  ingredients?: string[];
  steps?: string[];
  tags?: string[];
  servings?: string;
}

export function recipeToMarkdown(r: Recipe, linkTitle: string, baseUrl: string) {
  const doc: string[] = [];
  doc.push(`# ${r.title}\n`);
  const url = r.link.includes("recipes?page=")
    ? baseUrl + "/recipes/" + r.title.toLowerCase().split(" ").join("-")
    : r.link;
  doc.push(`[${linkTitle}](${url})\n`);
  if ((r.tags?.length ?? 0) > 0) {
    r.tags?.forEach((tag) => {
      doc.push(`*${tag}*, `);
    });
    doc.push(`\n`);
  }
  if ((r.ingredients?.length ?? 0) > 0) {
    doc.push(`## Ingredients for ${r.servings} servings: \n`);
    r.ingredients?.forEach((ing) => {
      doc.push(`- ${ing}\n`);
    });
    doc.push(`\n`);
  }
  if ((r.steps?.length ?? 0) > 0) {
    doc.push(`## Steps\n`);
    r.steps?.forEach((step) => {
      doc.push(`- ${step}\n`);
    });
  }
  return doc.join("");
}

export function saveRecipeAsFiles(recipe: Recipe, linkTitle: string, baseUrl: string) {
    const outputDir = "recipesData";
    ensureDirectoryExists(outputDir);
    const name: string = recipe.title
      .replace(/[^a-zA-Z0-9\u00C0-\u017F ]/g, "")
      .toLowerCase()
      .split(" ")
      .join("-");
    const filename = path.join(outputDir, `${name}.md`);
    const content = recipeToMarkdown(recipe, linkTitle, baseUrl);
    saveStringAsFile(content, filename);
  }
  
export async function waitForSelectorNullable(
    page: Page,
    selector: string,
    timeout?: number
  ) {
    try {
      return await page.waitForSelector(selector, { timeout: timeout ?? 500 });
    } catch {
      return null;
    }
  }
