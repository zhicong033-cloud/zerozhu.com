(function () {
  var form = document.getElementById("guestbook-form");
  var list = document.getElementById("guestbook-list");
  var status = document.getElementById("guestbook-status");
  if (!form || !list) return;

  function fmt(iso) {
    try {
      return new Date(iso).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    } catch (e) {
      return iso;
    }
  }

  function render(messages) {
    if (!messages || !messages.length) {
      list.innerHTML = '<p class="guestbook-empty">还没有留言，来做第一条吧。</p>';
      return;
    }
    list.innerHTML = messages
      .map(function (m) {
        var contact = m.contact
          ? '<div class="gb-contact">' + escapeHtml(m.contact) + "</div>"
          : "";
        return (
          '<article class="gb-item">' +
          '<div class="gb-meta"><strong>' +
          escapeHtml(m.name || "访客") +
          "</strong><time>" +
          escapeHtml(fmt(m.createdAt)) +
          "</time></div>" +
          '<p class="gb-body">' +
          escapeHtml(m.message) +
          "</p>" +
          contact +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(text, ok) {
    if (!status) return;
    status.textContent = text || "";
    status.dataset.state = ok ? "ok" : "err";
  }

  fetch("/api/guestbook")
    .then(function (r) { return r.json(); })
    .then(function (d) { render(d.messages || []); })
    .catch(function () { setStatus("留言加载失败，稍后再试", false); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var payload = {
      name: fd.get("name"),
      contact: fd.get("contact"),
      message: fd.get("message"),
    };
    setStatus("提交中…", true);
    fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) {
          setStatus(res.d.error || "提交失败", false);
          return;
        }
        form.reset();
        setStatus("已发布，谢谢留言！", true);
        render(res.d.messages || []);
      })
      .catch(function () { setStatus("网络异常，请稍后再试", false); });
  });
})();
