(function () {
  const API = "/api/track";

  function start() {
    function ping() {
      const params = new URLSearchParams({
        page: location.pathname,
        ref: document.referrer
      });

      fetch(`${API}?${params}`).catch(() => {});
    }
    ping();
    setInterval(ping, 5000);
  }

  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
