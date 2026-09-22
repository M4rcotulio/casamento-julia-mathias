(function () {
  'use strict';

  /* ---------------------------------------------------------
     Reveal on scroll (fade + subtle rise)
     --------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Image mask reveal (.img-reveal) — fade + scale-down once
     --------------------------------------------------------- */
  var imgReveals = document.querySelectorAll('.img-reveal');

  if ('IntersectionObserver' in window && imgReveals.length) {
    var imgIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            imgIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    imgReveals.forEach(function (el) { imgIo.observe(el); });
  } else {
    imgReveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Word-by-word stagger reveal (.reveal-words)
     --------------------------------------------------------- */
  var wordReveals = document.querySelectorAll('.reveal-words');

  wordReveals.forEach(function (el) {
    var words = el.querySelectorAll('.word-inner');
    words.forEach(function (word, i) {
      word.style.transitionDelay = (i * 110) + 'ms';
    });
  });

  if ('IntersectionObserver' in window && wordReveals.length) {
    var wordIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            wordIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -40px 0px' }
    );
    wordReveals.forEach(function (el) { wordIo.observe(el); });
  } else {
    wordReveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Subtle scroll parallax ([data-parallax]) — desktop/mobile
     safe, transform-only, skipped for reduced motion.
     --------------------------------------------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  if (parallaxEls.length && !prefersReducedMotion) {
    var ticking = false;

    function updateParallax() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        // Only compute while roughly near the viewport.
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var strength = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (rect.top - vh / 2) * strength * -1;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateParallax();
  }

  /* ---------------------------------------------------------
     Cloudinary Upload Widget
     --------------------------------------------------------- */
  var CLOUD_NAME = 'mxsz1nso';
  var UPLOAD_PRESET = 'casamento_julia_mathias';
  var ASSET_FOLDER = 'casamento-julia-mathias';

  var MAX_FILES = 5;
  var MAX_PHOTO_MB = 10;
  var MAX_VIDEO_MB = 50;
  var ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'mp4', 'mov'];
  var VIDEO_EXT = ['mp4', 'mov'];

  var triggerBtn = document.getElementById('uploadTrigger');
  var triggerBtnSticky = document.getElementById('uploadTriggerSticky');
  var statusEl = document.getElementById('uploadStatus');
  var confirmationEl = document.getElementById('uploadConfirmation');
  var guestNameInput = document.getElementById('guestName');
  var guestMessageInput = document.getElementById('guestMessage');
  var guestNameError = document.getElementById('guestNameError');
  var guestMessageCount = document.getElementById('guestMessageCount');
  var MESSAGE_MAX_LENGTH = 500;
  var NAME_MAX_LENGTH = 100;

  /* ---------------------------------------------------------
     Guest identification (name + optional message)
     Collected before the Cloudinary widget opens, then sent
     along with each uploaded file as Cloudinary "context"
     metadata + a per-submission tag — no extra backend needed.
     --------------------------------------------------------- */

  // Cloudinary's unstructured "context" is transmitted as a
  // pipe/equals-delimited string (key=value|key=value), so those
  // characters are stripped from guest input to keep the metadata
  // well-formed no matter what the widget SDK does under the hood.
  function sanitizeGuestText(value, singleLine) {
    var clean = (value || '')
      .replace(/\|/g, '/')
      .replace(/=/g, '-')
      .replace(/\\/g, '')
      .replace(/[ \t]+/g, ' ');

    if (singleLine) {
      clean = clean.replace(/[\r\n]+/g, ' ');
    }

    return clean.trim();
  }

  function getGuestData() {
    var rawName = guestNameInput ? guestNameInput.value : '';
    var rawMessage = guestMessageInput ? guestMessageInput.value : '';

    var name = sanitizeGuestText(rawName, true).slice(0, NAME_MAX_LENGTH);
    var message = sanitizeGuestText(rawMessage, false).slice(0, MESSAGE_MAX_LENGTH);

    if (!name) {
      return {
        valid: false,
        name: name,
        message: message,
        error: 'Conte-nos quem está compartilhando essa memória.'
      };
    }

    return { valid: true, name: name, message: message, error: '' };
  }

  function showGuestNameError(message) {
    if (guestNameInput) {
      guestNameInput.setAttribute('aria-invalid', 'true');
      guestNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      guestNameInput.focus({ preventScroll: true });
    }
    if (guestNameError) {
      guestNameError.textContent = message;
    }
  }

  function clearGuestNameError() {
    if (guestNameInput) {
      guestNameInput.removeAttribute('aria-invalid');
    }
    if (guestNameError) {
      guestNameError.textContent = '';
    }
  }

  function resetGuestForm() {
    if (guestNameInput) {
      guestNameInput.value = '';
    }
    if (guestMessageInput) {
      guestMessageInput.value = '';
    }
    if (guestMessageCount) {
      guestMessageCount.textContent = '0 / ' + MESSAGE_MAX_LENGTH;
    }
    clearGuestNameError();
  }

  if (guestNameInput) {
    guestNameInput.addEventListener('input', clearGuestNameError);
  }

  if (guestMessageInput && guestMessageCount) {
    var updateGuestMessageCount = function () {
      var length = guestMessageInput.value.length;
      guestMessageCount.textContent = length + ' / ' + MESSAGE_MAX_LENGTH;
    };
    guestMessageInput.addEventListener('input', updateGuestMessageCount);
    updateGuestMessageCount();
  }

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    if (state) {
      statusEl.setAttribute('data-state', state);
    } else {
      statusEl.removeAttribute('data-state');
    }
  }

  function setTriggersDisabled(disabled) {
    if (triggerBtn) triggerBtn.disabled = disabled;
    if (triggerBtnSticky) triggerBtnSticky.disabled = disabled;
  }

  function getExtension(filename) {
    if (!filename) return '';
    var parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function isVideoExt(ext) {
    return VIDEO_EXT.indexOf(ext) !== -1;
  }

  // Cloudinary may not be loaded yet if the network is slow — guard against that.
  function whenCloudinaryReady(cb) {
    if (window.cloudinary) {
      cb();
      return;
    }
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (window.cloudinary) {
        clearInterval(interval);
        cb();
      } else if (attempts > 40) { // ~10s
        clearInterval(interval);
        setStatus('Não foi possível carregar o envio agora. Verifique sua conexão e tente novamente.', 'error');
        setTriggersDisabled(false);
      }
    }, 250);
  }

  function buildWidget(guest) {
    var context = { nome: guest.name };
    if (guest.message) {
      context.mensagem = guest.message;
    }

    // Per-submission tag so every file from the same upload batch
    // can be found and grouped together afterwards in Cloudinary.
    var batchTag = 'envio-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);

    return window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: ASSET_FOLDER,
        multiple: true,
        maxFiles: MAX_FILES,
        clientAllowedFormats: ALLOWED_EXT,
        maxFileSize: MAX_VIDEO_MB * 1024 * 1024, // hard ceiling; per-type check happens client-side too
        sources: ['local', 'camera'],
        showAdvancedOptions: false,
        showSkipCropButton: false,
        showPoweredBy: false,
        singleUploadAutoClose: false,
        language: 'pt',
        context: context,
        tags: ['convidados', batchTag],
        text: {
          pt: {
            queue: {
              title: 'Suas memórias',
              upload_more: 'Enviar mais',
              done: 'Concluído'
            },
            local: {
              browse: 'Escolher',
              dd_title_single: 'Arraste uma foto ou vídeo',
              dd_title_multi: 'Arraste fotos ou vídeos'
            }
          }
        },
        styles: {
          palette: {
            window: '#F7F4EE',
            windowBorder: '#B7A896',
            tabIcon: '#7A4B34',
            menuIcons: '#3A342E',
            textDark: '#0E0D0C',
            textLight: '#F7F4EE',
            link: '#7A4B34',
            action: '#7A4B34',
            inactiveTabIcon: '#B7A896',
            error: '#9C3B2E',
            inProgress: '#7A4B34',
            complete: '#4A6B4E',
            sourceBg: '#FFFFFF'
          },
          fonts: {
            "'Archivo', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&display=swap',
              active: true
            }
          }
        }
      },
      function (error, result) {
        if (error) {
          console.error('Cloudinary widget error:', error);
          if (error.status === 'File Too Large' || (error.message && /size/i.test(error.message))) {
            setStatus('Esse arquivo é maior do que o permitido. Tente um arquivo menor.', 'error');
          } else {
            setStatus('Não conseguimos enviar esse arquivo. Tente novamente.', 'error');
          }
          setTriggersDisabled(false);
          return;
        }

        if (!result) return;

        switch (result.event) {
          case 'source-changed':
          case 'display-changed':
            break;
          case 'success':
            setStatus('Enviando...', null);
            break;
          case 'queues-end':
            handleUploadComplete(result);
            break;
          case 'abort':
          case 'close':
            setTriggersDisabled(false);
            break;
          default:
            break;
        }
      }
    );
  }

  function handleUploadComplete(result) {
    setTriggersDisabled(false);

    var files = (result && result.info && result.info.files) || [];
    var successCount = files.filter(function (f) {
      return f.uploadInfo || (f.status === 'success');
    }).length;

    if (successCount > 0 || files.length === 0) {
      setStatus('', null);
      showConfirmation();
      resetGuestForm();
    } else {
      setStatus('Não conseguimos enviar seus arquivos. Verifique sua conexão e tente novamente.', 'error');
    }
  }

  function showConfirmation() {
    if (!confirmationEl) return;
    confirmationEl.classList.add('is-visible');
    confirmationEl.setAttribute('tabindex', '-1');
    confirmationEl.focus({ preventScroll: true });
    confirmationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  var widget = null;

  function openWidget(guest) {
    if (!navigator.onLine) {
      setStatus('Você parece estar sem conexão. Verifique o Wi-Fi ou os dados móveis e tente novamente.', 'error');
      return;
    }

    setTriggersDisabled(true);
    setStatus('Abrindo...', null);

    whenCloudinaryReady(function () {
      try {
        // Rebuilt on every open so the widget always carries the
        // guest's current name/message — never a stale submission.
        if (widget && typeof widget.destroy === 'function') {
          try {
            widget.destroy();
          } catch (destroyErr) {
            // Non-fatal: proceed with a fresh widget regardless.
          }
        }
        widget = buildWidget(guest);
        setStatus('', null);
        widget.open();
        setTriggersDisabled(false);
      } catch (err) {
        console.error('Failed to open Cloudinary widget:', err);
        setStatus('Não conseguimos abrir o envio agora. Tente novamente.', 'error');
        setTriggersDisabled(false);
      }
    });
  }

  function handleTriggerClick() {
    var guest = getGuestData();

    if (!guest.valid) {
      showGuestNameError(guest.error);
      return;
    }

    clearGuestNameError();
    openWidget(guest);
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', handleTriggerClick);
  }

  if (triggerBtnSticky) {
    triggerBtnSticky.addEventListener('click', handleTriggerClick);
  }

  window.addEventListener('offline', function () {
    setStatus('Sua conexão caiu. Você poderá tentar novamente quando ela voltar.', 'error');
  });

  /* ---------------------------------------------------------
     Sticky mobile CTA — visible once the hero has scrolled
     past, hidden once the upload section itself is on screen.
     --------------------------------------------------------- */
  var stickyCta = document.getElementById('stickyCta');
  var heroEl = document.querySelector('.hero');
  var uploadEl = document.getElementById('upload');

  if (stickyCta && 'IntersectionObserver' in window) {
    var heroVisible = true;
    var uploadVisible = false;

    function updateStickyCta() {
      var shouldShow = !heroVisible && !uploadVisible;
      stickyCta.classList.toggle('is-visible', shouldShow);
    }

    if (heroEl) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroVisible = entry.isIntersecting;
          updateStickyCta();
        });
      }, { threshold: 0 });
      heroObserver.observe(heroEl);
    } else {
      heroVisible = false;
    }

    if (uploadEl) {
      var uploadObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          uploadVisible = entry.isIntersecting;
          updateStickyCta();
        });
      }, { threshold: 0.15 });
      uploadObserver.observe(uploadEl);
    }
  } else if (stickyCta) {
    // No IntersectionObserver support — keep it simple and always visible.
    stickyCta.classList.add('is-visible');
  }

})();
