(function () {
  var grid = document.getElementById('app-grid');
  var countEl = document.getElementById('app-count');
  var state = document.getElementById('state');

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function card(app, index) {
    var tags = (app.tags || [])
      .map(function (tag) {
        return '<span class="chip">' + esc(tag) + '</span>';
      })
      .join('');
    var delay = Math.min(index * 70, 420);

    return (
      '<a class="card" href="app.html?app=' +
      encodeURIComponent(app.slug) +
      '" style="animation-delay:' +
      delay +
      'ms">' +
      '<div class="card-cover"><img src="' +
      esc(app.cover) +
      '" alt="' +
      esc(app.name) +
      ' 封面" loading="' +
      (index < 3 ? 'eager' : 'lazy') +
      '"></div>' +
      '<div class="card-body">' +
      '<div class="card-title"><h3>' +
      esc(app.name) +
      '</h3><span class="card-ver">v' +
      esc(app.version) +
      '</span></div>' +
      '<p class="card-tagline">' +
      esc(app.tagline) +
      '</p>' +
      '<div class="card-meta">' +
      tags +
      '</div>' +
      '</div></a>'
    );
  }

  fetch('data/apps.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (apps) {
      countEl.textContent = apps.length + ' 个应用';

      if (!apps.length) {
        state.hidden = false;
        state.textContent = '还没有发布应用。';
        return;
      }

      grid.innerHTML = apps
        .map(function (app, index) {
          return card(app, index);
        })
        .join('');
    })
    .catch(function (err) {
      console.error(err);
      state.hidden = false;
      state.textContent = '应用列表加载失败，请刷新页面重试。';
    });
})();
