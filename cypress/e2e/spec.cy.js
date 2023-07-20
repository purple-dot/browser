describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:8080/dist/index')
    cy.window().should('have.attr', 'PurpleDot');
<<<<<<< HEAD

    cy.window().then((win) => {
      win.PurpleDot.init({ apiKey: 'b351faa2-8693-4c09-b814-759beed90d0b' });

      win.PurpleDot.checkout.open({
        cartId: 'bcc9daa54d4eb89b36df5321dd087ab2',
      })
    });
=======
>>>>>>> main
  })
})
