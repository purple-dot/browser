describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://127.0.0.1:8080/dist/index')
    cy.window().should('have.attr', 'PurpleDot');
  })
})
