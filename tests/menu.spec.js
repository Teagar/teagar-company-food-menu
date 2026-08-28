import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const pageUrl = pathToFileURL(resolve("index.html")).href;

test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("filtra o cardapio e atualiza a comanda", async ({ page }) => {
  await expect(page.locator(".menu-item")).toHaveCount(11);

  await page.locator("#menuSearch").fill("cupim");
  await expect(page.locator(".menu-item")).toHaveCount(1);
  await expect(page.locator(".menu-item h3")).toHaveText("Cupim / mandioca / cebola");

  await page.locator("[data-add='6']").click();
  await expect(page.locator("#cartCount")).toHaveText("1");
  await page.locator("#openCart").click();
  await expect(page.locator("#cart")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#cartTotal")).toHaveText("R$ 72,00");
});

test("mantem controles dentro da largura mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBe(dimensions.viewport);

  await page.getByRole("button", { name: "03 / Vegetais" }).click();
  await expect(page.locator(".menu-item")).toHaveCount(2);
  await page.locator("#vegetarianOnly").check();
  await expect(page.locator(".menu-item")).toHaveCount(2);
});
