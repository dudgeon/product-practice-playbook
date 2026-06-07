// Submit-modal controller. The header CTA and every contextual "+ Add" link
// carry data-submit + a real GitHub-issue href. With JS we intercept the click
// and open the modal (populated from the trigger); without JS the link simply
// navigates to GitHub. That's the whole of the site's client-side behavior.
(function () {
  'use strict';
  var modal = document.getElementById('submit-modal');
  if (!modal) return;

  var titleEl = modal.querySelector('[data-modal-title]');
  var scopeEl = modal.querySelector('[data-modal-scope]');
  var primary = modal.querySelector('[data-modal-primary]');
  var lastFocus = null;

  function open(trigger) {
    lastFocus = trigger;
    var title = trigger.getAttribute('data-submit-title') || 'Submit a use case';
    var scope = trigger.getAttribute('data-submit-scope') || 'phase › activity';
    var href = trigger.getAttribute('href') || trigger.getAttribute('data-submit-href');
    if (titleEl) titleEl.textContent = title;
    if (scopeEl) scopeEl.textContent = scope;
    if (primary && href) primary.setAttribute('href', href);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    if (primary && primary.focus) primary.focus();
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-submit]');
    if (trigger) { e.preventDefault(); open(trigger); return; }
    if (e.target === modal || e.target.closest('[data-modal-close]')) { e.preventDefault(); close(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();
