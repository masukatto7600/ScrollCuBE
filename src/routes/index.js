const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");
const ensureAuthenticated = require('../middlewares/ensure-authenticated');
const { PrismaClient } = require('@prisma/client');
const Log4js = require('log4js');
const prisma = new PrismaClient({ log: ['query'] });

const app = new Hono();
const logger = Log4js.getLogger();
logger.level = 'all';
const tag = require("../tag");

app.get("/", async (c) => {
  const { user } = c.get('session') ?? {};

  const allOver = await prisma.ranking.findMany({
    orderBy: { highScore: 'desc' },
    take: 100,
    select: {
      user: true,
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
        ${tag.header(user, myScore ? myScore.distance : undefined)}
        <main id="main" style="max-width: 900px;">
          <div style="display: inline-block;">
            ${tag.gameDisplay}
            <h2>オンラインスコア</h2>
            ${tag.form}
          </div>
          <div id="right" style="display: flex; flex-direction: column;">
            <div id="ranking-table" class="ms-3">
              <h3 style="width: 25rem;">ランキング</h3>
              <div class="ms-1 mb-3" style="display: flex; align-items:flex-end;">
                <div style="min-width: fit-content;">
                  <p id="ranking-tab">
                    ${onlineScore.map(
                    (rankings) => html`
                      <a href="#ranking-${onlineScore.indexOf(rankings)}">${rankings.title}</a>
                    `)}
                  </p>
                  <div id="ranking">
                    ${onlineScore.map(
                    (rankings) => html`
                      <div id="ranking-${onlineScore.indexOf(rankings)}" style="width: fit-content;">
                        ${tag.ranking0(rankings, user ? user.id : 0, 10)}
                        ${tag.ranking1(rankings, myScore, user)}
                      </div>
                    `)}
                  </div>
                </div>
                <a href="/ranking" class="ms-2" style="min-width: fit-content;"><button class="btn btn-primary px-2 py-1"><small>もっと見る<i class="bi-arrow-right-square ps-1"></i></small></button></a>
              </div>
              
            </div>
            <div style="height: fit-content;">
              <h2 id="help-h2">遊び方・ゲームシステム</h2>
              ${tag.help}
            </div>
          </div>
        </main>

        <script src="unity-bridge.js"></script>
        <script>
        ${tag.gameScript0}
        ${tag.gameScript1}
        ${tag.gameScript2}
        </script>
        <script>
        ${tag.formScript(myScore)}
        ${tag.rankingScript}
        ${tag.layoutScript0}
        ${tag.layoutScript1}
        ${tag.layoutScript2}
        </script>
      `,
    ),
  );
});

app.post('/', ensureAuthenticated(), async (c) => {
  const { user } = c.get('session') ?? {};
  const body = await c.req.parseBody();

  const myScore = await prisma.ranking.findFirst({
    where: {userId: user.id },
  });

  const data = setData(myScore, {
    userId: user.id,
    updatedAt: setDateId(new Date()),
    recodedAt: new Date(),
    highScore: parseInt(body.allOver ||'0'),
    monthly: parseInt(body.monthly ||'0'),
    daily: parseInt(body.daily ||'0'),
    distance: parseInt(body.distance ||'0')
  });

  await prisma.ranking.upsert({
    where: { userId: user.id },
    create: data,
    update: data,
  });

  return c.redirect("/");
});

function setData(ranking, data) {
  {
    const value = data;
    const toDay = setDateId(new Date());

    if(value.updatedAt !== toDay) {
      value.toDay = 0;
    }
    if(toMonthly(value.updatedAt) !== toMonthly(toDay)) {
      value.monthly = 0;
    }

    if(ranking !== null) {
      if(ranking.highScore > value.highScore) {
        value.highScore = ranking.highScore;
        value.recodedAt = ranking.recodedAt;
      }
      if(ranking.daily > value.daily && ranking.updatedAt === toDay) {
        value.daily = ranking.daily;
      }
      if(ranking.monthly > value.monthly && toMonthly(ranking.updatedAt) === toMonthly(toDay)) {
        value.monthly = ranking.monthly;
      }
      if(ranking.distance > value.distance) {
        value.distance = ranking.distance;
      }
    }
    return value;
  }
}

const setDateId = (date) => {
  return parseInt(`${date.getUTCFullYear()}${date.getUTCMonth()}.${('0'+ date.getUTCDate()).slice(-2)}` *100);
};

const toMonthly = (value) => Math.floor(value / 100);

module.exports = app;