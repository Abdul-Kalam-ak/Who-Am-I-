/* AK mascot — wanders along the bottom of the page, stops to wave, talks when clicked.
   Put ak-walk.png and ak-wave.png in the same folder as this file. */
(function () {
  var base = document.currentScript.src.replace(/[^/]*$/, '');
  var SPEED = 70;                       // px per second
  var LINES = [
    "Hey, I'm AK.",
    "Building something? Let's talk.",
    "I get bored when things stay as ideas.",
    "Ask me about WE FOR US.",
    "Yes. I really like Spider-Man."
  ];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '#ak-m{position:fixed;left:0;bottom:0;z-index:9999;height:clamp(110px,18vh,170px);aspect-ratio:328/520;pointer-events:none;will-change:transform}' +
    '#ak-m .f{position:absolute;bottom:0;left:0;right:0;margin:0 auto;height:100%;width:auto;pointer-events:auto;cursor:pointer;user-select:none;-webkit-user-drag:none;transform-origin:50% 100%}' +
    '#ak-m.left .f{transform:scaleX(-1)}' +
    '#ak-m.walk .f{animation:akbob .5s ease-in-out infinite}' +
    '#ak-m .b{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:6px;white-space:nowrap;' +
      'background:#fff;color:#111;font:600 14px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:12px;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;pointer-events:none}' +
    '#ak-m .b.on{opacity:1}' +
    '@keyframes akbob{0%,100%{translate:0 0;rotate:-1.5deg}50%{translate:0 -6px;rotate:1.5deg}}';
  document.head.appendChild(css);

  var root = document.createElement('div');
  root.id = 'ak-m';
  root.setAttribute('aria-hidden', 'true');
  var walk = new Image(), wave = new Image();
  walk.src = base + 'ak-walk.png'; wave.src = base + 'ak-wave.png';
  [walk, wave].forEach(function (i) { i.className = 'f'; i.draggable = false; });
  var bubble = document.createElement('div'); bubble.className = 'b';
  root.appendChild(walk); root.appendChild(wave); root.appendChild(bubble);
  document.body.appendChild(root);

  var x = 40, target = x, mode = 'wave', timer, last = 0, bubbleTimer;
  function show(which) { walk.style.display = which === 'walk' ? '' : 'none'; wave.style.display = which === 'wave' ? '' : 'none'; }
  function width() { return root.offsetWidth || 140; }
  function maxX() { return Math.max(0, innerWidth - width()); }
  function place() { root.style.transform = 'translateX(' + x + 'px)'; }

  function stand(ms) {
    mode = 'wave'; show('wave'); root.classList.remove('walk');
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(go, ms || 2500);
  }
  function go() {
    var m = maxX();
    target = Math.random() * m;
    if (Math.abs(target - x) < 120) target = x < m / 2 ? Math.min(m, x + 300) : Math.max(0, x - 300);
    mode = 'walk'; show('walk');
    root.classList.add('walk');
    root.classList.toggle('left', target < x);
  }
  function tick(t) {
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (mode === 'walk') {
      var dir = target > x ? 1 : -1;
      x += dir * SPEED * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) { x = target; root.classList.remove('left'); stand(2200 + Math.random() * 2500); }
      place();
    }
    requestAnimationFrame(tick);
  }
  function say() {
    bubble.textContent = LINES[Math.floor(Math.random() * LINES.length)];
    bubble.classList.add('on');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove('on'); }, 2600);
    root.classList.remove('left');
    stand(3200);
  }
  walk.addEventListener('click', say); wave.addEventListener('click', say);
  addEventListener('resize', function () { x = Math.min(x, maxX()); place(); });

  place(); show('wave');
  setTimeout(function () { bubble.textContent = "Hey, I'm AK."; bubble.classList.add('on'); setTimeout(function () { bubble.classList.remove('on'); }, 2400); }, 600);
  if (!reduce) { timer = setTimeout(go, 3200); requestAnimationFrame(tick); }
})();
