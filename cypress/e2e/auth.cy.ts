describe('Auth', () => {
  it('registers and logs in', () => {
    const email = `cypress_${Date.now()}@example.com`;
    const password = 'password123';

    cy.visit('/login');
    cy.get('[data-cy=login-toggle]').click();
    cy.get('[data-cy=login-email]').type(email);
    cy.get('#login-password').type(password);
    cy.get('[data-cy=login-submit]').click();
    cy.contains('Account created. You can log in now.').should('exist');

    cy.get('[data-cy=login-email]').clear().type(email);
    cy.get('#login-password').clear().type(password);
    cy.get('[data-cy=login-submit]').click();
    cy.url().should('include', '/menu');
    cy.contains('Weekly Menu').should('exist');
  });

  it('logs out on mobile', () => {
    const email = `logout_mobile_${Date.now()}@example.com`;
    const password = 'password123';

    cy.viewport(375, 800);
    cy.registerAndLogin(email, password);
    cy.get('[data-cy=logout-mobile]').should('be.visible').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('dietapp_token')).to.eq(null);
    });
  });

  it('logs out on desktop', () => {
    const email = `logout_desktop_${Date.now()}@example.com`;
    const password = 'password123';

    cy.viewport(1024, 800);
    cy.registerAndLogin(email, password);
    cy.get('[data-cy=logout-desktop]').should('be.visible').click();
    cy.url().should('include', '/login');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('dietapp_token')).to.eq(null);
    });
  });
});
