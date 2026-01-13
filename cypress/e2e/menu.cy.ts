describe('Weekly menu', () => {
  it('adds items and blocks invalid meal types', () => {
    const apiUrl = Cypress.env('apiUrl');
    const email = `menu_${Date.now()}@example.com`;
    const password = 'password123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/register`,
      body: { email, password },
      failOnStatusCode: false,
    }).then(() => {
      cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((login) => {
        const token = login.body.accessToken as string;
        const auth = { Authorization: `Bearer ${token}` };

        cy.request({
          method: 'POST',
          url: `${apiUrl}/ingredients`,
          headers: auth,
          body: { name: 'Rice', category: 'Grains', defaultUnit: 'gr', defaultQuantity: 100 },
        });

        cy.request({
          method: 'POST',
          url: `${apiUrl}/ingredients`,
          headers: auth,
          body: {
            name: 'Eggs',
            category: 'Protein',
            defaultUnit: 'unit',
            defaultQuantity: 2,
            allowedMealTypes: ['BREAKFAST'],
          },
        });

        cy.request({
          method: 'GET',
          url: `${apiUrl}/menu/current`,
          headers: auth,
        }).then((menuResponse) => {
          const day1 = menuResponse.body.days[0];
          const lunch = day1.meals.find((meal: { mealType: string }) => meal.mealType === 'LUNCH');

          cy.visit('/menu', {
            onBeforeLoad(win) {
              win.localStorage.setItem('dietapp_token', token);
            },
          });

          cy.get(`[data-cy=meal-ingredient-${lunch.id}]`).first().click();
          cy.contains('.p-select-option', 'Rice').click();
          cy.contains('Item added', { timeout: 10000 }).should('exist');
          cy.contains('[data-cy=meal-item]', 'Rice').should('exist');

          cy.contains('[data-cy=meal-item]', 'Rice').within(() => {
            cy.get('[data-cy=meal-item-quantity] input')
              .clear({ force: true })
              .type('120', { force: true })
              .blur();
          });
          cy.contains('Quantity updated', { timeout: 10000 }).should('exist');

          cy.get(`[data-cy=meal-ingredient-${lunch.id}]`).first().click();
          cy.contains('.p-select-option', 'Eggs').click();
          cy.contains('Ingredient not allowed for this meal type', { timeout: 10000 }).should('exist');
        });
      });
    });
  });
});
