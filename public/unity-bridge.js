let decryptKey = '';

function SetKey(parameter) {
  decryptKey = parameter;
}

function SetCookie(parameter) {
  const data = JSON.parse(parameter);
  const cookieID = data.cookieID;
  const value = encrypt(data.value, decryptKey);
  const maxAge = 366 * 86400;

  document.cookie = `${cookieID}=${value}; max-age=${maxAge}`;
}

function GetCookie(parameter) {
  const data = JSON.parse(parameter);
  const objectName = data.objectName;
  const functionName = data.functionName;
  const cookie = decrypt(GetCookieValue(data.value), decryptKey);

  unityInstance.SendMessage(objectName, functionName, cookie);
}

function RecieveMessage(event) {
  const data = JSON.parse(event.detail);
  const methodName = data.methodName;
  const parameter = data.parameter;

  eval(`${methodName}(parameter)`);
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

function RankingInput(parameter) {
  const data = JSON.parse(parameter);
  const myScore = getMyScore();
  const form = {
    allOver: document.getElementById("allOver"),
    monthly: document.getElementById("monthly"),
    daily: document.getElementById("daily"),
    distance: document.getElementById("distance"),
  };

  if(myScore) {
    input('allOver');
    input('monthly');
    input('daily');
    input('distance');

    buttonActive();
  }

  function input (type) {
    const key = type === 'distance' ? 'distance' : 'score';
    form[type].value = (data[key] > myScore[type]) ? Math.max(form[type].value, data[key]) : form[type].value;
  }
}

// unityMessageというCustomEventを受け取る
window.addEventListener('unityMessage', RecieveMessage, false);