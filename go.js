/* Pagina ponte annunci -> Amazon.
   Legge window.GO = { host, path } e i parametri del link (tag Attribution),
   prova ad aprire l'app Amazon dai browser interni dei social, altrimenti va al sito.
   Prova senza redirect: aggiungere godebug=1 al link. */
(function () {
  var cfg = window.GO || {};
  var host = cfg.host || 'www.amazon.com';
  var path = cfg.path || '/';

  var params = new URLSearchParams(location.search);
  var debug = params.has('godebug');
  params.delete('godebug');
  var qs = params.toString();
  var tail = host + path + (qs ? (path.indexOf('?') >= 0 ? '&' : '?') + qs : '');

  var web = 'https://' + tail;
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var inApp = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|musical_ly|TikTok|BytedanceWebview/i.test(ua);

  var deep = null;
  if (isAndroid) {
    deep = 'intent://' + tail + '#Intent;scheme=https;package=com.amazon.mShop.android.shopping;' +
           'S.browser_fallback_url=' + encodeURIComponent(web) + ';end';
  } else if (isIOS && inApp) {
    deep = 'com.amazon.mobile.shopping.web://' + tail;
  }

  function wire() {
    var a = document.getElementById('open-app');
    var w = document.getElementById('open-web');
    if (w) w.href = web;
    if (a) { if (deep) { a.href = deep; } else { a.href = web; } }
    if (debug) {
      var d = document.getElementById('debug');
      if (d) {
        d.style.display = 'block';
        d.textContent = 'UA: ' + ua + '\n\nANDROID: ' + isAndroid + '  IOS: ' + isIOS + '  IN-APP: ' + inApp +
                        '\n\nAPP: ' + deep + '\n\nWEB: ' + web;
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();

  if (debug) return;
  if (!deep) { location.replace(web); return; }

  var timer = setTimeout(function () {
    if (!document.hidden) location.replace(web);
  }, isAndroid ? 2000 : 2500);
  function cancel() { clearTimeout(timer); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancel(); });
  window.addEventListener('pagehide', cancel);
  window.addEventListener('blur', cancel);

  location.href = deep;
})();
