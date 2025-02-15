const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");

const app = new Hono();

app.get("/", (c) => {
  const { user } = c.get("session") ?? {};
  return c.html(
    layout(
      c,
      "Login",
      html`
        <nav class="navbar fixed-top bg-info">
          <div class="container-fluid">
            <h1 class="text-light navbar-brand mx-auto">ScrollCuBE WEB Edition</h1>
          </div>
        </nav>
        <main  style="max-width: 900px;">
          <h1>Login</h1>
          <a href="/auth/github" class="btn ${user ? 'btn-secondary':'btn-primary'}">GitHub でログイン</a>
          <p>${user ? `現在 ${user.login} でログイン中`: ''}</p>
          <a href="/" class="btn btn-warning">戻る</a>
        </main>
      `,
    ),
  );
});

module.exports = app;