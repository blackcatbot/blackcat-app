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