import puppeteer from "puppeteer-core";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const { SCRAPING_URL } = process.env;

type StarData = {
  date: string;
  name: string;
  sign: string;
  word: string;
};

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const arrayChunk = <T extends any[]>(array: T, size = 1) => {
  return array.reduce(
    (acc, _, index) =>
      index % size ? acc : [...acc, array.slice(index, index + size)],
    [] as T[][]
  );
};

const createStarDataCode = (starData: StarData[]): string => {
  const starDataStr = starData.map((s) => {
    return `{
  date: "${s.date}",
  name: "${s.name}",
  sign: "${s.sign}",
  word: "${s.word}"
}
`;
  });

  return `export const STAR_DATA = [
  ${starDataStr}
]
`;
};

const main = async () => {
  const browser = await puppeteer.launch({
    channel: "chrome",
  });
  const page = await browser.newPage();

  let starData: StarData[] = [];

  for (const month of months) {
    await page.goto(`${SCRAPING_URL}${month}.html`);
    const data = await page.evaluate(() => {
      const body = document.querySelector("tbody")?.textContent;
      return body;
    });
    if (!data) {
      await browser.close();
      return;
    }

    const trimData = data
      .replace(/ /g, "")
      .split("\n")
      .filter((d) => d !== "");

    const chunks = arrayChunk(trimData, 4);
    const d: StarData[] = chunks.map((c: string[]) => {
      if (c.length !== 4) {
        throw new Error("星言葉をとってきてるサイトの構造が変わったようだ!!");
      }

      return {
        date: c[0].replace("月", "/").replace("日", ""),
        name: c[1],
        sign: c[2],
        word: c[3],
      };
    });

    starData = [...starData, ...d];
  }

  if (!existsSync("output")) {
    mkdirSync("output");
  }
  writeFileSync("output/star-words.ts", createStarDataCode(starData));

  await browser.close();
};

main();
