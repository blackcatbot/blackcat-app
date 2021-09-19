let schema = new URLSearchParams(window.location.search), socket, interval;
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
  });
  let wsOpen = () => {
    document.getElementById("connectContainer").classList.add("hide");
    document.getElementById("connect").classList.remove("open");
    setTimeout(() => {
      document.getElementById("connect").style.display = "none";
      document.getElementById("connectContainer").classList.remove("hide");
    }, 800);
    try {
      socket.send(JSON.stringify({
        server: schema.get("guild")
      }));
    } catch (e) {
      console.error(e);
    }
  }
  let wsMessage = () => {
    
  }
  socket = new WebSocket("wss://api.blackcatbot.tk/api/ws/playing");
  socket.addEventListener("open", wsOpen);
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
  if (!document.getElementById("guildInput").value) {
    document.getElementById("guildForm").classList.add("shake")
    setTimeout(() => {
      document.getElementById("guildForm").classList.remove("shake")
    }, 500);
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
    }, 800);
  }
}

if (!schema.has("guild")) {
  queryGuild();
} else {
  connect();
}