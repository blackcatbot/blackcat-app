const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("code")) {
  fetch(`https://api.blackcatbot.tk/api/auth?code=${urlParams.get("code")}`)
    .then(res => {
      res.json();
    })
    .then(json => {
      window.opener.postMessage({
        token: json.token
      }, window.opener.location);
    });
} else {
  window.location.href = "https://discord.com/api/oauth2/authorize?client_id=848006097197334568&redirect_uri=https%3A%2F%2Fapp.blackcatbot.tk%2Fcallback%2F&response_type=code&scope=identify%20guilds&prompt=none"
}