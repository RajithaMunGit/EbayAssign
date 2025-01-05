const { test, expect } = require("@playwright/test");

// Global Setup: Define base URL and reusable selectors
const baseURL = "https://www.ebay.com";
const selectors = {
  searchBox: "input[name=_nkw]",
  searchButton: "input[type=submit]",
  searchResultList: "li.s-item",
  selectedItem: "(//a[@class='s-item__link'])[3]",
  relatedProductsSection: "h2.JRiH",
  relatedProductItems: "(//div[contains(@class,'ZXXo skpn')])[1]",
};

  // Test Case 1: Verify Main Product Search
  test("Verify that the main product is displayed after search", async ({
    page,
  }) => {
    await page.goto(baseURL);

    // Search for "wallet"
    await page.locator(selectors.searchBox).fill("wallet");
    
    await page.locator(selectors.searchButton).click();
     
    // Verify the main product appears
    await expect(page).toHaveURL(/nkw=wallet/);

    const searchItems = page.locator(selectors.searchResultList).first();
    await expect(searchItems).toBeVisible();
  });

  // Test Case 2: Verify Related Products Section
  test("Verify related products are displayed on the main product page", async ({
    page,
  }) => {
    await page.goto(baseURL);
    await page.fill(selectors.searchBox, "wallet");
    await page.click(selectors.searchButton);
    const selectedItem = page.locator(selectors.searchResultList).first();
    const itemLink = await selectedItem
      .locator(selectors.selectedItem)
      .getAttribute("href");

    await page.goto(itemLink);
    
    //check similar items label
    const element = page.locator(selectors.relatedProductsSection).first();
    await expect(element).toBeVisible();

    // // Verify that up to 6 related products are displayed
    const parentDiv = page.locator("div.TaQa._4QSx");
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await parentDiv.waitFor({ state: "visible" });

    // Get the count of child elements inside the div
    const childCount = await parentDiv.locator("> *").count();

    // Print the count of child elements
    console.log(`Count of child elements: ${childCount}`);
    const similarItems = parentDiv.locator("> *");
    // // Verify each related product has a price and title
    for (let i = 0; i < childCount; i++) {
      const item = similarItems.nth(i);
      const title = await item.locator("h3").innerText();
      const price = await item.locator("div.UKGh span").innerText();

      expect(title).not.toBeNull();
      expect(price).not.toBeNull();
    }

   //  expect(childCount).toBeGreaterThan(0);
     //expect(childCount).toBeLessThanOrEqual(6);
  });
   
