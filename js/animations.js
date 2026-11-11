/* =====================================================================
   BrightHome Cleaning — animations.js
   ---------------------------------------------------------------------
   Subtle scroll reveal: selected elements fade in and rise slightly
   (1.25rem) the first time they enter the screen.

   Principles:
   - Restraint: only section headers, photos and list items animate,
     each one only once. The hero already has its own CSS entrance.
   - Progressive enhancement: content is only hidden after this script
     confirms it can reveal it again ("has-reveal" class on <html>).
     If JavaScript or IntersectionObserver is unavailable, everything
     simply stays visible.
   - Accessibility: nothing animates when the user has enabled
     "reduce motion" in their operating system.

   The visual styles live in css/base.css ([data-reveal], .is-visible).
   ===================================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Bail out early: no animation at all in these cases.
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    return;
  }

  /* Elements that reveal on scroll. Kept deliberately short. */
  var SELECTORS = [
    '.section-header',
    '.benefits__intro',
    '.services__media',
    '.services__list > li',
    '.benefit',
    '.step',
    '.faq__list',
    '.contact__intro',
    '.contact-form'
  ].join(',');

  /* Items in the same list appear one after another, but the delay is
     capped so long lists never feel slow. */
  var STAGGER_STEP_MS = 70;
  var STAGGER_MAX_MS = 280;

  var targets = Array.prototype.slice.call(document.querySelectorAll(SELECTORS));

  targets.forEach(function (element) {
    element.setAttribute('data-reveal', '');

    // Position among siblings that also reveal (for the stagger).
    var parent = element.parentElement;
    var siblings = Array.prototype.filter.call(parent.children, function (child) {
      return child.matches(SELECTORS);
    });
    var index = siblings.indexOf(element);
    if (index > 0) {
      element.style.transitionDelay = Math.min(index * STAGGER_STEP_MS, STAGGER_MAX_MS) + 'ms';
    }
  });

  function reveal(element) {
    element.classList.add('is-visible');

    // Once revealed, remove the stagger delay so it never slows down
    // any later transition on the same element.
    element.addEventListener('transitionend', function () {
      element.style.transitionDelay = '';
    }, { once: true });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, {
    // Trigger a little before the element is fully in view.
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12
  });

  targets.forEach(function (element) {
    observer.observe(element);
  });

  // Only now is it safe to hide the elements (see css/base.css).
  document.documentElement.classList.add('has-reveal');

  // If the user turns on "reduce motion" while the page is open,
  // show everything immediately and stop observing.
  reducedMotion.addEventListener('change', function (event) {
    if (event.matches) {
      targets.forEach(reveal);
      observer.disconnect();
    }
  });
})();
