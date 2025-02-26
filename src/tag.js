const { html } = require("hono/html");

const header = (user, distance) => { return html`
  <nav class="navbar fixed-top bg-info">
    <div class="container-fluid">
      <h1 class="text-light navbar-brand mx-auto">ScrollCuBE WEB Edition</h1>
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="menu" data-bs-toggle="dropdown" aria-expanded="false">
          ${user ? html`${user.login}<i class="bi-person-fill-check`: html`ゲスト<i class="bi-person-add`} ms-1"></i></button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="menu">
          <li class="dropdown-item"><small>▼レイアウト▼</small></li>
          <li id="layout-btns" style="display: flex; height: 2rem;">
            <button class="btn dropdown-item layout-icon" type="button" onclick="change(0, true)"><img src="/images/layout-icon-00.svg" alt="00"></button>
            <button class="btn dropdown-item layout-icon" type="button" onclick="change(1, true)"><img src="/images/layout-icon-01.svg" alt="01"></button>
            <button class="btn dropdown-item layout-icon" type="button" onclick="change(2, true)"><img src="/images/layout-icon-02.svg" alt="02"></button>
          </li>
          <li><a class="dropdown-item${user ? " bg-danger-subtle" : ''}" href="/${user ? html`logout">ログアウト`: html`login">ログイン`}</a></li>
          <li class="dropdown-item"><small>最高距離: ${user ? (distance / 100).toFixed(2) : "--.--" }m</small></li>
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
    companyName: "defaultCompany",
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

const form = (myScore) => { return html`
  <div class="ms-3">
    <p>このフォームを送信することで、オンラインスコアランキングに参加・スコアを更新できます。</p>
    <ul>
      <li>ランキング上の「マイスコア」を更新した場合に自動入力されます。</li>
      <li>記録は15分間、またはページを再読み込みするまで保持されます。なお、<b class="text-danger">過去の記録は送信できません</b>。</li>
      <li>ゲストユーザーは送信できません。15分以内に認証を完了させてください。</li>
    </ul>
    <form method="post">
      <label for="daily">本日</label>
      <input type="text" name="daily" id="daily" style="width:4em;" placeholder="${myScore ? myScore.daily : ''}" readonly>
      <label for="monthly">月間</label>
      <input type="text" name="monthly" id="monthly" style="width:4em;" placeholder="${myScore ? myScore.monthly : ''}" readonly>
      <label for="allOver">総合</label>
      <input type="text" name="allOver" id="allOver" style="width:4em;" placeholder="${myScore ? myScore.highScore : ''}" readonly>
      <label for="distance">最高距離</label>
      <input type="text" name="distance" id="distance" style="width:5em;" placeholder="${myScore ? myScore.distance : ''}" readonly>
      <button type="submit" onclick="send()" id="submit_button" class="btn btn-success" disabled><i id="send-icon" class="bi-send"></i></button>
    </form>
  </div>
`};

const ranking0 = (rankings, id, length, type) => {
  const emptyRanking = Array(length).fill( {
    user: { username: '---' },
    highScore: '---',
    monthly: '---',
    daily: '---',
    distance: '-----',
    recodedAt: '',
  });

  return html`
    <h4 class="${type ? 'sticky' : ''}">${rankings.title}</h4>
    <table>
    ${rankings.value.concat(emptyRanking).slice(0, length).map(
    (ranking, i) => html`
      <tr class="rank-${i<=2 ? i :(i%2)+3}" style="${type && i<=9 ? 'height: 2.3rem;' : ''}">
        <td class="number" style="${i >= 99 ? 'display: block; transform: scale(0.7, 1) translate(-15%, 0);' : ''}">${i +1}</td>
        <td class="ranking-name">${ranking.user.username}${ranking.user.userId === id ? html`<i class="bi-person-square ps-1"></i>` : ''}${
        type === 'highScore' && ranking.recodedAt && i<=9 ? html`<br><small>${new Date(ranking.recodedAt).toLocaleString("ja-JP")}</small>` : ''}</td>
        <td class="result">${type === 'distance' && ranking.distance !== '-----' ? (ranking.distance /100).toFixed(2)+'m' : ranking[rankings.type]}</td>
      </tr>
    `,
    )}
      <tr style="background-color: #74da4b">
        <th style="text-align: right; padding-right: 0.3rem;">▼</th>
        <th style="text-align: left; padding-left: 2rem;">マイスコア</th>
        <th style="text-align: right; padding-right: 0.7rem;">▼</th>
      </tr>
  `;
};

const ranking1 = (rankings, myScore, user) => { return html`
  ${myScore 
  ? html`
    <tr class="rank-${rankings.value.slice(0, 3).indexOf(rankings.value.find(e => e.user.userId == user.id)) ?? '-1'}" style="height: 1.7rem;">
      <td class="my-number" style="font-size: 1.1rem;">${user ? rankings.value.indexOf(rankings.value.find(e => e.user.userId == user.id)) +1
      || html`<span style="font-size: 0.8rem;">圏外</span>` : html`<span style="font-size: 0.8rem;">圏外</span>`}</td>
      <td class="ranking-name">${user.login}</td>
      <td class="my-number" style="font-size: 0.95rem;">${myScore ? (rankings.type === 'distance' ? (myScore.distance/100).toFixed(2)+'m' : myScore[rankings.type]) : 0}</td>
    </tr>
  `
  : html`
    <tr class="rank--1">
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
        if(pages[i].id !== targetid) {
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

  function send() {
    document.cookie = 'myscore=; max-age=0';
  }
`;

const help = html`
  <div class="ms-3">
  <h3>このゲームについて</h3>
    <p>自動横スクロール、エンドレスのジャンプアクションゲームです。</p>
    <p><i class="bi-arrow-up-square"></i>キー、クリック（タップ）でジャンプ。2段ジャンプも可能です。</p>
    <p>迫り来る仕掛けやアイテムを駆使し、高得点を目指しましょう。</p>
    <p>詳しくはゲーム内「Tutorial」をご覧ください。</p>
  <h3>記録の保存</h3>
    <p>マイスコアや設定はサイト上に保存されます。</p>
    <p>最終変更から約1年経過するとデータが消去されます。</p>
    <p>ログインするとオンラインランキングに参加できます。</p>
  </div>
`;

const layoutScript0 = html`
  const main = document.getElementById('main');
  const right = document.getElementById('right');
  const table = document.getElementById('ranking-table');
  const help = document.getElementById('help-h2');
  const btns = document.getElementById('layout-btns').getElementsByTagName('button');

  let layout = 0;
  let autoLayout = -1;

  const setLayout = [
    function() {
      main.style.width = "900px";
      main.style.display = "block";
      right.style.flexDirection = "column";
      help.style.display = "block";
      table.classList.add('ms-3');
    },
    function() {
      main.style.width = "1000px";
      main.style.display = "block";
      right.style.flexDirection = "row";
      help.style.display = "none";
      table.classList.remove('ms-3');
    },
    function() {
      main.style.width = "1400px";
      main.style.display = "flex";
      right.style.flexDirection = "column-reverse";
      help.style.display = "none";
      table.classList.add('ms-3');
    },
  ];
`

const layoutScript1 = html`
  function buttonActive(changed) {
    for(let i=0; i<pages.length; i++) {
      if(i === changed) {
        if(i === layout) {
          btns[i].disabled = true;
          btns[i].classList.add('bg-primary-subtle');
        }
      } else {
        const organized = responsive(i);
        const checked = btns[i].classList.contains('bg-primary-subtle');
        const disabled = btns[i].classList.contains('bg-dark-subtle');
        
        if(changed === layout && checked) {
          btns[i].classList.remove('bg-primary-subtle');
          if(organized === -1) {
            btns[i].disabled = false;
          } else if(organized !== -1) {
            btns[i].classList.add('bg-dark-subtle');
          }
        }
        if(organized !== -1 && !disabled && !checked) {
          btns[i].disabled = true;
          btns[i].classList.add('bg-dark-subtle');
        }
        else if(organized === -1 && disabled) {
          btns[i].disabled = false;
          btns[i].classList.remove('bg-dark-subtle');
        }
      }
    }
  }
`;

const layoutScript2 = html`
  function responsive (type) {
    const width = window.innerWidth;

    if(width < 1000) {
      return (type > 0 ? 0 : -1);
    } else if(width < 1400) {
      return (type > 1 ? 1 : -1);
    } else {
      return -1;
    }
  }

  function change(value, save) {
    if(save) {
      document.cookie = \`layout=\${value}; max-age=\${366 * 86400}\`;
      layout = value;
    }
    if(value !== -1) {
      autoLayout = responsive(value);
      setLayout[(autoLayout === -1 ? value : autoLayout)]();
    }
    
    buttonActive(value);
  }

  window.addEventListener('DOMContentLoaded', function () {
    const value = GetCookieValue('layout');
    layout = isNaN(value) ? 0 : value % 3;

    change(layout, false);
  });

  window.addEventListener('resize', function () {
    autoLayout = responsive(layout);
    change(autoLayout === -1 ? layout  : autoLayout, undefined);
  });
`;

const rHeader = (user, myScore) => { return html`
  <nav class="navbar fixed-top bg-info">
    <div class="container-fluid">
      <a href="/" class="ms-5"><button class="btn btn-outline-light" type="button"><i class="bi-arrow-left-square pe-1"></i>戻る</button></a>
      <h1 class="text-light navbar-brand mx-auto">ScrollCuBE WEB Edition</h1>
      <button class="btn btn-outline-light me-3" type="button" onclick="rankingChange()">ランキング切替<i class="bi-files ps-1"></i></button>
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="menu" data-bs-toggle="dropdown" aria-expanded="false">
          ${user ? html`${user.login}<i class="bi-person-fill-check`: html`ゲスト<i class="bi-person-add`} ms-1"></i></button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="menu">
          <li><a href="/" class="dropdown-item">戻る</a></li>
          <li><a class="dropdown-item${user ? " bg-danger-subtle" : ''}" href="/${user ? html`logout">ログアウト`: html`login">ログイン`}</a></li>
          <li class="dropdown-item"><small>ハイスコア: ${user ? myScore.highScore : "----" }<br>最高距離: ${user ? (myScore.distance / 100).toFixed(2) : "--.--" }m</small></li>
        </ul>
      </div>
    </div>
  </nav>
`};

const rScript = html`
  const pages = document.getElementById('ranking').getElementsByTagName('div');
  let ranking = 0;

  function rankingChange() {
    if(ranking === 0) {
      ranking = 1;
      pages[0].style.display = "none";
      pages[1].style.display = "none";
      pages[2].style.display = "block";
      pages[3].style.display = "block";
    }
    else {
      ranking = 0;
      pages[0].style.display = "block";
      pages[1].style.display = "block";
      pages[2].style.display = "none";
      pages[3].style.display = "none";
    }
  }

  window.addEventListener('DOMContentLoaded', rankingChange);
`;

module.exports = { 
  header,
  gameDisplay,
  gameScript0, 
  gameScript1,
  gameScript2,
  form,
  ranking0,
  ranking1,
  rankingScript,
  help,
  layoutScript0,
  layoutScript1,
  layoutScript2,
  rHeader,
  rScript,
};