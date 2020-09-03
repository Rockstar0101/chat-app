
const socket = new WebSocket('wss://localhost:2222/')
const wsStatus = document.getElementById('wsLogs');
const userName = document.getElementById('userName');
const inpName = document.getElementById('inpName');
const subName = document.getElementById('subName');
const inpMsg = document.getElementById('inpMsg');
const subMsg = document.getElementById('subMsg');
const errMsg = document.getElementById('errMsg');
const nameForm = document.getElementById('nameForm');
const msgForm = document.getElementById('msgForm');

const publicVapidkey = 'BEX8fF9G1XkLjhTgDApy1UHIerMKBzXbz8trR89KhsHoMLTt3VXVO53JiIH44ok_JJIGoZFkgktlGyGHsQ0M6ZQ'

//Check User
checkCookie()

//Set Name
subName.onclick = () => {
    if(!inpName.value) return errMsg.innerHTML = "*Please Enter a Username!";
    errMsg.innerHTML = "&nbsp;";
    setCookie('wsuser', inpName.value, 30)
    checkCookie()
    let utterance = new SpeechSynthesisUtterance(`Hello Mr. ${inpName.value}`);
    speechSynthesis.speak(utterance);
}

socket.addEventListener('open' , e => {
    // socket.send('Hello Server!')
})

// every 100ms examine the socket and send more data only if all the existing data was sent out
// setInterval(() => {
//     if (socket.bufferedAmount == 0) {
//         socket.send('More Data from Client');
//     }
// }, 100);

socket.addEventListener('message', e => {
    let newLog = document.createElement('p');
    let data = JSON.parse(e.data);
    newLog.innerHTML = (`${data.msg}<span class="timestamp">${formatDate()}</span>`)
    wsStatus.appendChild(newLog);
    newLog.className = data.user == getCookie('wsuser')? "self": "msg";
    // console.log(wsStatus.clientHeight, wsStatus.scrollHeight);
    wsStatus.scrollTo(0,wsStatus.scrollHeight-wsStatus.clientHeight)
})

socket.addEventListener('error', err => {
    let newLog = document.createElement('p');
    newLog.innerHTML = (`Error: ${err.message} and Connection state: ${socket.readyState}`)
    wsStatus.appendChild(newLog);
})

// Setting a Cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Send Msg
subMsg.onclick = () => {
    if(!inpMsg.innerHTML) return errMsg.innerHTML = "*Please write a message!";
    errMsg.innerHTML = "&nbsp;";
    socket.send(JSON.stringify({user: getCookie('wsuser'), msg: stripHtml(inpMsg.innerHTML)}));
    inpMsg.innerHTML = "";
}

inpMsg.onkeypress = e => {
  // e.preventDefault();
   if(e.keyCode == 13) subMsg.click();
}

// Getting a Cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

// Checking for Cookie
function checkCookie() {
    var user = getCookie('wsuser');
    if (user != "") {
        reflectUser()
        nameForm.style.display = "none";
        msgForm.style.display = "block";
    } else {
        msgForm.style.display = "none";
        nameForm.style.display = "block";
    }
  }

// Reflect User
function reflectUser() {
    userName.innerHTML = `Mr. ${getCookie('wsuser')}`
}

// Show human readable Date
function formatDate() {
  var d = new Date(),
      // month = '' + (d.getMonth() + 1),
      // day = '' + d.getDate(),
      // year = d.getFullYear(),
      hours = '' + d.getHours(),
      minutes = '' + d.getMinutes();

      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;

  // if (month.length < 2) 
  //     month = '0' + month;
  // if (day.length < 2) 
  //     day = '0' + day;

  return strTime;
}

function stripHtml(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}


// Working on Service Workers
if('serviceWorker' in navigator) {
  send().catch(err => console.log(err));
}

// Register SW, Register Push, Send Push
async function send() {
  console.log('Registering Service Worker...')
  const register = navigator.serviceWorker.register('/serviceworker.js', {
      scope: '/'
  })
  console.log("Service Worker Registered...")

  // Register Push
  console.log('Registering Push...')
  const subscription = await (await register).pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidkey)
  })
  console.log('Push Registered...')

  // Send Push Notifications
  console.log('Sending Push Notifications...');
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({subscription}),
    headers: {
      'content-type': 'application/json'
    }
  })
  console.log('Push Notifications Sent...');

}


// Data-type Converter 
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
