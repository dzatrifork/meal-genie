import { jsonrepair } from "jsonrepair";

export function parseJson(gptJsonStr: string): any {
  const jsonStr =
    gptJsonStr.split("```")[1] != null
      ? gptJsonStr.split("```")[1]
      : gptJsonStr;

  console.log(jsonStr);
  const repairedJsonStr = jsonrepair(jsonStr);

  const obj = JSON.parse(repairedJsonStr);
  return obj;
}
