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
  where: {userId: user.id },
  }) || {
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

  logger.debug(myScore);

  const emptyRanking = Array(10).fill( {
    user: { username: '---' },
    highScore: '---',
    monthly: '---',
    daily: '---',
    distance: '---'
  });

  return c.html(
    layout(
      c,
      "ScrollCuBE",
      html`
        ${user
        ? html`
          <div>
            <a href="/logout">${user.login} をログアウト</a>
          </div>
        `
        : html`
          <div>
            <a href="/login">ログイン</a>
          </div>
        `}

        ${tag.gameDisplay}
        ${tag.scoreForm}

        <h2>スコアランキング</h2>
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
            <h3>${rankings.title}</h3>
            <table>
            ${rankings.value.concat(emptyRanking).slice(0, 10).map(
            (ranking, i) => html`
              <tr class="rank-${i}">
                <td class="number">${i + 1}</td>
                <td class="ranking-name">${ranking.user.username}</td>
                <td class="result">${ranking[rankings.type]}</td>
              </tr>
            `,
            )}
              <tr style="background-color: #84e25f">
                <th style="text-align: right; padding-right: 0.3rem;">▼</th>
                <th style="text-align: left; padding-left: 2rem;">マイスコア</th>
                <th style="text-align: right; padding-right: 0.7rem;">▼</th>
              </tr>
            ${myScore 
            ? html`
              <tr class="rank-${rankings.value.indexOf(rankings.value.find(e => e.user.userId == user.id)) ?? 'my'}" style="height: 1.7rem;">
                <td class="my-number" style="font-size: 1.1rem;">${user ? rankings.value.indexOf(rankings.value.find(e => e.user.userId == user.id)) + 1 
                || html`<span style="font-size: 0.8rem;">圏外</span>` : html`<span style="font-size: 0.8rem;">圏外</span>`}</td>
                <td class="ranking-name">${user.login}</td>
                <td class="my-number" style="font-size: 0.95rem;">${myScore[rankings.type] || 0}</td>
              </tr>
            `
            : html`
              <tr class="rank-my">
                <td class="my-number "style="font-size: 0.8rem;">圏外</td>
                <td class="ranking-name" style="font-size: 0.8rem;">ゲスト ユーザー</td>
                <td class="my-number">----</td>
              </tr>
            `}
            </table>
          </div>
          `)}
        </div>

        <script>
        ${tag.gameScript0}
        ${tag.gameScript1}
        ${tag.gameScript2}

        const daily = document.getElementById('daily');
        const distance = document.getElementById('distance');
        const button = document.getElementById('submit_button');
        function buttonActive() {
          if(Boolean('${user}') ? (daily.value || distance.value): false) {
            console.log(daily.value);
            button.disabled = false;
          }
          else {
            button.disabled = true;
          }
        }
        
        window.onload = buttonActive();

        const getMyScore = () => {
          return ${myScore ? `{
            allOver: ${myScore.highScore},
            monthly: ${myScore.monthly},
            daily: ${myScore.daily},
            distance: ${myScore.distance},
          }` : 'undefined'};
        };

        ${tag.rankingScript}
        </script>
        <script src="unity-bridge.js"></script>
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
    lastMonth: 0,
    daily: parseInt(body.daily ||'0'),
    yesterDay: 0,
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

    const yesterDay = () => {
      let now = new Date();
      now.setDate(now.getDate() - 1);
      now = setDateId(now);
      return now;
    };

    const lastMonth = () => {
      let now = new Date();
      now.setMonth(now.getMonth() - 1);
      now = toMonthly(setDateId);
      return now;
    };


    if(ranking !== null) {
      if(ranking.highScore > value.highScore) {
        value.highScore = ranking.highScore;
        value.recodedAt = ranking.recodedAt;
      }

      if(value.updatedAt !== toDay) {
        value.toDay = 0;
      }
      if(ranking.updatedAt === yesterDay) {
        value.yesterDay = ranking.daily;
      } else if(ranking.updatedAt !== toDay) {
        value.yesterDay = 0;
      }
      else if(ranking.daily > value.daily) {
        value.daily = ranking.daily;
      }
  
      if(toMonthly(value.updatedAt) !== toMonthly(toDay)) {
        value.monthly = 0;
      }
      if(toMonthly(ranking.updatedAt) === lastMonth) {
        value.lastMonth = ranking.monthly;
      } else if(toMonthly(ranking.updatedAt) !== toMonthly(toDay)) {
        value.lastMonth = 0;
      }
      else if(ranking.monthly > value.monthly) {
        value.monthly = ranking.monthly;
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