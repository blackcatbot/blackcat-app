let schema = new URLSearchParams(window.location.search);
let request = (url) => {
  return new Promise((reslove, reject) => {
    fetch(url, {
      mode: "cors",
      "Access-Control-Allow-Origin": "*"
    })
      .then(reslove)
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
  document.getElementById("guildInput").addEventListener("keyup", guildHandelEnter)
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
    }, 800);
  }
}

if (!schema.has("guild")) {
  queryGuild();
}