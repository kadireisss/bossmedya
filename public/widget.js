// /public/widget.js
(function () {
  var API_URL = "https://bossmedya.vercel.app/api/track";

  function createBox() {
    var box = document.createElement("div");
    box.id = "bossmedyaOnlineBox";
    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.background = "#111827";
    box.style.color = "#f9fafb";
    box.style.padding = "10px 14px";
    box.style.borderRadius = "12px";
    box.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, Arial";
    box.style.fontSize = "13px";
    box.style.fontWeight = "600";
    box.style.boxShadow = "0 8px 24px rgba(0,0,0,0.45)";
    box.style.zIndex = "999999";
    box.innerHTML = "Online: <strong>...</strong>";
    document.body.appendChild(box);
    return box;
  }

  function update(box) {
    var params = new URLSearchParams({
      page: window.location.pathname,
      ref: document.referrer || ""
    });

    fetch(API_URL + "?" + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || typeof d.online === "undefined") return;
        box.innerHTML = "Online: <strong>" + d.online + "</strong>";
      })
      .catch(function () { /* sessiz geç */ });
  }

  function init() {
    var box = createBox();
    update(box);
    setInterval(function () { update(box); }, 5000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 0);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
