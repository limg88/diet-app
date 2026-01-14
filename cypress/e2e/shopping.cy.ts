describe('Shopping list', () => {
  it('aggregates menu items, supports off-menu, and toggles purchased', () => {
    const apiUrl = Cypress.env('apiUrl');
    const email = `shopping_${Date.now()}@example.com`;
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
          body: { name: 'Milk', category: 'Dairy', defaultUnit: 'ml', defaultQuantity: 200 },
        }).then((ingredientResponse) => {
          const ingredientId = ingredientResponse.body.id as string;

          cy.request({
            method: 'GET',
            url: `${apiUrl}/menu/current`,
            headers: auth,
          }).then((menuResponse) => {
            const day1 = menuResponse.body.days[0];
            const breakfast = day1.meals.find(
              (meal: { mealType: string }) => meal.mealType === 'BREAKFAST',
            );
            const lunch = day1.meals.find(
              (meal: { mealType: string }) => meal.mealType === 'LUNCH',
            );

            cy.request({
              method: 'POST',
              url: `${apiUrl}/menu/current/meals/${breakfast.id}/items`,
              headers: auth,
              body: { ingredientId, quantity: 200, unit: 'ml' },
            });

            cy.request({
              method: 'POST',
              url: `${apiUrl}/menu/current/meals/${lunch.id}/items`,
              headers: auth,
              body: { ingredientId, quantity: 50, unit: 'ml' },
            });

            cy.viewport(375, 800);
            cy.visit('/shopping', {
              onBeforeLoad(win) {
                win.localStorage.setItem('dietapp_token', token);
              },
            });

            cy.contains('[data-cy=shopping-card]', 'Milk', { timeout: 10000 })
              .should('exist')
              .within(() => {
                cy.contains('250 ml').should('exist');
                cy.get('[data-cy=shopping-toggle]').click({ force: true });
                cy.contains('Purchased').should('exist');
                cy.get('[data-cy=warehouse-input] input').clear().type('100').blur();
                cy.contains('150 ml').should('exist');
              });

            cy.reload();

            cy.contains('[data-cy=shopping-card]', 'Milk', { timeout: 10000 })
              .should('exist')
              .within(() => {
                cy.get('[data-cy=warehouse-input] input').should('have.value', '100');
              });

            cy.get('[data-cy=off-menu-open]').click();
            cy.get('[data-cy=off-menu-name]').type('Water');
            cy.get('[data-cy=off-menu-unit]').click();
            cy.contains('.p-select-option', 'ml').click();
            cy.get('[data-cy=off-menu-quantity] input').clear().type('500');
            cy.get('[data-cy=off-menu-submit]').click();
            cy.contains('Off-menu item added').should('exist');
            cy.contains('[data-cy=shopping-card]', 'Water').should('exist');

            cy.get('[data-cy=shopping-source]').click();
            cy.contains('.p-select-option', 'Menu').click();
            cy.get('[data-cy=shopping-apply]').click();
            cy.contains('[data-cy=shopping-card]', 'Water').should('not.exist');
            cy.contains('[data-cy=shopping-card]', 'Milk').should('exist');
          });
        });
      });
    });
  });

  it('shows aggregated quantities from multiple menu entries', () => {
    const apiUrl = Cypress.env('apiUrl');
    const email = `shopping_sum_${Date.now()}@example.com`;
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
        }).then((ingredientResponse) => {
          const ingredientId = ingredientResponse.body.id as string;

          cy.request({
            method: 'GET',
            url: `${apiUrl}/menu/current`,
            headers: auth,
          }).then((menuResponse) => {
            const day1 = menuResponse.body.days[0];
            const breakfast = day1.meals.find(
              (meal: { mealType: string }) => meal.mealType === 'BREAKFAST',
            );
            const dinner = day1.meals.find(
              (meal: { mealType: string }) => meal.mealType === 'DINNER',
            );

            cy.request({
              method: 'POST',
              url: `${apiUrl}/menu/current/meals/${breakfast.id}/items`,
              headers: auth,
              body: { ingredientId, quantity: 120, unit: 'gr' },
            });

            cy.request({
              method: 'POST',
              url: `${apiUrl}/menu/current/meals/${dinner.id}/items`,
              headers: auth,
              body: { ingredientId, quantity: 80, unit: 'gr' },
            });

            cy.viewport(375, 800);
            cy.visit('/shopping', {
              onBeforeLoad(win) {
                win.localStorage.setItem('dietapp_token', token);
              },
            });

            cy.contains('[data-cy=shopping-card]', 'Rice', { timeout: 10000 })
              .should('exist')
              .within(() => {
                cy.contains('200 gr').should('exist');
              });
          });
        });
      });
    });
  });

  it('shows collaborator quantities in the dedicated column', () => {
    const apiUrl = Cypress.env('apiUrl');
    const password = 'password123';
    const ownerEmail = `shop_owner_${Date.now()}@example.com`;
    const collabEmail = `shop_collab_${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/register`,
      body: { email: ownerEmail, password },
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: { email: collabEmail, password },
        failOnStatusCode: false,
      }).then(() => {
        cy.request('POST', `${apiUrl}/auth/login`, { email: ownerEmail, password }).then((loginOwner) => {
          cy.request('POST', `${apiUrl}/auth/login`, { email: collabEmail, password }).then((loginCollab) => {
            const tokenOwner = loginOwner.body.accessToken as string;
            const tokenCollab = loginCollab.body.accessToken as string;

            cy.request({
              method: 'POST',
              url: `${apiUrl}/collaboration/invites`,
              headers: { Authorization: `Bearer ${tokenOwner}` },
              body: { email: collabEmail },
            }).then((invite) => {
              cy.request({
                method: 'POST',
                url: `${apiUrl}/collaboration/invites/${invite.body.id}/accept`,
                headers: { Authorization: `Bearer ${tokenCollab}` },
              });
            });

            cy.request({
              method: 'POST',
              url: `${apiUrl}/ingredients`,
              headers: { Authorization: `Bearer ${tokenCollab}` },
              body: {
                name: 'Collab Beans',
                category: 'Protein',
                defaultUnit: 'gr',
                defaultQuantity: 120,
              },
            }).then((ingredientResponse) => {
              const ingredientId = ingredientResponse.body.id as string;

              cy.request({
                method: 'GET',
                url: `${apiUrl}/menu/current`,
                headers: { Authorization: `Bearer ${tokenCollab}` },
              }).then((menuResponse) => {
                const day1 = menuResponse.body.days[0];
                const breakfast = day1.meals.find(
                  (meal: { mealType: string }) => meal.mealType === 'BREAKFAST',
                );

                cy.request({
                  method: 'POST',
                  url: `${apiUrl}/menu/current/meals/${breakfast.id}/items`,
                  headers: { Authorization: `Bearer ${tokenCollab}` },
                  body: { ingredientId, quantity: 120, unit: 'gr' },
                });

                cy.viewport(1280, 800);
                cy.intercept('GET', '**/api/shopping/current*').as('shoppingList');
                cy.visit('/shopping', {
                  onBeforeLoad(win) {
                    win.localStorage.setItem('dietapp_token', tokenOwner);
                  },
                });

                cy.wait('@shoppingList')
                  .its('response.body.items')
                  .should('have.length.greaterThan', 0);

                cy.get('[data-cy=shopping-table]', { timeout: 10000 }).should('exist');
                cy.contains('[data-cy=shopping-table] th', 'Collaborator').should('exist');
                cy.contains('td', 'Collab Beans', { timeout: 10000 })
                  .parents('tr')
                  .within(() => {
                    cy.get('[data-cy=shopping-collab]').should('contain', collabEmail);
                    cy.get('[data-cy=shopping-collab]').should('contain', '120 gr');
                  });
              });
            });
          });
        });
      });
    });
  });
});
