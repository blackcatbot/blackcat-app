const urlParams = new URLSearchParams(window.location.search);
let current, errCount = 0, userid = null, volumeDialogOpened = false;
/**
 * Get a cookie value
 * @param {String} cname Cookie name
 * @returns Cookie Value
 */
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};
/**
 * Delete a cookie
 * @param {String} name Cookie name
 * @param {String} path Path
 * @param {String} domain Domain name
 */
function deleteCookie(name, path, domain) {
  document.cookie = name + "=" +
    ((path) ? ";path="+path:"")+
    ((domain)?";domain="+domain:"") +
    ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
}
/**
 * Toast message
 * @param {Boolean} red Toast message as red?
 * @param {String} info Toast message
 */
function toast(red, info) {
  if (red) {
    document.getElementById("toast").classList.remove("bg-primary");
    document.getElementById("toast").classList.add("bg-danger");
  } else {
    document.getElementById("toast").classList.add("bg-primary");
    document.getElementById("toast").classList.remove("bg-danger");
  }
  document.getElementById("toastInfo").innerHTML = info;
  let toast = new bootstrap.Toast(document.getElementById("toast"));
  toast.show();
}
window.onload = function () {
  if (getCookie("server")) {
    window.location = `https://app.blackcatbot.tk/music/?server=${getCookie("server")}`;
    deleteCookie("server");
  }
};
document.getElementById("serverid").style.display = "none";
document.getElementById("query").style.display = "none";
document.getElementById("query").onclick = function () {
  if (document.getElementById("serverid").value.length !== 18 || isNaN(document.getElementById("serverid").value)) {
    let dialog = new bootstrap.Modal(document.getElementById('invalidDialog'));
    dialog.show();
  } else {
    window.location.href = "https://app.blackcatbot.tk/music/?server=" + document.getElementById("serverid").value;
  }
};
document.getElementById("reload").onclick = function () {
  document.location.reload();
};
document.getElementById("thumbnail").style.display = "none";
document.getElementById("time").style.display = "none";
document.getElementById("timeT").style.display = "none";
document.getElementById("controlPanel").style.display = "none";
document.getElementById("link").href = "#";
document.getElementById("songtitle").style.color = "black";
document.title = "Black cat | 播放狀態";
document.getElementById("lyricsButton").onclick = function () {
  let dialog = new bootstrap.Modal(document.getElementById('lyricsDialog'));
  dialog.show();
  fetch("https://api.blackcatbot.tk/api/lyrics?title=" + current.title, {
    mode: "cors",
    "Access-Control-Allow-Origin": "*"
  }).then(respone => respone.json()).then(json => {
    if (json.error) {
      document.getElementById("lyricsLoading").innerHTML = "沒有找到歌詞...";
      document.getElementById("lyricsProgress").style.display = "none";
    } else {
      document.getElementById("lyricsText").innerHTML = json.lyrics.replaceAll("\n", "<br>");
      document.getElementById("lyricsLoading").innerHTML = `${current.title}的歌詞`;
      document.getElementById("lyricsProgress").style.display = "none";
    }
  }).catch(error => {
    errCount += 1;
    if (errCount >= 3) {
      document.getElementById("errorInfo").innerHTML = error;
      let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
        keyboard: false
      });
      dialog.show();
      clearInterval(sendInterval);
    }
  });
};
document.getElementById("lyricsDialog").addEventListener("hidden.bs.modal", () => {
  document.getElementById("lyricsProgress").style.display = "";
  document.getElementById("lyricsLoading").innerHTML = "正在取得歌詞...";
  document.getElementById("lyricsText").innerHTML = "";
});
if (urlParams.has("server")) {
  fetch("https://api.blackcatbot.tk/api/exist?server=" + urlParams.get("server"), {
    mode: "cors",
    "Access-Control-Allow-Origin": "*"
  }).then(respone => respone.json()).then(json => {
    current = json;
    if (json.error) {
      document.getElementById("errorInfo").innerHTML = json.code;
      let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
        keyboard: false
      });
      dialog.show();
      clearInterval(sendInterval);
    } else if (!json.exist) {
      document.getElementById("songtitle").innerHTML = "無法取得伺服器的播放狀態... 請使用Black cat提供的網址或再次確認你的伺服器ID!";
      document.getElementById("loader").style.display = "none";
      document.getElementById("thumbnail").style.display = "none";
      document.getElementById("lyricsButton").style.display = "none";
      let dialog = new bootstrap.Modal(document.getElementById('invalidDialog'));
      dialog.show();
    } else {
      document.getElementById("loader").style.display = "none";
      let ws = new WebSocket("wss://api.blackcatbot.tk/api/ws/playing");
      ws.onerror = function () {
        document.getElementById("errorInfo").innerHTML = "連線錯誤";
        let dialog = new bootstrap.Modal(document.getElementById("errorDialog"));
        dialog.show();
      }
      ws.onopen = function () {
        let interval;
        try {
          interval = setInterval(function () {
            ws.send(JSON.stringify({
              "server": urlParams.get("server")
            }));
          }, 1000);
        } catch (e) {
          document.getElementById("songtitle").innerHTML = "無法連線 :(";
          document.getElementById("loader").style.display = "none";
          document.getElementById("thumbnail").style.display = "none";
          document.getElementById("time").style.display = "none";
          document.getElementById("timeT").style.display = "none";
          document.getElementById("controlPanel").style.display = "none";
          document.getElementById("songtitle").style.color = "#ffffff";
          document.getElementById("link").href = "#";
          document.getElementById("srv").innerHTML = "Black cat";
          document.title = "Black cat | 播放狀態";
          clearInterval(interval);
        }
      }
      ws.onmessage = function (event) {
        let json;
        if (typeof event.data === "string") json = JSON.parse(event.data);
        else json = event.data;
        current = json;
        if (json.error) {
          document.getElementById("errorInfo").innerHTML = json.code;
          let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
            keyboard: false
          });
          dialog.show();
        } else if (json.playing) {
          document.getElementById("loader").style.display = "inline-block";
          document.getElementById("thumbnail").style.display = "inline-block";
          document.getElementById("controlPanel").style.display = "";
          document.getElementById("time").style.display = "";
          document.getElementById("timeT").style.display = "block";
          if (json.pause) {
            document.getElementById("controlPlay").style.display = "none";
            document.getElementById("controlPause").style.display = "";
          } else {
            document.getElementById("controlPause").style.display = "none";
            document.getElementById("controlPlay").style.display = "";
          }
          if (document.getElementById("thumbnail").src !== json.thumbnail) {
            let testImg = new Image();
            testImg.src = json.thumbnail;
            testImg.onload = function () {
              let percent, height;
              percent = testImg.width / 240;
              height = testImg.height / percent;
              document.getElementById("thumbnail").height = height;
            }
            document.getElementById("thumbnail").src = json.thumbnail;
          }
          document.getElementById("srv").innerHTML = `${json.name} 正在播放`;
          document.getElementById("songtitle").innerHTML = json.title;
          document.getElementById("link").href = json.url;
          document.title = `Black cat | 正在播放${json.title}`;
          if (json.total <= 0 || json.total === null) {
            var sec = Math.floor(json.now % 60);
            var min = Math.floor((json.now - sec) / 60);
            document.getElementById("timeT").innerHTML = `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
            document.getElementById("timeP").style.width = "100%";
          } else {
            var nowSec = Math.floor(json.now % 60);
            var nowMin = Math.floor((json.now - nowSec) / 60);
            var totalSec = Math.floor(json.total % 60);
            var totalMin = Math.floor((json.total - totalSec) / 60);
            document.getElementById("timeT").innerHTML = `${nowMin < 10 ? "0" + nowMin : nowMin}:${nowSec < 10 ? "0" + nowSec : nowSec}/${totalMin < 10 ? "0" + totalMin : totalMin}:${totalSec < 10 ? "0" + totalSec : totalSec}`;
            document.getElementById("timeP").style.width = `${(json.now / json.total) * 100}%`;
          }
          document.getElementById("volumeText").innerHTML = `目前音量: ${json.volume}%`;
          if (!volumeDialogOpened) {
            document.getElementById("setVolume").innerHTML = `設定音量至: ${json.volume}%`;
            document.getElementById("volumeRange").value = json.volume;
          }
          document.getElementById("loader").style.display = "none";
        } else {
          document.getElementById("songtitle").innerHTML = "伺服器沒有在播放音樂";
          document.getElementById("loader").style.display = "none";
          document.getElementById("thumbnail").style.display = "none";
          document.getElementById("time").style.display = "none";
          document.getElementById("timeT").style.display = "none";
          document.getElementById("controlPanel").style.display = "none";
          document.getElementById("songtitle").style.color = "#ffffff";
          document.getElementById("link").href = "#";
          document.getElementById("srv").innerHTML = "Black cat";
          document.title = "Black cat | 播放狀態";
        }
      }
    }
  }).catch(error => {
    errCount += 1;
    if (errCount >= 3) {
      document.getElementById("errorInfo").innerHTML = error;
      let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
        keyboard: false
      });
      dialog.show();
      clearInterval(sendInterval);
    }
  });
} else {
  document.getElementById("serverid").style.display = "inline-block";
  document.getElementById("query").style.display = "inline-block";
  document.getElementById("loader").style.display = "none";
  document.getElementById("thumbnail").style.display = "none";
  document.getElementById("time").style.display = "none";
  document.getElementById("timeT").style.display = "none";
  document.getElementById("controlPanel").style.display = "none";
  document.getElementById("songtitle").style.color = "#ffffff";
  document.getElementById("songtitle").innerHTML = "請輸入伺服器ID或是使用Black cat在播放時提供的網址!";
}
if (getCookie("token")) {
  document.getElementById("login-icon").style.display = "none"
  document.getElementById("user-username").innerHTML = "正在登入...";
  fetch('https://api.blackcatbot.tk/api/auth/info?token=' + getCookie("token"), {
    mode: "cors",
    "Access-Control-Allow-Origin": "*"
  }).then(res => res.json()).then(userJson => {
    document.getElementById("user-avatar").src = `https://cdn.discordapp.com/avatars/${userJson.id}/${userJson.avatar}`;
    document.getElementById("user-username").innerHTML = userJson.username;
    userid = userJson.id;
  });
} else {
  document.getElementById("user-avatar").style.display = "none";
  document.getElementById("login-icon").style.display = "";
  document.getElementById("user-username").innerHTML = "登入"
}
document.getElementById("user-container").onclick = function () {
  if (getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('logoutDialog'));
    dialog.show();
  } else {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  }
};
document.getElementById("login").onclick = function () {
  const windowArea = {
    width: Math.floor(window.outerWidth * 0.8),
    height: Math.floor(window.outerHeight * 0.5),
  };
  if (windowArea.width < 1000) { windowArea.width = 1000; }
  if (windowArea.height < 630) { windowArea.height = 630; }
  windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
  windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 8));
  const windowOpts = `toolbar=0,scrollbars=1,status=0,resizable=1,location=0,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`;
  let openWindow = window.open("https://discord.com/api/oauth2/authorize?client_id=848006097197334568&redirect_uri=https%3A%2F%2Fapp.blackcatbot.tk%2Fcallback%2F&response_type=code&scope=identify%20guilds", "login", windowOpts);

  window.addEventListener("message", event => {
    if (!event.data.isFromBlackcat) return;
    document.cookie = `token=${event.data.token};max-age:${60 * 60 * 12};`
    openWindow.close();
    location.reload();
  });
};
document.getElementById("logout").onclick = function () {
  deleteCookie("token");
  window.location.reload();
};
document.getElementById("controlVolume").onclick = function () {
  if (!getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  } else {
    let dialog = new bootstrap.Modal(document.getElementById('volumeDialog'));
    dialog.show();
    volumeDialogOpened = true;
  }
};
document.getElementById("controlPause").onclick = function () {
  if (!getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  } else {
    fetch(`https://api.blackcatbot.tk/api/pause?guild=${urlParams.get("server")}&token=${getCookie("token")}`, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    }).then(res => res.json()).then(json => {
      if (json.red) toast(true, json.message);
      else if (!json.error) toast(false, json.message);
      else {
        document.getElementById("errorInfo").innerHTML = error;
        let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
          keyboard: false
        });
        dialog.show();
      }
    }).catch(() => toast(true, "無法發送指令"));
  }
};
document.getElementById("controlPlay").onclick = function () {
  if (!getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  } else {
    fetch(`https://api.blackcatbot.tk/api/resume?guild=${urlParams.get("server")}&token=${getCookie("token")}`, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    }).then(res => res.json()).then(json => {
      if (json.red) toast(true, json.message);
      else if (!json.error) toast(false, json.message);
      else {
        document.getElementById("errorInfo").innerHTML = error;
        let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
          keyboard: false
        });
        dialog.show();
      }
    }).catch(() => toast(true, "無法發送指令"));
  }
};
document.getElementById("controlSkip").onclick = function () {
  if (!getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  } else {
    fetch(`https://api.blackcatbot.tk/api/skip?guild=${urlParams.get("server")}&token=${getCookie("token")}`, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    }).then(res => res.json()).then(json => {
      if (json.red) toast(true, json.message);
      else if (!json.error) toast(false, json.message);
      else {
        document.getElementById("errorInfo").innerHTML = error;
        let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
          keyboard: false
        });
        dialog.show();
      }
    }).catch(() => toast(true, "無法發送指令"));
  }
};
document.getElementById("controlVolume").onclick = function () {
  if (!getCookie("token")) {
    let dialog = new bootstrap.Modal(document.getElementById('loginDialog'));
    dialog.show();
  } else {
    fetch(`https://api.blackcatbot.tk/api/skip?guild=${urlParams.get("server")}&token=${getCookie("token")}`, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    }).then(res => res.json()).then(json => {
      if (json.red) toast(true, json.message);
      else if (!json.error) toast(false, json.message);
      else {
        document.getElementById("errorInfo").innerHTML = error;
        let dialog = new bootstrap.Modal(document.getElementById('errorDialog'), {
          keyboard: false
        });
        dialog.show();
      }
    }).catch(() => toast(true, "無法發送指令"));
  }
}
