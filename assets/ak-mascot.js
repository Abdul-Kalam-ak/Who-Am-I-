/* Digi AK — wanders along the bottom of the page, stops to wave,
   and comments on the section the visitor is viewing (also when clicked).
   Keep ak-walk.png and ak-wave.png in the same folder as this file. */
(function () {
  var base = document.currentScript.src.replace(/[^/]*$/, '');
  var SPEED = 70;                       // px per second
  var GREETING = "Hey, I'm Digi AK! 👋";

  // What he says per section (key = the section's class name in index.html)
  var BY_SECTION = {
    hero:               "Hey, I'm Digi AK! Scroll down, I'll tag along.",
    context:            "Can't pick one title. So I just build.",
    'product-thinking': "Electric Doc started as a sketch and ended as a patent.",
    world:              "AI, hardware, product, people. One curious brain.",
    made:               "Ideas bore me. Pick a project and see what I built.",
    places:             "A few interesting places so far. Still going.",
    communities:        "4,000+ students began with one idea.",
    other:              "Films, words, workshops... and yes, Spider-Man.",
    now:                "Right now: building, learning, thinking about startups.",
    contact:            "You made it this far. Let's make something."
  };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '#ak-m{position:fixed;left:0;bottom:0;z-index:9999;height:clamp(110px,18vh,170px);aspect-ratio:328/520;pointer-events:none;will-change:transform}' +
    '#ak-m .f{position:absolute;bottom:0;left:0;right:0;margin:0 auto;height:100%;width:auto;pointer-events:auto;cursor:pointer;user-select:none;-webkit-user-drag:none;transform-origin:50% 100%}' +
    '#ak-m.left .f{transform:scaleX(-1)}' +
    '#ak-m.walk .f{animation:akbob .5s ease-in-out infinite}' +
    '#ak-m .b{position:absolute;bottom:100%;left:50%;margin-bottom:6px;width:max-content;max-width:min(240px,70vw);text-align:center;' +
      'background:#fff;color:#111;font:600 14px/1.35 system-ui,sans-serif;padding:8px 12px;border-radius:12px;' +
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
  var current = null;

  function show(which) { walk.style.display = which === 'walk' ? '' : 'none'; wave.style.display = which === 'wave' ? '' : 'none'; }
  function width() { return root.offsetWidth || 100; }
  function maxX() { return Math.max(0, innerWidth - width()); }
  function place() { root.style.transform = 'translateX(' + x + 'px)'; }

  function stand(ms) {
    mode = 'wave'; show('wave'); root.classList.remove('walk', 'left');
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

  // Speech bubble, kept inside the screen even when he's at the edge
  function say(text, ms) {
    bubble.textContent = text;
    bubble.style.transform = 'translateX(-50%)';
    var w = bubble.offsetWidth, c = x + width() / 2, pad = 8, shift = 0;
    if (c - w / 2 < pad) shift = pad - (c - w / 2);
    else if (c + w / 2 > innerWidth - pad) shift = (innerWidth - pad) - (c + w / 2);
    bubble.style.transform = 'translateX(calc(-50% + ' + shift + 'px))';
    bubble.classList.add('on');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove('on'); }, ms || 3200);
  }

  function tick(t) {
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (mode === 'walk') {
      var dir = target > x ? 1 : -1;
      x += dir * SPEED * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) { x = target; stand(2200 + Math.random() * 2500); }
      place();
    }
    requestAnimationFrame(tick);
  }

  // Which section is under the middle of the screen?
  function sectionKey() {
    var secs = document.querySelectorAll('section'), mid = innerHeight / 2;
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        for (var k in BY_SECTION) if (secs[i].classList.contains(k)) return k;
      }
    }
    return null;
  }
  var spoken = {}, lastSpoke = 0, ticking = false;
  function talk(k) {
    lastSpoke = Date.now(); spoken[k] = true;
    stand(4200); say(BY_SECTION[k], 4000);
  }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var k = sectionKey();
      if (!k || k === current) return;
      current = k;
      // speaks once per section, never in a rush, hero is covered by the greeting
      if (k !== 'hero' && !spoken[k] && Date.now() - lastSpoke > 2500) talk(k);
    });
  }
  function onClick() {                      // click = say the line for this section again
    var k = sectionKey() || 'hero';
    talk(k);
  }
  addEventListener('scroll', onScroll, { passive: true });
  walk.addEventListener('click', onClick); wave.addEventListener('click', onClick);
  addEventListener('resize', function () { x = Math.min(x, maxX()); place(); });

  place(); show('wave'); current = sectionKey();
  setTimeout(function () { say(GREETING, 3200); }, 600);
  if (!reduce) { timer = setTimeout(go, 4000); requestAnimationFrame(tick); }
})();
