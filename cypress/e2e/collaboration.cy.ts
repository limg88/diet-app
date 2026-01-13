const registerAndLogin = (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl');
  return cy
    .request({
      method: 'POST',
      url: `${apiUrl}/auth/register`,
      body: { email, password },
      failOnStatusCode: false,
    })
    .then((register) => {
      const userId = register.body?.id as string;
      return cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((login) => {
        const token = login.body.accessToken as string;
        return { token, userId };
      });
    });
};

describe('Collaboration', () => {
  it('invites and accepts a collaborator', () => {
    const password = 'password123';
    const emailA = `collab_a_${Date.now()}@example.com`;
    const emailB = `collab_b_${Date.now()}@example.com`;

    registerAndLogin(emailA, password).then(({ token: tokenA }) => {
      registerAndLogin(emailB, password).then(({ token: tokenB }) => {
        cy.visit('/collaboration', {
          onBeforeLoad(win) {
            win.localStorage.setItem('dietapp_token', tokenA);
          },
        });

        cy.get('[data-cy=collaboration-invite-email]').type(emailB);
        cy.get('[data-cy=collaboration-invite-submit]').click();
        cy.contains('Invite sent').should('exist');
        cy.contains('[data-cy=collaboration-outgoing]', emailB).should('exist');

        cy.visit('/collaboration', {
          onBeforeLoad(win) {
            win.localStorage.setItem('dietapp_token', tokenB);
          },
        });

        cy.contains('[data-cy=collaboration-incoming]', emailA).should('exist');
        cy.get('[data-cy=collaboration-accept]').first().click();
        cy.contains('Invite accepted').should('exist');
        cy.contains('[data-cy=collaboration-partners]', emailA).should('exist');
      });
    });
  });

  it('opens collaborator menu and persists updates', () => {
    const apiUrl = Cypress.env('apiUrl');
    const password = 'password123';
    const emailA = `menu_owner_${Date.now()}@example.com`;
    const emailB = `menu_collab_${Date.now()}@example.com`;

    registerAndLogin(emailA, password).then(({ token: tokenA, userId: userIdA }) => {
      registerAndLogin(emailB, password).then(({ token: tokenB }) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/ingredients`,
          headers: { Authorization: `Bearer ${tokenA}` },
          body: {
            name: 'Shared Yogurt',
            category: 'Dairy',
            defaultUnit: 'gr',
            defaultQuantity: 200,
          },
        });

        cy.request({
          method: 'POST',
          url: `${apiUrl}/collaboration/invites`,
          headers: { Authorization: `Bearer ${tokenA}` },
          body: { email: emailB },
        }).then((invite) => {
          cy.request({
            method: 'POST',
            url: `${apiUrl}/collaboration/invites/${invite.body.id}/accept`,
            headers: { Authorization: `Bearer ${tokenB}` },
          });
        });

        cy.viewport(1280, 800);
        cy.visit(`/collaborators/${userIdA}/menu`, {
          onBeforeLoad(win) {
            win.localStorage.setItem('dietapp_token', tokenB);
          },
        });

        cy.get('.menu-desktop', { timeout: 10000 }).should('be.visible');
        cy.get('.menu-desktop [data-cy^=meal-ingredient-]').first().click();
        cy.contains('.p-select-option', 'Shared Yogurt').click();
        cy.contains('Item added').should('exist');

        cy.get('.menu-desktop [data-cy=meal-item-quantity] input')
          .first()
          .clear()
          .type('250')
          .blur();

        cy.contains('Quantity updated').should('exist');
        cy.reload();
        cy.get('[data-cy=meal-item-quantity] input').first().should('have.value', '250');
      });
    });
  });

  it('includes collaborator menu items in shopping totals', () => {
    const apiUrl = Cypress.env('apiUrl');
    const password = 'password123';
    const emailA = `shop_owner_${Date.now()}@example.com`;
    const emailB = `shop_collab_${Date.now()}@example.com`;

    registerAndLogin(emailA, password).then(({ token: tokenA }) => {
      registerAndLogin(emailB, password).then(({ token: tokenB }) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/collaboration/invites`,
          headers: { Authorization: `Bearer ${tokenA}` },
          body: { email: emailB },
        }).then((invite) => {
          cy.request({
            method: 'POST',
            url: `${apiUrl}/collaboration/invites/${invite.body.id}/accept`,
            headers: { Authorization: `Bearer ${tokenB}` },
          });
        });

        cy.request({
          method: 'POST',
          url: `${apiUrl}/ingredients`,
          headers: { Authorization: `Bearer ${tokenB}` },
          body: {
            name: 'Collaborator Oats',
            category: 'Grains',
            defaultUnit: 'gr',
            defaultQuantity: 80,
          },
        }).then((ingredientResponse) => {
          const ingredientId = ingredientResponse.body.id as string;

          cy.request({
            method: 'GET',
            url: `${apiUrl}/menu/current`,
            headers: { Authorization: `Bearer ${tokenB}` },
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
              headers: { Authorization: `Bearer ${tokenB}` },
              body: { ingredientId, quantity: 100, unit: 'gr' },
            });

            cy.request({
              method: 'POST',
              url: `${apiUrl}/menu/current/meals/${dinner.id}/items`,
              headers: { Authorization: `Bearer ${tokenB}` },
              body: { ingredientId, quantity: 50, unit: 'gr' },
            });

            cy.viewport(375, 800);
            cy.visit('/shopping', {
              onBeforeLoad(win) {
                win.localStorage.setItem('dietapp_token', tokenA);
              },
            });

            cy.contains('[data-cy=shopping-card]', 'Collaborator Oats', { timeout: 10000 })
              .should('exist')
              .within(() => {
                cy.contains('150 gr').should('exist');
              });
          });
        });
      });
    });
  });
});
