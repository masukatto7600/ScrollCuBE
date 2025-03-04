//---コンテスト用に公開---//

let decryptKey = ''; //暗号化キー

//暗号化
const encrypt = (src, key) => CryptoJS.AES.encrypt(src, key);

//復号
const decrypt = (des, key) => {
  const decrypted = CryptoJS.AES.decrypt(des, key);
  const utf8 = decrypted.toString(CryptoJS.enc.Utf8);
  return utf8;
};

//Unityから実行可能な関数
const receiver = {
  //暗号化キーをセット
  SetKey: function(parameter) {
    decryptKey = parameter;
    scoreLoad();
  },
  //Cookieに記録する
  SetCookie: function(parameter) {
    const data = JSON.parse(parameter);
    const cookieID = data.cookieID;
    const value = encrypt(data.value, decryptKey);
    const maxAge = 366 * 86400;

    document.cookie = `${cookieID}=${value}; max-age=${maxAge}`;
  },
  //CookieをUnityに送信する
  GetCookie: function(parameter) {
    const data = JSON.parse(parameter);
    const objectName = data.objectName;
    const functionName = data.functionName;
    const cookie = decrypt(GetCookieValue(data.value), decryptKey);

    unityInstance.SendMessage(objectName, functionName, cookie);
  },
  //スコア送信フォームに記録する
  RankingInput: function(parameter, loaded) {
    const data = JSON.parse(parameter);
    let result = {
      allOver: 0,
      monthly: 0,
      daily: 0,
      distance: 0,
    };
    let recoded = false;
  
    input('allOver', loaded);
    input('monthly', loaded);
    input('daily', loaded);
    input('distance', loaded);
  
    if(recoded) {
      record(result, loaded);
    }
  
    function input (type) {
      const key = (type === 'distance' || loaded) ? type : 'score';
      const value = (data[key] > myScore[type]) ? Math.max(form[type].value, data[key]) : 0;
  
      if(value) {
        recoded = true;
        form[type].value = value;
        result[type] = value;
      }
    }
  }
}

//Unityからの信号を受け取る
function RecieveMessage(event) {
  const data = JSON.parse(event.detail);
  const methodName = data.methodName;
  const parameter = data.parameter;

  receiver[methodName](parameter);
}

//Cookieを読み込む
function GetCookieValue(key) {
  const cookies = document.cookie.split(';');
  const foundCookie = cookies.find(
    (cookie) => cookie.split('=')[0].trim() === key.trim()
  );
  if (foundCookie) {
    const cookieValue = decodeURIComponent(foundCookie.split('=')[1]);
    return cookieValue;
  }
  return '';
}

const form = {
  allOver: document.getElementById('allOver'),
  monthly: document.getElementById('monthly'),
  daily: document.getElementById('daily'),
  distance: document.getElementById('distance'),
};
let score = {
  allOver: 0,
  monthly: 0,
  daily: 0,
  distance: 0,
};
const myScore = form.monthly.placeholder ? {
  allOver: form.allOver.placeholder,
  monthly: form.monthly.placeholder,
  daily: form.daily.placeholder,
  distance: form.distance.placeholder,
} : {
  allOver: 0,
  monthly: 0,
  daily: 0,
  distance: 0,
};
const button = document.getElementById('submit_button');
const icon = document.getElementById('send-icon');

//記録送信時の処理
function record(result, loaded) {
  score = result;

  if(button.disabled) {
    button.disabled = false;
    icon.classList.remove('bi-send');
    icon.classList.add('bi-send-check-fill');
  }

  if(!loaded) {
    const json = JSON.stringify(result);
    const value = encrypt(json, decryptKey);
    document.cookie = `myscore=${value}; max-age=${15 * 60}`;
  }
}

//一時保存中のスコアを読み込み
function scoreLoad() {
  const cookie = decrypt(GetCookieValue('myscore'), decryptKey);
  if(cookie) {
    receiver.RankingInput(cookie, true);
  }
}

//外部からフォームの内容変更を検知して復元
const changeDetecter = (id) => {
  form[id].addEventListener("input", function() {
    const value = (score[id] || '');
    if(form[id].value !== value) {
      form[id].value = value;
    }
  });
};
changeDetecter('allOver');
changeDetecter('monthly');
changeDetecter('daily');
changeDetecter('distance');

//未ログイン時に送信ボタンを無効表示にする
window.addEventListener('DOMContentLoaded', function() {
  if(!form.monthly.placeholder) {
    button.classList.remove('btn-success');
    button.classList.add('btn-secondary');
    icon.classList.remove('bi-send');
    icon.classList.add('bi-send-slash');
  }
});

//Unityと接続
window.addEventListener('unityMessage', RecieveMessage, false);