// abuska media – kleine UI-Interaktionen
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Buchungsart: Rechnungsadresse nur bei Direktbuchung als Pflichtfeld hervorheben
  var bookingRadios = document.querySelectorAll('input[name="buchungsart"]');
  var billingHint = document.getElementById('billing-hint');
  if (bookingRadios.length && billingHint) {
    bookingRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        billingHint.style.display = (this.value === 'buchen' && this.checked) ? 'block' : 'none';
      });
    });
  }

  // Paket-Auswahl über Preis-Karten in das Anfrageformular übernehmen
  var params = new URLSearchParams(window.location.search);
  var pkg = params.get('paket');
  var pkgSelect = document.getElementById('paket');
  if (pkg && pkgSelect) {
    Array.from(pkgSelect.options).forEach(function (opt) {
      if (opt.value === pkg) { opt.selected = true; }
    });
  }

  // Anfrageformular: per AJAX an Formspree senden, ohne die Seite neu zu laden
  var anfrageForm = document.getElementById('anfrage-form');
  if (anfrageForm) {
    var formFields = document.getElementById('form-fields');
    var formSuccess = document.getElementById('form-success');
    var formError = document.getElementById('form-error');
    var submitBtn = document.getElementById('form-submit-btn');

    anfrageForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formError.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';

      var data = new FormData(anfrageForm);
      fetch(anfrageForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          formFields.style.display = 'none';
          document.querySelector('#anfrage-form .form-divider').style.display = 'none';
          submitBtn.style.display = 'none';
          document.querySelector('#anfrage-form .form-note').style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          throw new Error('Formspree-Fehler');
        }
      }).catch(function () {
        formError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anfragen';
      });
    });
  }

  // Zahlen-Counter: von 0 hochzählen, sobald sichtbar
  var counterEls = document.querySelectorAll('.counter-num');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1600;
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.firstChild.nodeValue = current.toLocaleString('de-DE');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.firstChild.nodeValue = target.toLocaleString('de-DE');
      }
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

  // Hintergrund-Galerie: Lightbox mit Vollbild-Vorschau
  var bgTiles = Array.prototype.slice.call(document.querySelectorAll('.bg-tile'));
  var lightbox = document.getElementById('bgLightbox');
  if (bgTiles.length && lightbox) {
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var currentIndex = 0;

    function showBg(index) {
      currentIndex = (index + bgTiles.length) % bgTiles.length;
      var tile = bgTiles[currentIndex];
      lightboxImg.src = tile.getAttribute('data-full');
      var num = tile.getAttribute('data-num');
      lightboxCaption.textContent = 'Hintergrund ' + num + ' von ' + bgTiles.length;
    }

    function openLightbox(index) {
      showBg(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    bgTiles.forEach(function (tile, index) {
      tile.addEventListener('click', function () { openLightbox(index); });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { showBg(currentIndex - 1); });
    lightboxNext.addEventListener('click', function () { showBg(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) { closeLightbox(); }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showBg(currentIndex - 1);
      if (e.key === 'ArrowRight') showBg(currentIndex + 1);
    });
  }

  // Sanftes Einblenden von Sektionen beim Scrollen
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }
});
