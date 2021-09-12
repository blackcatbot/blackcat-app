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
if (getCookie("dark") === "1") document.body.classList.add("mdui-theme-layout-dark")
document.getElementById("theme").onclick = () => {
  document.body.classList.toggle("mdui-theme-layout-dark");
  if (document.body.classList.contains("mdui-theme-layout-dark")) setCookie("dark", "1");
  else setCookie("dark", "0");
}