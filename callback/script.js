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
}