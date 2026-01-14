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

          cy.viewport(1366, 768);
          cy.visit('/menu', {
            onBeforeLoad(win) {
              win.localStorage.setItem('dietapp_token', token);
            },
          });

          cy.get(`.menu-desktop [data-cy=meal-ingredient-${lunch.id}]`).first().click();
          cy.contains('.p-select-option', 'Rice').click();
          cy.contains('Item added', { timeout: 10000 }).should('exist');
          cy.get('.menu-desktop').contains('[data-cy=meal-item]', 'Rice').should('exist');
          cy.contains('.menu-desktop [data-cy=meal-item] .item-name', 'Rice').should('be.visible');
          cy.contains('.menu-desktop [data-cy=meal-item]', 'Rice')
            .find('.item-controls')
            .should('be.visible');
          cy.get('.menu-desktop').contains('[data-cy=meal-item]', 'Rice').then(($item) => {
            const itemEl = $item[0];
            const controlsEl = itemEl.querySelector('.item-controls') as HTMLElement | null;
            expect(controlsEl).to.exist;
            const itemRect = itemEl.getBoundingClientRect();
            const controlsRect = controlsEl?.getBoundingClientRect();
            if (!controlsRect) {
              throw new Error('Missing item controls');
            }
            expect(itemEl.scrollWidth).to.be.at.most(itemEl.clientWidth + 16);
            expect(controlsRect.top).to.be.at.most(itemRect.top + 4);
          });

          cy.get('.menu-desktop').contains('[data-cy=meal-item]', 'Rice').within(() => {
            cy.get('[data-cy=meal-item-quantity] input')
              .scrollIntoView()
              .click({ force: true })
              .clear({ force: true })
              .type('120', { force: true })
              .trigger('blur', { force: true });
          });
          cy.contains('Quantity updated', { timeout: 10000 }).should('exist');

          cy.get(`.menu-desktop [data-cy=meal-ingredient-${lunch.id}]`).first().click();
          cy.contains('.p-select-option', 'Eggs').click();
          cy.contains('Ingredient not allowed for this meal type', { timeout: 10000 }).should('exist');
        });
      });
    });
  });
});
