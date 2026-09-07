(function () {
  var API = "/api/stats";
  var root = document.createElement("aside");
  root.className = "site-stats";
  root.setAttribute("aria-label", "网站访问数据");
  root.innerHTML =
    '<div class="site-stats-title">今日</div>' +
    '<div class="site-stats-row"><span>浏览</span><strong data-k="todayViews">—</strong></div>' +
    '<div class="site-stats-row"><span>点击</span><strong data-k="todayClicks">—</strong></div>' +
    '<div class="site-stats-divider"></div>' +
    '<div class="site-stats-row muted"><span>累计浏览</span><strong data-k="totalViews">—</strong></div>';
  document.body.appendChild(root);

  function paint(data) {
    if (!data) return;
    ["todayViews", "todayClicks", "totalViews"].forEach(function (k) {
      var el = root.querySelector('[data-k="' + k + '"]');
      if (el && data[k] != null) el.textContent = Number(data[k]).toLocaleString("zh-CN");
    });
  }

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

  var viewKey = "zz_view_" + location.pathname;
  var p = sessionStorage.getItem(viewKey)
    ? fetch(API + "?action=read")
        .then(function (r) { return r.json(); })
        .catch(function () { return null; })
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
      post("click").then(paint);
    },
    true
  );
})();
