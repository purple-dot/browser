describe("opening a checkout", () => {
  it("can open a checkout for the Demo store", () => {
    cy.visit("http://127.0.0.1:8080/dist/index");
    cy.window().should("have.attr", "PurpleDot");

    cy.window().then((win) => {
      win.PurpleDot.init({ apiKey: "b351faa2-8693-4c09-b814-759beed90d0b" });
    });

    // Wait for the components to be registered
    cy.wait(1000);

    cy.setCookie("cart", "bcc9daa54d4eb89b36df5321dd087ab2");

    cy.window().then(async (win) => {
      win.PurpleDot.checkout.open({
        cartId: await win.PurpleDot.ShopifyAJAXCart.getCartId(),
      });
    });

    cy.get("#checkout-iframe").should("exist");
    cy.get("#checkout-iframe")
      .should("have.attr", "src")
      .should(
        "include",
        "https://www.purpledotprice.com/embedded-checkout/combined-checkout?apiKey=b351faa2-8693-4c09-b814-759beed90d0b",
      );

    cy.getIframeBody("#checkout-iframe").should("contain", "Your cart");
  });
});
