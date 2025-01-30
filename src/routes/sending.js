const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");
const ensureAuthenticated = require("../middlewares/ensure-authenticated");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] });

const app = new Hono();

app.get("/", ensureAuthenticated(), (c) => {
  return c.html(
    layout(
      c,
      "予定の作成",
      html`
        <form method="post" action="/sending">
          <button type="submit">Test</button>
        </form>
      `,
    ),
  );
});

  app.post('/', (c) => {
    return c.text('POST /endpoint')
  });

module.exports = app;