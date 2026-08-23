import { expect, test } from "@playwright/test";

const suffixArrayPath = "/learning-path/strings/suffix-array/";
const lcpArrayPath = "/learning-path/strings/suffix-array-lcp-array/";

test("共享阅读器支持直达、锚点和无刷新切换", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto(`${suffixArrayPath}#后缀数组是什么`);

  const article = page.locator(
    'article[data-article-key="strings/suffix-array"]',
  );
  await expect(article).toBeVisible();
  await expect(page).toHaveURL(
    new RegExp(`${suffixArrayPath}#`),
  );
  await expect(page).toHaveTitle("后缀数组 · 算法竞赛手册");
  await expect(article.getByRole("heading", {
    level: 1,
    name: "后缀数组",
  })).toBeVisible();
  await expect(page.locator("#后缀数组是什么")).toBeInViewport();
  await expect(page.getByRole("heading", {
    level: 2,
    name: "小测",
  })).toBeAttached();

  await page.evaluate(() => {
    (window as Window & { readerMarker?: string }).readerMarker = "kept";
  });
  await page.locator(".article-neighbors .next").click();

  await expect(page).toHaveURL(lcpArrayPath);
  await expect(page.locator(
    'article[data-article-key="strings/suffix-array-lcp-array"]',
  )).toBeVisible();
  await expect(page).toHaveTitle("后缀数组：最长公共前缀数组 · 算法竞赛手册");
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { readerMarker?: string }).readerMarker
  ))).toBe("kept");

  await page.goBack();
  await expect(page).toHaveURL(
    new RegExp(`${suffixArrayPath}#`),
  );
  await expect(article).toBeVisible();
  expect(pageErrors).toEqual([]);
});
