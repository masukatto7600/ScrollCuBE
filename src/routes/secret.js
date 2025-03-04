const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");

const app = new Hono();

app.get("/", (c) => {
  const { user } = c.get("session") ?? {};
  return c.html(
    layout(
      c,
      "シークレット / ScrollCuBE",
      html`
        <nav class="navbar fixed-top bg-info">
          <div class="container-fluid">
            <h1 class="text-light navbar-brand mx-auto">ScrollCuBE WEB Edition</h1>
            <div class="dropdown">
              <button class="btn btn-outline-light dropdown-toggle" type="button" id="menu" data-bs-toggle="dropdown" aria-expanded="false">
                シークレット<i class="ms-1 bi-question-circle"></i></button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="menu">
                ${user ? '' : html`<li><a href="/auth/github" class="dropdown-item">GitHub でログイン</a></li>`}
                <li><a href="/" class="dropdown-item">戻る</a></li>
              </ul>
            </div>
          </div>
        </nav>
        <main style="min-width: 100%;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h3 style="width: 100%;">よくぞ辿り着きましたね</h3>

          </div>
        </main>
      `,
      "",
    ),
  );
});

module.exports = app;