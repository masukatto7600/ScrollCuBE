const { html } = require("hono/html");

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

const scoreForm = html`
  <h2>スコア送信</h2>
  <ul>
    <li>マイスコアの「本日1位」を更新した場合に自動入力されます。</li>
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
  gameDisplay,
  gameScript0, 
  gameScript1,
  gameScript2,
  scoreForm,
  rankingScript,
};