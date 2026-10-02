describe("Login demo", () => {
  it("bisa login sebagai Foreman dan masuk ke /home", () => {
    cy.visit("/login");

    cy.get('input[placeholder="Username"]').type("foreman01");
    cy.get('input[placeholder="Password"]').type("password");

    cy.get("#roleForeman").check(); // pilih radio Foreman
    cy.contains("button", "Sign in").click();

    // Harus pindah ke /home
    cy.url().should("include", "/home");
  });
});
