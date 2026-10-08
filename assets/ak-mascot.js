/* Digi AK — roams the bottom of the page, switches poses, and comments on
   the section the visitor is viewing (automatically, and again when clicked).
   Keep this file and all ak-*.png / ak-*.webp images in the same folder. */
(function () {
  var base = document.currentScript.src.replace(/[^/]*$/, '');
  var GREETING = "Hey, I'm Digi AK! 👋";
  var REF = 540;                         // pixel height of a standing pose = full mascot height

  // pose name -> [file, image height in px]
  var POSES = {
    walk:['ak-walk.png',520], coffee:['ak-coffee.webp',535], run:['ak-run.webp',531],
    wave:['ak-wave.png',520], think:['ak-think.webp',542], phone:['ak-phone.webp',549],
    book:['ak-book.webp',536], thumbs2:['ak-thumbs2.webp',551], bottle:['ak-bottle.webp',542],
    shrug:['ak-shrug.webp',539], point:['ak-point.webp',542], laptop:['ak-laptop.webp',413],
    cheer:['ak-cheer.webp',574]
  };
  // how he travels (picked at random each trip) and what he does when he stops
  var TRIPS = [{pose:'walk',speed:70},{pose:'walk',speed:70},{pose:'coffee',speed:70},{pose:'coffee',speed:70},{pose:'run',speed:160}];
  var IDLE = ['wave','wave','think','phone','book','thumbs2','bottle'];

  // what he says + which pose he strikes per section (key = section class in index.html)
  var BY_SECTION = {
    hero:               ["Hey, I'm Digi AK! Scroll down, I'll tag along.", 'wave'],
    context:            ["Can't pick one title. So I just build.", 'shrug'],
    'product-thinking': ["Electric Doc started as a sketch and ended as a patent.", 'think'],
    world:              ["AI, hardware, product, people. One curious brain.", 'point'],
    made:               ["Ideas bore me. Pick a project and see what I built.", 'laptop'],
    places:             ["A few interesting places so far. Still going.", 'book'],
    communities:        ["4,000+ students began with one idea.", 'thumbs2'],
    other:              ["Films, words, workshops... and yes, Spider-Man.", 'phone'],
    now:                ["Right now: building, learning, thinking about startups.", 'bottle'],
    contact:            ["You made it this far. Let's make something.", 'cheer']
  };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '#ak-m{position:fixed;left:0;bottom:0;z-index:9999;height:clamp(110px,18vh,170px);aspect-ratio:328/520;pointer-events:none;will-change:transform}' +
    '#ak-m .f{position:absolute;bottom:0;left:0;right:0;margin:0 auto;width:auto;pointer-events:auto;cursor:pointer;user-select:none;-webkit-user-drag:none;transform-origin:50% 100%}' +
    '#ak-m.left .f{transform:scaleX(-1)}' +
    '#ak-m.walk .f{animation:akbob .5s ease-in-out infinite}' +
    '#ak-m.run .f{animation-duration:.32s}' +
    '#ak-m .b{position:absolute;bottom:100%;left:50%;margin-bottom:6px;width:max-content;max-width:min(240px,70vw);text-align:center;' +
      'background:#fff;color:#111;font:600 14px/1.35 system-ui,sans-serif;padding:8px 12px;border-radius:12px;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;pointer-events:none}' +
    '#ak-m .b.on{opacity:1}' +
    '@keyframes akbob{0%,100%{translate:0 0;rotate:-1.5deg}50%{translate:0 -6px;rotate:1.5deg}}';
  document.head.appendChild(css);

  var root = document.createElement('div');
  root.id = 'ak-m'; root.setAttribute('aria-hidden', 'true');
  var imgs = {};
  for (var name in POSES) {
    var im = new Image(); im.src = base + POSES[name][0]; im.className = 'f'; im.draggable = false;
    im.style.height = (POSES[name][1] / REF * 100) + '%'; im.style.display = 'none';
    im.addEventListener('click', onClick);
    imgs[name] = im; root.appendChild(im);
  }
  var bubble = document.createElement('div'); bubble.className = 'b';
  root.appendChild(bubble); document.body.appendChild(root);

  var x = 40, target = x, mode = 'stand', speed = 70, timer, last = 0, bubbleTimer, shown = null, current = null;
  var spoken = {}, lastSpoke = 0, ticking = false;

  function show(name) {
    if (shown) imgs[shown].style.display = 'none';
    imgs[name].style.display = ''; shown = name;
    bubble.style.bottom = (POSES[name][1] / REF * 100) + '%';
  }
  function width() { return root.offsetWidth || 100; }
  function maxX() { return Math.max(0, innerWidth - width()); }
  function place() { root.style.transform = 'translateX(' + x + 'px)'; }

  function stand(ms, pose) {
    mode = 'stand'; root.classList.remove('walk', 'run', 'left');
    show(pose || IDLE[Math.floor(Math.random() * IDLE.length)]);
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(go, ms || 2500);
  }
  function go() {
    var trip = TRIPS[Math.floor(Math.random() * TRIPS.length)], m = maxX();
    target = Math.random() * m;
    if (Math.abs(target - x) < 120) target = x < m / 2 ? Math.min(m, x + 300) : Math.max(0, x - 300);
    speed = trip.speed; mode = 'walk'; show(trip.pose);
    root.classList.add('walk'); root.classList.toggle('run', trip.pose === 'run');
    root.classList.toggle('left', target < x);
  }
  function say(text, ms) {                // speech bubble, kept inside the screen
    bubble.textContent = text; bubble.style.transform = 'translateX(-50%)';
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
      x += dir * speed * dt;
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
      if (r.top <= mid && r.bottom >= mid) for (var k in BY_SECTION) if (secs[i].classList.contains(k)) return k;
    }
    return null;
  }
  function talk(k) {
    lastSpoke = Date.now(); spoken[k] = true;
    stand(4200, BY_SECTION[k][1]); say(BY_SECTION[k][0], 4000);
  }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var k = sectionKey();
      if (!k || k === current) return;
      current = k;
      if (k !== 'hero' && !spoken[k] && Date.now() - lastSpoke > 2500) talk(k);   // once per section
    });
  }
  function onClick() { talk(sectionKey() || 'hero'); }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { x = Math.min(x, maxX()); place(); });

  place(); current = sectionKey(); show('wave');
  setTimeout(function () { say(GREETING, 3200); }, 600);
  if (!reduce) { timer = setTimeout(go, 4000); requestAnimationFrame(tick); }
})();
