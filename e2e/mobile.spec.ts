import { expect, test } from "@playwright/test";

test("the garden fills the viewport and opens accessible game sheets", async ({
  page,
}) => {
  await page.goto("/");
  const garden = page.locator(".garden-scene");
  await expect(garden).toBeVisible();
  const bounds = await garden.boundingBox();
  const viewport = page.viewportSize()!;
  expect(bounds!.x).toBe(0);
  expect(bounds!.y).toBe(0);
  expect(bounds!.width).toBeCloseTo(viewport.width, 0);
  expect(bounds!.height).toBeCloseTo(viewport.height, 0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open the hive" }).click();
  await expect(
    page.getByRole("dialog", { name: "The little hive" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open the hive" }),
  ).toBeFocused();
});

test("small phones and landscape keep landmarks and thumb controls reachable", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 430, height: 932 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".recovery-screen")).toHaveCount(0);
    for (const control of await page
      .locator(".game-dock button, .hud-button, .scene-marker")
      .all()) {
      const bounds = await control.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);
    }
    for (const [button, title] of [
      ["Open the hive", "The little hive"],
      ["Tend the flower beds", "Your flower garden"],
      ["Open the pantry and home shipping box", "Pantry & shipping"],
    ]) {
      await page.getByRole("button", { name: button, exact: true }).click();
      await expect(page.getByRole("dialog", { name: title })).toBeVisible();
      await page
        .getByRole("button", { name: `Close ${title}`, exact: true })
        .click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
  }
});

test("fonts and artwork load from the app rather than external services", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:4173") &&
      !request.url().startsWith("data:")
    )
      external.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".recovery-screen")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
});
