let decryptKey = '';

const encrypt = (src, key) => CryptoJS.AES.encrypt(src, key);

const decrypt = (des, key) => {
  const decrypted = CryptoJS.AES.decrypt(des, key);
  const utf8 = decrypted.toString(CryptoJS.enc.Utf8);
  return utf8;
};

const receiver = {
  SetKey: function(parameter) {
    decryptKey = parameter;
    scoreLoad();
  },
  SetCookie: function(parameter) {
    const data = JSON.parse(parameter);
    const cookieID = data.cookieID;
    const value = encrypt(data.value, decryptKey);
    const maxAge = 366 * 86400;

    document.cookie = `${cookieID}=${value}; max-age=${maxAge}`;
  },
  GetCookie: function(parameter) {
    const data = JSON.parse(parameter);
    const objectName = data.objectName;
    const functionName = data.functionName;
    const cookie = decrypt(GetCookieValue(data.value), decryptKey);

    unityInstance.SendMessage(objectName, functionName, cookie);
  },
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

function RecieveMessage(event) {
  const data = JSON.parse(event.detail);
  const methodName = data.methodName;
  const parameter = data.parameter;

  receiver[methodName](parameter);
}

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

function scoreLoad() {
  const cookie = decrypt(GetCookieValue('myscore'), decryptKey);
  if(cookie) {
    receiver.RankingInput(cookie, true);
  }
}

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

window.addEventListener('DOMContentLoaded', function() {
  if(!form.monthly.placeholder) {
    button.classList.remove('btn-success');
    button.classList.add('btn-secondary');
    icon.classList.remove('bi-send');
    icon.classList.add('bi-send-slash');
  }
});

window.addEventListener('unityMessage', RecieveMessage, false);