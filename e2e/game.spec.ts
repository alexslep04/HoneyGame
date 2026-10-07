import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function ready(page: Page) {
  await expect(
    page.getByRole("heading", { name: "Honey & Hearth — your backyard" }),
  ).toBeAttached();
  await expect(page.locator(".recovery-screen")).toHaveCount(0);
}
async function closeSheet(page: Page) {
  const dialog = page.getByRole("dialog");
  if (await dialog.count()) {
    await dialog.locator(".close-sheet").click();
    await expect(dialog).not.toBeVisible();
  }
}
async function openPanel(page: Page, name: string) {
  await closeSheet(page);
  await page
    .getByRole("navigation", { name: "Your apiary" })
    .getByRole("button", { name, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function preview(page: Page, button: string) {
  await closeSheet(page);
  await page.getByRole("button", { name: "Open beekeeper notebook" }).click();
  await page.getByRole("button", { name: button, exact: true }).click();
  await closeSheet(page);
}
async function readSave(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("honey-and-hearth:save:v1")!),
  );
}

test("save export, reset, and import preserve the existing backyard", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await preview(page, "Pass 1 minute");
  await page.getByRole("button", { name: /Gather \(/ }).click();
  const original = await readSave(page);
  expect(original.stats.harvested).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Open beekeeper notebook" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export save", exact: true }).click();
  const download = await downloadPromise;
  const exported = await readFile((await download.path())!);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await expect.poll(async () => (await readSave(page)).stats.harvested).toBe(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("input[type=file]").setInputFiles({
    name: "backyard.json",
    mimeType: "application/json",
    buffer: exported,
  });
  await expect
    .poll(async () => (await readSave(page)).stats.harvested)
    .toBe(original.stats.harvested);
  expect((await readSave(page)).inventory).toEqual(original.inventory);
  await page.reload();
  await ready(page);
  expect((await readSave(page)).stats.harvested).toBe(original.stats.harvested);
});

test("care, forage, harvest, ship, earn, purchase, and reload", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await ready(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: testInfo.outputPath("backyard.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open the hive" }).click();
  await page.getByRole("button", { name: /Check on the colony/ }).click();
  await expect(
    page.getByRole("button", { name: /Check on the colony/ }),
  ).toBeDisabled();
  await openPanel(page, "Flower garden");
  await page.getByRole("button", { name: "Plant Lavender in bed 3" }).click();
  await page.getByRole("button", { name: "Lavender", exact: true }).click();
  await preview(page, "Pass 1 minute");
  await page.getByRole("button", { name: /Gather \(/ }).click();
  await openPanel(page, "Pantry");
  await page.getByRole("button", { name: "Ship all Lavender honey" }).click();
  let save = await readSave(page);
  expect(save.shipping.lavenderHoney).toBeGreaterThan(0);
  expect(save.coins).toBe(16);
  const shipped = save.shipping.lavenderHoney;
  await preview(page, "Go to market day");
  await openPanel(page, "Village market");
  await expect(
    page.getByRole("heading", { name: "The stalls are open!" }),
  ).toBeVisible();
  expect((await readSave(page)).coins).toBe(16);
  await page.getByRole("button", { name: "Buy Lavender seeds" }).click();
  expect((await readSave(page)).coins).toBe(4);
  await preview(page, "Close this market");
  save = await readSave(page);
  expect(save.coins).toBe(4 + shipped * 11);
  expect(save.shipping.lavenderHoney).toBe(0);
  await preview(page, "Go to market day");
  await page.getByRole("button", { name: /Gather \(/ }).click();
  await openPanel(page, "Pantry");
  await page.getByRole("button", { name: "Ship all Lavender honey" }).click();
  await preview(page, "Close this market");
  await preview(page, "Go to market day");
  await openPanel(page, "Village market");
  await page.getByRole("button", { name: "Buy Roomier honey frames" }).click();
  save = await readSave(page);
  expect(save.upgrades.hive).toBe(1);
  await page.reload();
  await ready(page);
  expect((await readSave(page)).upgrades.hive).toBe(1);
  expect((await readSave(page)).coins).toBe(save.coins);
  expect(errors).toEqual([]);
});

test("game sheets scroll within the viewport and return to the garden", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await ready(page);
  for (const name of [
    "The hive",
    "Flower garden",
    "Pantry",
    "Village market",
    "Letters",
  ]) {
    await openPanel(page, name);
    await expect
      .poll(async () => {
        const bounds = await page.getByRole("dialog").boundingBox();
        return (
          bounds!.y >= 0 &&
          bounds!.y + bounds!.height <= page.viewportSize()!.height + 1
        );
      })
      .toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: testInfo.outputPath("letters.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Keep this letter" }).click();
  await expect(
    page.getByRole("button", { name: "Read & tucked away" }),
  ).toBeDisabled();
  await closeSheet(page);
  await page.getByRole("button", { name: "Open beekeeper notebook" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("a long absence catches up once and settles shipping without attendance", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await preview(page, "Pass 1 minute");
  await page.getByRole("button", { name: /Gather \(/ }).click();
  await openPanel(page, "Pantry");
  await page.getByRole("button", { name: "Ship all Clover honey" }).click();
  const before = await readSave(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem("absence-injected")) return;
    const key = "honey-and-hearth:save:v1";
    const game = JSON.parse(localStorage.getItem(key)!);
    game.lastSavedAt = Date.now() - 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(key, JSON.stringify(game));
    sessionStorage.setItem("absence-injected", "yes");
  });
  await page.reload();
  await expect(
    page.getByText(/Calendar catch-up stopped at two weeks/),
  ).toBeVisible();
  const after = await readSave(page);
  expect(after.gameTime - before.gameTime).toBeGreaterThanOrEqual(14 * 600_000);
  expect(after.gameTime - before.gameTime).toBeLessThan(14 * 600_000 + 5000);
  expect(after.coins).toBe(16 + before.shipping.cloverHoney * 8);
  await page.reload();
  await ready(page);
  expect((await readSave(page)).coins).toBe(after.coins);
});

test("invalid saved data is preserved instead of silently reset", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "honey-and-hearth:save:v1",
      '{"version":9,"important":"keep"}',
    ),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Let’s keep your save safe." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("honey-and-hearth:save:v1")),
  ).toContain('"important":"keep"');
});

test("another tab cannot become a second writer", async ({ page, context }) => {
  await page.goto("/");
  await ready(page);
  const second = await context.newPage();
  await second.goto("/");
  await expect(
    second.getByRole("heading", {
      name: "Your garden is open in another tab.",
    }),
  ).toBeVisible();
  await page.close();
  await second.reload();
  await ready(second);
});

test("a suspended foreground tab respects the offline calendar cap", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await ready(page);
  const before = await readSave(page);
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  const after = await readSave(page);
  expect(after.gameTime - before.gameTime).toBeLessThanOrEqual(
    14 * 600_000 + 1000,
  );
  expect(after.gameTime - before.gameTime).toBeGreaterThanOrEqual(14 * 600_000);
});
