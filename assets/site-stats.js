(function () {
  var API = "/api/stats";

  function post(action) {
    return fetch(API + "?action=" + encodeURIComponent(action), {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function read() {
    return fetch(API + "?action=read", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }

  function paint(data) {
    var panel = document.getElementById("site-stats-panel");
    if (!panel || !data) return;
    ["todayViews", "todayClicks", "totalViews"].forEach(function (k) {
      var el = panel.querySelector('[data-k="' + k + '"]');
      if (el && data[k] != null) el.textContent = Number(data[k]).toLocaleString("zh-CN");
    });
  }

  var viewKey = "zz_view_" + location.pathname;
  var p = sessionStorage.getItem(viewKey)
    ? read()
    : post("hit").then(function (d) {
        sessionStorage.setItem(viewKey, "1");
        return d;
      });
  p.then(paint);

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a,button") : null;
      if (!a) return;
      // don't count the guestbook submit as "nav click" separately if needed — still fine
      post("click").then(paint);
    },
    true
  );
})();
