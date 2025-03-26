// TODO: rewrite this to not use a real Shopify store
// Perhaps fetchCart can return a dummy cart when it's called with a special cart ID?
// Then we could use that dummy cart ID here, and open a checkout for that dummy cart
// This would allow us to test the checkout flow without using a real Shopify store
describe("opening a checkout", () => {
  it("can open a checkout for the Demo store", () => {
    cy.visit("http://127.0.0.1:8080/dist/index");
    cy.window().should("have.attr", "PurpleDot");

    cy.window().then((win) => {
      win.PurpleDot.init({
        // Purple Dot Test store
        apiKey: "a351a49e-c6ec-4ed6-95e2-97c80b9aee09",
        cartAdapter: new win.PurpleDot.ShopifyAJAXCart(),
      });
    });

    // Wait for the components to be registered
    cy.wait(1000);

    // Cart with THIS IS USED IN AUTOMATED TESTING product
    cy.setCookie(
      "cart",
      "Z2NwLWV1cm9wZS13ZXN0MTowMUpROFpCSk4yWUNQQVRWQTEwVk1KNldGQg",
    );

    cy.window().then(async (win) => {
      await win.PurpleDot.checkout.open();
    });

    cy.get("#checkout-iframe").should("exist");
    cy.get("#checkout-iframe")
      .should("have.attr", "src")
      .should(
        "include",
        "https://www.purpledotprice.com/embedded-checkout/combined-checkout?apiKey=a351a49e-c6ec-4ed6-95e2-97c80b9aee09",
      );

    cy.getIframeBody("#checkout-iframe").should("contain", "Your cart");
  });
});
