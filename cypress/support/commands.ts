Cypress.Commands.add('registerAndLogin', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl');
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/register`,
    body: { email, password },
    failOnStatusCode: false,
  }).then(() => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: { email, password },
    }).then((response) => {
      const token = response.body?.accessToken as string;
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('dietapp_token', token);
        },
      });
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      registerAndLogin(email: string, password: string): Chainable<void>;
    }
  }
}
