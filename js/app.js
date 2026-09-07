(function () {
  var PORTRAITS = [
    'images/scomo-holiday.jpg'
  ];
  var portraitImg = document.getElementById('portraitImg');
  portraitImg.src = PORTRAITS[Math.floor(Math.random() * PORTRAITS.length)];

  var themeToggle = document.getElementById('themeToggle');

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || systemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.classList.toggle('is-dark', theme === 'dark');
  }

  themeToggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('scomoro-theme', next); } catch (e) {}
  });

  applyTheme(currentTheme());

  var focusMin = 25, breakMin = 5;
  var mode = 'focus';
  var remaining = focusMin * 60;
  var running = false;
  var timerId = null;
  var pomodoroCount = 1;

  var sessionPill = document.getElementById('sessionPill');
  var sessionCount = document.getElementById('sessionCount');
  var timerDisplay = document.getElementById('timerDisplay');
  var ringProgress = document.getElementById('ringProgress');
  var startPauseBtn = document.getElementById('startPauseBtn');
  var resetBtn = document.getElementById('resetBtn');
  var focusVal = document.getElementById('focusVal');
  var breakVal = document.getElementById('breakVal');

  var RADIUS = 90;
  var CIRC = 2 * Math.PI * RADIUS;
  ringProgress.style.strokeDasharray = CIRC.toFixed(2);

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  function totalFor(m) {
    return (m === 'focus' ? focusMin : breakMin) * 60;
  }

  function render() {
    timerDisplay.textContent = fmt(remaining);
    var total = totalFor(mode);
    var frac = total > 0 ? remaining / total : 0;
    ringProgress.style.strokeDashoffset = (CIRC * (1 - frac)).toFixed(2);

    var isBreak = mode === 'break';
    sessionPill.textContent = isBreak ? 'BREAK' : 'FOCUS';
    sessionPill.classList.toggle('is-break', isBreak);
    ringProgress.classList.toggle('is-break', isBreak);
    startPauseBtn.classList.toggle('is-break', isBreak);
    sessionCount.textContent = 'ScoMoro #' + pomodoroCount;

    if (running) {
      startPauseBtn.textContent = 'Pause';
    } else {
      startPauseBtn.textContent = isBreak ? "She'll be right, have a break" : 'Get to work, mate';
    }

    document.title = running ? (fmt(remaining) + ' — ScoMoro') : 'ScoMoro';
  }

  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var notes = [660, 880];
      notes.forEach(function (freq, idx) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        var start = ctx.currentTime + idx * 0.16;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.55);
      });
      setTimeout(function () { ctx.close && ctx.close(); }, 1200);
    } catch (e) { /* audio unsupported, silently skip */ }
  }

  function switchMode() {
    if (mode === 'focus') {
      pomodoroCount += 1;
      mode = 'break';
    } else {
      mode = 'focus';
    }
    remaining = totalFor(mode);
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      running = false;
      chime();
      switchMode();
      render();
      return;
    }
    render();
  }

  function startPause() {
    if (running) {
      clearInterval(timerId);
      timerId = null;
      running = false;
    } else {
      running = true;
      timerId = setInterval(tick, 1000);
    }
    render();
  }

  function reset() {
    clearInterval(timerId);
    timerId = null;
    running = false;
    mode = 'focus';
    pomodoroCount = 1;
    remaining = totalFor('focus');
    render();
  }

  startPauseBtn.addEventListener('click', startPause);
  resetBtn.addEventListener('click', reset);

  document.querySelectorAll('.step-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (running) return;
      var target = btn.getAttribute('data-target');
      var dir = parseInt(btn.getAttribute('data-dir'), 10);
      if (target === 'focus') {
        focusMin = Math.min(60, Math.max(5, focusMin + dir * 5));
        focusVal.textContent = focusMin;
        if (mode === 'focus') remaining = totalFor('focus');
      } else {
        breakMin = Math.min(30, Math.max(1, breakMin + dir * 1));
        breakVal.textContent = breakMin;
        if (mode === 'break') remaining = totalFor('break');
      }
      render();
    });
  });

  render();
})();
