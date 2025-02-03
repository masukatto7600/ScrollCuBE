const { html } = require("hono/html");

const header = (user, distance) => { return html`
  <nav class="navbar fixed-top bg-info">
    <div class="container-fluid">
      <h1 class="text-light navbar-brand mx-auto">ScrollCuBE WEB Edition</h1>
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="menu" data-bs-toggle="dropdown" aria-expanded="false">
          ${user ? html`${user.login}<i class="bi-person-fill-check`: html`ゲスト<i class="bi-person-add`} ms-1"></i></button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="menu">
          <li>
            <a class="dropdown-item" href="/${user ? html`logout">ログアウト`: html`login">ログイン`}</a>
          </li>
          ${user ? html`<li class="dropdown-item">Best: ${(distance / 100).toFixed(2)}m</li>` : "" }
        </ul>
      </div>
    </div>
  </nav>
`};

const gameDisplay = html`
  <div id="unity-container" class="unity-desktop">
    <canvas id="unity-canvas" width=800 height=450 tabindex="-1"></canvas>
    <div id="unity-loading-bar">
      <div id="unity-logo"></div>
      <div id="unity-progress-bar-empty">
        <div id="unity-progress-bar-full"></div>
      </div>
    </div>
    <div id="unity-warning"> </div>
    <div id="unity-footer">
      <div id="unity-webgl-logo"></div>
      <div id="unity-fullscreen-button"></div>
      <div id="unity-build-title">ScrollCuBE</div>
    </div>
  </div>
`;

const gameScript0 = html`
    var container = document.querySelector("#unity-container");
    var canvas = document.querySelector("#unity-canvas");
    var loadingBar = document.querySelector("#unity-loading-bar");
    var progressBarFull = document.querySelector("#unity-progress-bar-full");
    var fullscreenButton = document.querySelector("#unity-fullscreen-button");
    var warningBanner = document.querySelector("#unity-warning");
    function unityShowBanner(msg, type) {
      function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
      }
      var div = document.createElement('div');
      div.innerHTML = msg;
      warningBanner.appendChild(div);
      if (type == 'error') div.style = 'background: red; padding: 10px;';
      else {
        if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
        setTimeout(function() {
          warningBanner.removeChild(div);
          updateBannerVisibility();
        }, 5000);
      }
      updateBannerVisibility();
    }
`;

const gameScript1 = html`
  var buildUrl = "/ScrollCuBE/Build";
  var loaderUrl = buildUrl + "/ScrollCuBE.loader.js";
  var config = {
    dataUrl: buildUrl + "/ScrollCuBE.data",
    frameworkUrl: buildUrl + "/ScrollCuBE.framework.js",
    codeUrl: buildUrl + "/ScrollCuBE.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "ScrollCuBE",
    productVersion: "1.0",
    showBanner: unityShowBanner,
  };

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    document.getElementsByTagName('head')[0].appendChild(meta);
    container.className = "unity-mobile";
    canvas.className = "unity-mobile";


  } else {

    canvas.style.width = "800px";
    canvas.style.height = "450px";
  }
`;

const gameScript2 = html`
  loadingBar.style.display = "block";

  var script = document.createElement("script");
  script.src = loaderUrl;
  script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
      progressBarFull.style.width = 100 * progress + "%";
          }).then((unityInstance) => {
            window.unityInstance = unityInstance;

            loadingBar.style.display = "none";
            fullscreenButton.onclick = () => {
              unityInstance.SetFullscreen(1);
            };
          }).catch((message) => {
            alert(message);
          });
        };

  document.body.appendChild(script);
`;

const form = html`
  <h2>スコア送信</h2>
  <ul>
    <li>ランキング上の「マイスコア」を更新した場合に自動入力されます。</li>
    <li>過去の記録は送信できません。</li>
    <li>ゲストユーザーは送信できません。</li>
  </ul>
  <form method="post">
    <label for="daily">本日</label>
    <input type="number" name="daily" id="daily" style="width:4em;" readonly>
    <label for="monthly">月間</label>
    <input type="number" name="monthly" id="monthly" style="width:4em;" readonly>
    <label for="allOver">総合</label>
    <input stype="number" name="allOver" id="allOver" style="width:4em;" readonly>
    <label for="distance">最高距離</label>
    <input type="number" name="distance" id="distance" style="width:5em;" readonly>
    <button type="submit" id="submit_button" class="btn btn-primary">送信</button>
  </form>
`;

const formScript = (myScore) => { return html`
  const daily = document.getElementById('daily');
  const distance = document.getElementById('distance');
  const button = document.getElementById('submit_button');
  function buttonActive() {
    if(${Boolean(myScore).toString()} && (daily.value || distance.value)) {
      button.disabled = false;
    }
    else {
      button.disabled = true;
    }
  }
  
    buttonActive();

    if(!${Boolean(myScore).toString()}) {
      button.classList.remove('btn-primary');
      button.classList.add('btn-secondary');
    }

  const getMyScore = () => {
    return ${myScore ? `{
      allOver: ${myScore.highScore},
      monthly: ${myScore.monthly},
      daily: ${myScore.daily},
      distance: ${myScore.distance},
    }` : 'undefined'};
  };
`
};

const help = html`

`;

const ranking0 = (rankings) => {
  const emptyRanking = Array(10).fill( {
    user: { username: '---' },
    highScore: '---',
    monthly: '---',
    daily: '---',
    distance: '---'
  });

  return html`
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
`};

const ranking1 = (rankings, myScore, user) => { return html`
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
      <td class="my-number">---</td>
    </tr>
  `}
  </table>
`};

const rankingScript = html`
  const tabs = document.getElementById('ranking-tab').getElementsByTagName('a');
  const pages = document.getElementById('ranking').getElementsByTagName('div');

  function changeTab() {
    let targetid = this.href.substring(this.href.indexOf('#')+1,this.href.length);

    for(let i=0; i<pages.length; i++) {
        if( pages[i].id != targetid ) {
          pages[i].style.display = "none";
        }
        else {
          pages[i].style.display = "block";
        }
    }
    for(let i=0; i<tabs.length; i++) {
        tabs[i].style.zIndex = "0";
        tabs[i].style.backgroundColor = "#e5f8dd";

    }
    this.style.zIndex = "1";
    this.style.backgroundColor = "#c7fbb3"

    return false;
  }

  for(let i=0; i<tabs.length; i++) {
    tabs[i].onclick = changeTab;
  }
  tabs[0].onclick();
`;

module.exports = { 
  header,
  gameDisplay,
  gameScript0, 
  gameScript1,
  gameScript2,
  form,
  formScript,
  ranking0,
  ranking1,
  rankingScript,
  help,
};