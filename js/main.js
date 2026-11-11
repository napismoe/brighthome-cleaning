/* =====================================================================
   BrightHome Cleaning — main.js
   ---------------------------------------------------------------------
   1. Mobile menu: open/close, close on link click, Escape key,
      focus management, page scroll lock.
   2. Header style change once the page is scrolled.
   3. Current year in the footer.

   No dependencies. Loaded with "defer", so the HTML is ready when
   this code runs.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. Mobile menu
     --------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  // Everything outside the header. While the menu is open these areas
  // are made "inert": they can't be focused or clicked, so keyboard
  // and screen-reader users stay inside the menu.
  var outsideAreas = document.querySelectorAll('.demo-banner, main, .site-footer');

  // Same breakpoint as the CSS (64em = 1024px): above it, the menu is
  // always visible and the toggle button is hidden.
  var desktopQuery = window.matchMedia('(min-width: 64em)');

  function isMenuOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  function setOutsideInert(value) {
    outsideAreas.forEach(function (area) {
      area.inert = value;
    });
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    setOutsideInert(true);
    document.documentElement.style.overflow = 'hidden'; // lock page scroll

    // Move focus to the first link so keyboard users start inside the menu.
    var firstLink = nav.querySelector('a');
    if (firstLink) {
      focusWhenVisible(firstLink, 0);
    }
  }

  /**
   * The panel switches from "visibility: hidden" to "visible" through a
   * CSS transition, and browsers refuse to focus hidden elements. So we
   * wait, frame by frame, until the panel is really visible (a few
   * frames at most; capped at 30 as a safety net).
   */
  function focusWhenVisible(element, attempt) {
    var visible = window.getComputedStyle(nav).visibility === 'visible';
    if (visible || attempt > 30) {
      element.focus();
    } else {
      window.requestAnimationFrame(function () {
        focusWhenVisible(element, attempt + 1);
      });
    }
  }

  /**
   * Closes the menu.
   * @param {boolean} returnFocus - true to send focus back to the toggle
   *   button (used for Escape and the toggle itself; not for link clicks,
   *   where focus should follow the link to its section).
   */
  function closeMenu(returnFocus) {
    if (!isMenuOpen()) {
      return;
    }
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    setOutsideInert(false);
    document.documentElement.style.overflow = '';

    if (returnFocus) {
      toggle.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (isMenuOpen()) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    // Close when a section link (or the CTA) is selected.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        closeMenu(false);
      }
    });

    // Close with the Escape key.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) {
        closeMenu(true);
      }
    });

    // If the window grows to desktop size while open, reset the menu.
    desktopQuery.addEventListener('change', function (event) {
      if (event.matches) {
        closeMenu(false);
      }
    });
  }

  /* ---------------------------------------------------------------
     2. Header that changes on scroll
     --------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var SCROLL_THRESHOLD = 8; // pixels scrolled before the header changes
  var ticking = false;

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  if (header) {
    // requestAnimationFrame limits the work to once per frame, and the
    // "passive" listener tells the browser we never block scrolling.
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader(); // correct state if the page loads already scrolled
  }

  /* ---------------------------------------------------------------
     3. Current year in the footer
     --------------------------------------------------------------- */
  var yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
})();
