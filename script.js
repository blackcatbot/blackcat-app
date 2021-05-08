const urlParams = new URLSearchParams(window.location.search);
let current;
let errCount = 0;
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
 */
function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
};
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
    window.location = `https://app.blackcatbot.tk/?server=${getCookie("server")}`;
    deleteCookie("server");
  }
};



if (getCookie("token")) {
  document.getElementById("user-username").innerHTML = "正在登入...";
  fetch('https://api.blackcatbot.tk/api/auth/info?token=' + getCookie("token"), { mode: "cors", "Access-Control-Allow-Origin": "*" }).then(res => res.json()).then(userJson => {
    document.getElementById("user-avatar").src = `https://cdn.discordapp.com/avatars/${userJson.id}/${userJson.avatar}`;
    document.getElementById("user-username").innerHTML = userJson.username;
  });
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
  if (urlParams.has("server")) document.cookie = `server=${urlParams.get("server")}`;
  document.location.href = "https://discord.com/api/oauth2/authorize?client_id=718469951958286397&redirect_uri=https%3A%2F%2Fapi.blackcatbot.tk%2Fapi%2Fauth%2Flogin&response_type=code&scope=identify%20guilds";
};
document.getElementById("logout").onclick = function () {
  deleteCookie("token");
  window.location.reload();
};