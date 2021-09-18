const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("code")) {
  fetch(`https://api.blackcatbot.tk/api/auth/login?code=${urlParams.get("code")}`)
    .then(res => res.json())
    .then(json => {
      window.opener.postMessage({
        token: json.token,
        isFromBlackcat: true
      }, "https://app.blackcatbot.tk");
    })
    .catch(error => {
      console.error(error);
      document.getElementById("progress").style.display = "none";
      document.getElementById("title").innerText = "請重新登入或檢查網路連接";
    });
} else {
  document.getElementById("progress").style.display = "none";
  document.getElementById("title").innerText = "請重新驗證";
}
