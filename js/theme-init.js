(function () {
  try {
    var saved = localStorage.getItem('scomoro-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}
})();
