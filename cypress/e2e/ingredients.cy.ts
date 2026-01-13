describe('Ingredients', () => {
  it('creates, filters, updates, and deletes ingredients', () => {
    const email = `ingredients_${Date.now()}@example.com`;
    const password = 'password123';

    cy.registerAndLogin(email, password);
    cy.viewport(360, 800);
    cy.get('[data-cy=nav-ingredients]').click();

    cy.get('[data-cy=ingredient-add-btn]').click();
    cy.get('[data-cy=ingredient-name]').type('Apple');
    cy.get('[data-cy=ingredient-category]').find('.p-select-dropdown').click();
    cy.contains('.p-select-option', 'Fruit', { timeout: 10000 }).click();
    cy.get('[data-cy=ingredient-defaultQuantity] input').clear().type('150');
    cy.get('[data-cy=ingredient-submit]').click();
    cy.contains('Ingredient added').should('exist');

    cy.get('[data-cy=ingredient-add-btn]').click();
    cy.get('[data-cy=ingredient-name]').type('Bread');
    cy.get('[data-cy=ingredient-category]').find('.p-select-dropdown').click();
    cy.contains('.p-select-option', 'Grains', { timeout: 10000 }).click();
    cy.get('[data-cy=ingredient-defaultQuantity] input').clear().type('80');
    cy.get('[data-cy=ingredient-submit]').click();
    cy.contains('Ingredient added').should('exist');

    cy.contains('[data-cy=ingredient-card]', 'Apple').should('exist');
    cy.contains('[data-cy=ingredient-card]', 'Bread').should('exist');

    cy.get('[data-cy=ingredients-category]').find('.p-select-dropdown').click();
    cy.contains('.p-select-option', 'Fruit', { timeout: 10000 }).click();
    cy.get('[data-cy=ingredients-apply]').click();
    cy.contains('[data-cy=ingredient-card]', 'Apple').should('exist');
    cy.contains('[data-cy=ingredient-card]', 'Bread').should('not.exist');

    cy.get('[data-cy=ingredients-category]').find('.p-select-dropdown').click();
    cy.contains('.p-select-option', 'All categories', { timeout: 10000 }).click();
    cy.get('[data-cy=ingredients-apply]').click();

    cy.contains('[data-cy=ingredient-card]', 'Apple').within(() => {
      cy.get('[data-cy=ingredient-edit]').click();
    });
    cy.get('[data-cy=ingredient-name]').clear().type('Green Apple');
    cy.get('[data-cy=ingredient-submit]').click();
    cy.contains('Ingredient updated').should('exist');
    cy.contains('[data-cy=ingredient-card]', 'Green Apple').should('exist');

    cy.contains('[data-cy=ingredient-card]', 'Green Apple').within(() => {
      cy.get('[data-cy=ingredient-delete]').click();
    });
    cy.contains('Ingredient removed').should('exist');
    cy.contains('[data-cy=ingredient-card]', 'Green Apple').should('not.exist');
  });
});
