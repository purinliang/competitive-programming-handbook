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

  for (const endpoint of [
    "/api/discussions/summary?document_key=learning-path:strings/suffix-array",
    "/api/discussions?document_key=learning-path:strings/suffix-array"
      + "&target_kind=article&target_id=article",
  ]) {
    const response = await page.request.get(endpoint);
    expect(response.ok()).toBe(true);
  }

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
  await page.reload();
  await expect(article).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("独立目录、搜索索引和正文错误状态可以读取", async ({ page }) => {
  await page.goto("/learning-path/");
  await expect(page.getByRole("heading", {
    level: 1,
    name: "学习路线",
  })).toBeVisible();

  await page.goto("/catalog/");
  await expect(page.getByRole("heading", {
    level: 1,
    name: "模块目录",
  })).toBeVisible();

  await page.goto("/search/");
  await page.getByPlaceholder("搜索标题、概念或代码名称").fill("ST表");
  await expect(page.locator(
    '.search-results [data-article-key="data-structures/sparse-table"]',
  )).toBeVisible();

  await page.goto("/learning-path/strings/article-does-not-exist/");
  await expect(page.getByText("正文暂时无法读取，请稍后重试。"))
    .toBeVisible();
  await expect(page.getByRole("button", { name: "重新读取" })).toBeVisible();
});
