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
            <div class="dropdown">
              <button class="btn btn-outline-light dropdown-toggle" type="button" id="menu" data-bs-toggle="dropdown" aria-expanded="false">
                ${user ? html`${user.login}<i class="bi-person-fill-check`: html`ゲスト<i class="bi-person-add`} ms-1"></i></button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="menu">
                <li><a class="dropdown-item" href="/">戻る</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <main style="min-width: 100%;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h3 style="width: 100%;">Login</h3>
            <div class="ms-4 mt-3">
              <a href="/auth/github" class="btn ${user ? 'btn-secondary':'btn-primary'}">GitHub でログイン</a>
              <p>${user ? `現在 ${user.login} でログイン中`: ''}</p>
              <a href="/" class="btn btn-warning">戻る</a>
            </div>
          </div>
        </main>
      `,
      "",
    ),
  );
});

module.exports = app;