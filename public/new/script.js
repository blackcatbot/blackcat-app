let schema = new URLSearchParams(window.location.search), socket, interval, image;
let playIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>'
let pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>'
let request = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    })
      .then(resolve)
      .catch(reject);
  });
}
let getCookie = (cname) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}
let delCookie = (cname) => {
  document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
let setCookie = (cname, value) => {
  document.cookie = `${encodeURIComponent(cname)}=${encodeURIComponent(value)}; path=/;`
}
let shake = (name, focus) => {
  document.getElementById(name).classList.add("shake");
  document.getElementById(focus ?? name).focus();
  setTimeout(() => {
    document.getElementById(name).classList.remove("shake");
  }, 500);
}
let queryGuild = () => {
  document.getElementById("guildInput").value = "";
  document.getElementById("guildContainer").classList.add("hide");
  document.getElementById("guild").style.display = "block";
  setTimeout(() => {
    document.getElementById("guild").classList.add("open");
    document.getElementById("guildContainer").classList.remove("hide");
  }, 100);
  function guildHandelEnter (key) {
    if (key.keyCode === 13) {
      if (!document.getElementById("guildInput").value) {
        document.getElementById("guildForm").classList.add("shake")
        setTimeout(() => {
          document.getElementById("guildForm").classList.remove("shake")
        }, 500);
      } else {
        document.getElementById("guildInput").removeEventListener("keyup", guildHandelEnter);
        key.preventDefault();
        document.getElementById("guildSubmit").onclick();
      }
    }
  }
  document.getElementById("guildInput").addEventListener("keyup", guildHandelEnter);
}
let connect = () => {
  document.getElementById("connectContainer").classList.add("hide");
  document.getElementById("connect").style.display = "block";
  setTimeout(() => {
    document.getElementById("connect").classList.add("open");
    document.getElementById("connectContainer").classList.remove("hide");
  }, 100);
  let wsOpen = () => {
    document.getElementById("connectContainer").classList.add("hide");
    document.getElementById("connect").classList.remove("open");
    setTimeout(() => {
      document.getElementById("connect").style.display = "none";
      document.getElementById("connectContainer").classList.remove("hide");
    }, 100);
    interval = setInterval(() => {
      try {
        socket.send(JSON.stringify({
          server: schema.get("guild")
        }));
      } catch (e) {
        console.error(e);
      }
    }, 1000);
  }
  let wsMessage = (event) => {
    let data = JSON.parse(event.data);
    if (data.playing) {
      if (data.total <= 0 || data.total === null) {
        let sec = Math.floor(data.now % 60);
        let min = Math.floor((data.now - sec) / 60);
        document.getElementById("songTime").innerHTML = `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
        if (document.getElementById("songProgress").classList.contains("mdui-progress-determinate")) {
          document.getElementById("songProgress").classList.remove("mdui-progress-determinate");
          document.getElementById("songProgress").classList.add("mdui-progress-indeterminate");
        }
        document.getElementById("songProgress").style.width = "";
      } else {
        let nowSec = Math.floor(data.now % 60);
        let nowMin = Math.floor((data.now - nowSec) / 60);
        let totalSec = Math.floor(data.total % 60);
        let totalMin = Math.floor((data.total - totalSec) / 60);
        document.getElementById("songTime").innerHTML = `${nowMin < 10 ? "0" + nowMin : nowMin}:${nowSec < 10 ? "0" + nowSec : nowSec}/${totalMin < 10 ? "0" + totalMin : totalMin}:${totalSec < 10 ? "0" + totalSec : totalSec}`;
        if (document.getElementById("songProgress").classList.contains("mdui-progress-indeterminate")) {
          document.getElementById("songProgress").classList.remove("mdui-progress-indeterminate");
          document.getElementById("songProgress").classList.add("mdui-progress-determinate");
        }
        document.getElementById("songProgress").style.width = `${(data.now / data.total) * 100}%`;
      }
      document.title = `Black cat | ?????????: ${data.title}`;
      document.getElementById("songTitle").innerText = data.title;
      document.getElementById("songServer").innerText = `???${data.name}????????????`
      if (image !== data.thumbnail) {
        document.getElementById("songImage").src = data.thumbnail;
        image = data.thumbnail;
      }
    } else if (typeof data.exist !== "undefined" && !data.exist) {
      clearInterval(interval);
      interval = undefined;
      if (document.getElementById("songProgress").classList.contains("mdui-progress-determinate")) {
        document.getElementById("songProgress").classList.remove("mdui-progress-determinate");
        document.getElementById("songProgress").classList.add("mdui-progress-indeterminate");
        document.getElementById("songProgress").style.width = "";
      }
      document.getElementById("songTime").innerHTML = "--:--";
      document.getElementById("songTitle").innerText = "??????????????????";
      document.getElementById("songServer").innerText = "?????????????????????????????????????????????????????????";
      document.getElementById("songImage").src = "../unknown.png";
      document.title = "Black cat | ??????????????????";
    } else {
      if (document.getElementById("songProgress").classList.contains("mdui-progress-determinate")) {
        document.getElementById("songProgress").classList.remove("mdui-progress-determinate");
        document.getElementById("songProgress").classList.add("mdui-progress-indeterminate");
        document.getElementById("songProgress").style.width = "";
      }
      document.getElementById("songTime").innerHTML = "--:--";
      document.getElementById("songTitle").innerText = "????????????????????????";
      document.getElementById("songServer").innerText = "????????????????????????????????????";
      document.getElementById("songImage").src = "../unknown.png";
      document.title = "Black cat | ????????????????????????";
    }
  }
  let wsClose = () => {
    console.log("WebSocket Disconnected");
    mdui.snackbar("WebSocket Disconnected");
  }
  socket = new WebSocket("wss://api.blackcatbot.tk/api/ws/playing");
  socket.addEventListener("open", wsOpen);
  socket.addEventListener("message", wsMessage);
  socket.addEventListener("close", wsClose);
}
if (getCookie("dark") === "1") document.body.classList.add("mdui-theme-layout-dark")
document.getElementById("theme").onclick = () => {
  document.body.classList.toggle("mdui-theme-layout-dark");
  if (document.body.classList.contains("mdui-theme-layout-dark")) setCookie("dark", "1");
  else setCookie("dark", "0");
}
document.getElementById("drawerQuery").onclick = () => {
  queryGuild();
}
document.getElementById("guildSubmit").onclick = () => {
  let guildId = document.getElementById("guildInput").value;
  if (!guildId) {
    shake("guildForm", "guildInput");
  } else if (isNaN(guildId) || guildId.length < 17 || guildId.length > 18) {
    shake("guildForm", "guildInput");
  } else {
    schema.set("guild", document.getElementById("guildInput").value);
    let refresh = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${schema}`;
    window.history.pushState({
      path: refresh
    }, '', refresh);
    document.getElementById("guildContainer").classList.add("hide");
    document.getElementById("guild").classList.remove("open");
    setTimeout(() => {
      document.getElementById("guild").style.display = "none";
      document.getElementById("guildContainer").classList.remove("hide");
      setTimeout(() => {
        connect();
      }, 100);
    }, 100);
  }
}
document.getElementById("drawerLogin").onclick = () => {
  if (getCookie("token")) {
    document.getElementById("drawerLoginText").innerHTML = "??????";
    deleteCookie("token");
  } else {
    document.getElementById("drawerLoginText").innerHTML = "??????";
    document.getElementById("loginContainer").classList.add("hide");
    document.getElementById("login").style.display = "block";
    setTimeout(() => {
      document.getElementById("login").classList.add("open");
      document.getElementById("loginContainer").classList.remove("hide");
    });
    let windowArea = {
      width: Math.floor(window.outerWidth * 0.8),
      height: Math.floor(window.outerHeight * 0.5),
    };
    if (windowArea.width < 1000) {
      windowArea.width = 1000;
    }
    if (windowArea.height < 630) {
      windowArea.height = 630;
    }
    windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
    windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 8));
    const windowOpts = `toolbar=0,scrollbars=1,status=0,resizable=1,location=0,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`;
    let openWindow = window.open("https://discord.com/api/oauth2/authorize?client_id=848006097197334568&redirect_uri=https%3A%2F%2Fapp.blackcatbot.tk%2Fcallback%2F&response_type=code&scope=identify%20guilds", "login", windowOpts);

    let popoutMessage = (event) => {
      if (!event.data.isFromBlackcat) return;
      document.cookie = `token=${event.data.token};max-age:${60 * 60 * 12};`
      openWindow.close();
      window.removeEventListener("message", popoutMessage);
      document.getElementById("loginContainer").classList.add("hide");
      document.getElementById("login").classList.remove("open");
      setTimeout(() => {
        document.getElementById("login").style.display = "none";
        document.getElementById("loginContainer").classList.remove("hide");
      }, 100);
    }

    window.addEventListener("message", popoutMessage);
  }
}

if (!schema.has("guild")) {
  queryGuild();
} else {
  connect();
}
if (getCookie("token")) {
  document.getElementById("drawerLoginText").innerHTML = "??????";
} else {
  document.getElementById("drawerLoginText").innerHTML = "??????";
}