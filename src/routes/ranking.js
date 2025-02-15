const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

const app = new Hono();
const tag = require("../tag");

app.get("/", async (c) => {
  const { user } = c.get('session') ?? {};

  const allOver = await prisma.ranking.findMany({
    orderBy: { highScore: 'desc' },
    take: 100,
    select: {
      user: true,
      recodedAt: true,
      highScore: true,
    },
  });

  const toDay = await prisma.ranking.findMany({
    where: { updatedAt: setDateId(new Date()) },
    orderBy: { daily: 'desc' },
    take: 100,
    select: {
      user: true,
      daily: true,
    },
  });

  const monthly = await prisma.ranking.findMany({
    where: { updatedAt: {
        gt: setDateId(new Date()) - 50,
        lt: setDateId(new Date()) + 50,
      }, },
    orderBy: { monthly: 'desc' },
    take: 100,
    select: {
      user: true,
      monthly: true,
    },
  });

  const distance = await prisma.ranking.findMany({
    orderBy: { distance: 'desc' },
    take: 100,
    select: {
      user: true,
      distance: true,
    },
  });

  const onlineScore = [
    {
      value: toDay,
      title: '本日',
      type: 'daily',
    }, {
      value: monthly,
      title: '月間',
      type: 'monthly',
    }, {
      value: allOver,
      title: '総合',
      type: 'highScore',
    }, {
      value: distance,
      title: '移動距離',
      type: 'distance',
    }, 
  ];

  const myScore = user ? await prisma.ranking.findFirst({
    where: {userId: user.id }, }) || {
    updatedAt: setDateId(new Date()),
    highScore: 0,
    monthly: 0,
    daily: 0,
    distance: 0,
  }: undefined;
  if(myScore) {
    if(myScore.updatedAt !== setDateId(new Date())) {
      myScore.daily = 0;
    }
    if(toMonthly(myScore.updatedAt) !== toMonthly(setDateId(new Date()))) {
      myScore.monthly = 0;
    }
  }

  return c.html(
    layout(
      c,
      "ScrollCuBE",
      html`
        ${tag.rHeader(user, myScore)}
        <main style="max-width: 900px;">
            <div id="ranking" style="display: flex" class="mb-3">
              ${onlineScore.map(
              (rankings) => html`
                <div id="ranking-${onlineScore.indexOf(rankings)}" style="min-width: fit-content;">
                  ${tag.ranking0(rankings, user ? user.id : 0, 100, rankings.type)}
                  ${tag.ranking1(rankings, myScore, user)}
                </div>
              `)}
            </div>
            <div class="mb-2 ms-1">
              <a href="/"><button class="btn btn-warning btn-outline-light" type="button"><i class="bi-arrow-left-square pe-1"></i>戻る</button></a>
              <a href="#"><button class="btn btn-success btn-outline-light" type="button">上へ<i class="bi-arrow-up-square ps-1"></i></button></a>
              </div>
        </main>
        <script>
        ${tag.rScript}
        </script>
      `,
    ),
  );
});

const setDateId = (date) => {
  return parseInt(`${date.getUTCFullYear()}${date.getUTCMonth()}.${('0'+ date.getUTCDate()).slice(-2)}` *100);
};

const toMonthly = (value) => Math.floor(value / 100);

module.exports = app;