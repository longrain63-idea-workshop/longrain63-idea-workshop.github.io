(function () {
  var $ = function (selector) {
    return document.querySelector(selector);
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fetchText(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
      return res.text();
    });
  }

  var slug = new URLSearchParams(location.search).get('app');
  var notfound = $('#notfound');
  var previews = [];
  var lbIndex = 0;
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');

  function showLightbox(index) {
    lbIndex = (index + previews.length) % previews.length;
    lbImg.src = previews[lbIndex];
    lbImg.alt = '预览图 ' + (lbIndex + 1);
  }

  function openLightbox(index) {
    showLightbox(index);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  function bindLightbox(app) {
    $('#app-previews').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-index]');
      if (!button) return;
      openLightbox(Number(button.dataset.index));
    });

    $('#lb-close').addEventListener('click', closeLightbox);
    $('#lb-prev').addEventListener('click', function () {
      showLightbox(lbIndex - 1);
    });
    $('#lb-next').addEventListener('click', function () {
      showLightbox(lbIndex + 1);
    });
    lb.addEventListener('click', function (event) {
      if (event.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (lb.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showLightbox(lbIndex - 1);
      if (event.key === 'ArrowRight') showLightbox(lbIndex + 1);
    });

    if (previews.length < 2) {
      $('#lb-prev').hidden = true;
      $('#lb-next').hidden = true;
    }
  }

  function renderMeta(app) {
    var pills = [];
    if (app.version) {
      pills.push('<span class="meta-pill">版本 <b>v' + esc(app.version) + '</b></span>');
    }
    if (app.updated) {
      pills.push('<span class="meta-pill">更新于 <b>' + esc(app.updated) + '</b></span>');
    }
    (app.tags || []).forEach(function (tag) {
      pills.push('<span class="chip">' + esc(tag) + '</span>');
    });
    $('#app-meta').innerHTML = pills.join('');
  }

  function renderProse(sectionId, target, path) {
    var section = $('#' + sectionId);
    if (!path) {
      section.hidden = true;
      return Promise.resolve();
    }
    return fetchText(path)
      .then(function (markdown) {
        $(target).innerHTML = marked.parse(markdown);
      })
      .catch(function (err) {
        console.warn(err);
        section.hidden = true;
      });
  }

  function renderPreviews(app) {
    previews = app.previews || [];
    if (!previews.length) {
      $('#previews').hidden = true;
      return;
    }
    $('#app-previews').innerHTML = previews
      .map(function (src, index) {
        return (
          '<button type="button" data-index="' +
          index +
          '" aria-label="查看第 ' +
          (index + 1) +
          ' 张预览图"><img src="' +
          esc(src) +
          '" alt="' +
          esc(app.name) +
          ' 预览图 ' +
          (index + 1) +
          '" loading="lazy"></button>'
        );
      })
      .join('');
    bindLightbox(app);
  }

  function renderDownloads(app) {
    var downloads = app.downloads || [];
    var netdisks = app.netdisks || [];

    if (downloads.length) {
      $('#app-downloads').innerHTML = downloads
        .map(function (item) {
          return (
            '<li class="dl-item"><div class="dl-info"><span class="dl-label">' +
            esc(item.label) +
            '</span>' +
            (item.size ? '<span class="dl-size">' + esc(item.size) + '</span>' : '') +
            '</div><a class="btn btn-sm btn-primary" href="' +
            esc(item.url) +
            '" target="_blank" rel="noopener">下载</a></li>'
          );
        })
        .join('');
    } else {
      $('#panel-direct').hidden = true;
    }

    if (netdisks.length) {
      $('#app-netdisks').innerHTML = netdisks
        .map(function (item) {
          return (
            '<li class="dl-item"><div class="dl-info"><span class="dl-label">' +
            esc(item.label) +
            '</span>' +
            (item.code
              ? '<span class="code">提取码 <b>' +
                esc(item.code) +
                '</b><button type="button" class="copy-btn" data-code="' +
                esc(item.code) +
                '">复制</button></span>'
              : '') +
            '</div><a class="btn btn-sm" href="' +
            esc(item.url) +
            '" target="_blank" rel="noopener">打开</a></li>'
          );
        })
        .join('');
    } else {
      $('#panel-netdisk').hidden = true;
    }

    if (!downloads.length && !netdisks.length) {
      $('#downloads').hidden = true;
    }
  }

  function bindCopy() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('.copy-btn');
      if (!button) return;
      var text = button.dataset.code || '';

      var done = function () {
        button.textContent = '已复制';
        button.classList.add('copied');
        setTimeout(function () {
          button.textContent = '复制';
          button.classList.remove('copied');
        }, 1600);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text);
          done();
        });
      } else {
        fallbackCopy(text);
        done();
      }
    });

    function fallbackCopy(text) {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.warn(err);
      }
      area.remove();
    }
  }

  function bindToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));

    links.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section && section.hidden) link.remove();
    });

    var sections = links
      .filter(function (link) {
        return link.isConnected;
      })
      .map(function (link) {
        return document.querySelector(link.getAttribute('href'));
      });

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function main() {
    fetch('data/apps.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (apps) {
        var app = slug
          ? apps.filter(function (item) {
              return item.slug === slug;
            })[0]
          : null;

        if (!app) {
          notfound.hidden = false;
          return;
        }

        document.title = app.name + ' · 创意工坊';
        $('meta[name="description"]').setAttribute('content', app.tagline || app.name);

        $('#app-name').textContent = app.name;
        $('#app-tagline').textContent = app.tagline || '';
        $('#app-cover').src = app.cover;
        $('#app-cover').alt = app.name + ' 封面';
        renderMeta(app);
        renderPreviews(app);
        renderDownloads(app);

        return Promise.all([
          renderProse('intro', '#app-intro', app.intro),
          renderProse('manual', '#app-manual', app.manual)
        ]).then(function () {
          bindToc();
          $('#app-page').hidden = false;
        });
      });
  }

  bindCopy();
  main().catch(function (err) {
    console.error(err);
    notfound.hidden = false;
    notfound.querySelector('h2').textContent = '内容加载失败';
    notfound.querySelector('p').innerHTML =
      '请检查网络后刷新页面，或<a href="index.html">返回全部应用</a>。';
  });
})();
