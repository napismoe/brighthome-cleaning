/* =====================================================================
   BrightHome Cleaning — form.js
   ---------------------------------------------------------------------
   Contact form validation in DEMO MODE.

   What it does:
   - Validates required fields, email format, US ZIP code (5 digits),
     message length and the demo acknowledgement checkbox.
   - Shows accessible error messages: each message is linked to its
     field (aria-describedby, already in the HTML) and the field is
     marked with aria-invalid="true".
   - On a valid form, shows a confirmation that clearly states this is
     a demonstration and that NOTHING was sent or stored.

   What it intentionally does NOT do:
   - It does not send data anywhere (no fetch, no external services).
   - It does not store data (no localStorage, cookies or similar).
   - It does not pretend that a request was sent.

   Future integration: see the "Integration point" note in onSubmit().
   ===================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  var statusBox = document.getElementById('form-status');

  // JavaScript takes over validation, so the browser's default bubbles
  // are turned off.
  form.noValidate = true;

  // The submit button ships disabled in the HTML, so that without
  // JavaScript the browser can never submit (and send) the form.
  // Now that this script controls submission, it can be enabled.
  var submitButton = form.querySelector('[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
  }

  /* ---------------------------------------------------------------
     Validation rules
     Each rule receives the field's value and returns an error message,
     or an empty string when the value is valid.
     --------------------------------------------------------------- */
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ZIP_PATTERN = /^\d{5}$/;   // US ZIP code: exactly 5 digits

  var rules = {
    name: function (value) {
      if (value === '') return 'Please enter your full name.';
      if (value.length < 2) return 'Your name looks too short.';
      return '';
    },

    email: function (value) {
      if (value === '') return 'Please enter your email address.';
      if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address, like name@example.com.';
      return '';
    },

    zip: function (value) {
      if (value === '') return 'Please enter your ZIP code.';
      if (!ZIP_PATTERN.test(value)) return 'Enter a 5-digit US ZIP code, like 33131.';
      return '';
    },

    service: function (value) {
      return value === '' ? 'Please choose a service.' : '';
    },

    homeSize: function (value) {
      return value === '' ? 'Please choose your home size.' : '';
    },

    frequency: function (value) {
      return value === '' ? 'Please choose how often you need cleaning.' : '';
    },

    message: function (value) {
      return value.length > 1000 ? 'Please keep your message under 1,000 characters.' : '';
    },

    consent: function (checked) {
      return checked ? '' : 'Please confirm that you understand this is a demo form.';
    }
  };

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */

  /** Returns the current value of a field (trimmed text, or true/false for a checkbox). */
  function getValue(field) {
    return field.type === 'checkbox' ? field.checked : field.value.trim();
  }

  /** The <p class="field__error"> that belongs to a field. */
  function getErrorElement(field) {
    return document.getElementById(field.id + '-error');
  }

  /** Shows or clears the error for one field. Returns true when valid. */
  function validateField(field) {
    var rule = rules[field.name];
    if (!rule) {
      return true;
    }

    var message = rule(getValue(field));
    var errorElement = getErrorElement(field);

    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }

    if (errorElement) {
      errorElement.textContent = message;
    }

    return message === '';
  }

  /** All fields that have a validation rule, in page order. */
  function getValidatedFields() {
    return Array.prototype.filter.call(form.elements, function (field) {
      return Boolean(rules[field.name]);
    });
  }

  function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.classList.toggle('form-status--error', type === 'error');
  }

  function clearStatus() {
    statusBox.textContent = '';
    statusBox.classList.remove('form-status--error');
  }

  /** Message summarizing how many fields still need attention. */
  function errorSummary(count) {
    return count === 1
      ? 'Please correct the highlighted field.'
      : 'Please correct the ' + count + ' highlighted fields.';
  }

  /** Keeps the error summary in sync while the user fixes fields. */
  function refreshErrorSummary() {
    if (!statusBox.classList.contains('form-status--error')) {
      return;
    }
    var remaining = form.querySelectorAll('[aria-invalid="true"]').length;
    if (remaining === 0) {
      clearStatus();
    } else {
      showStatus(errorSummary(remaining), 'error');
    }
  }

  /* ---------------------------------------------------------------
     Live feedback
     - A field is first checked when the user leaves it (blur), so
       nobody sees an error while still typing for the first time.
     - Once a field shows an error, it is re-checked on every change,
       so the error disappears as soon as it is fixed.
     --------------------------------------------------------------- */
  form.addEventListener('focusout', function (event) {
    var field = event.target;
    // Don't flag an untouched, empty field just because focus passed through it.
    if (rules[field.name] && field.type !== 'checkbox' && getValue(field) !== '') {
      validateField(field);
    }
  });

  function recheckIfInvalid(event) {
    var field = event.target;
    if (field.getAttribute('aria-invalid') === 'true') {
      validateField(field);
      refreshErrorSummary();
    }
  }

  form.addEventListener('input', recheckIfInvalid);
  form.addEventListener('change', recheckIfInvalid);

  /* ---------------------------------------------------------------
     Submit
     --------------------------------------------------------------- */
  form.addEventListener('submit', function (event) {
    // Always stop the browser's own submission: in demo mode nothing
    // may leave the page.
    event.preventDefault();
    clearStatus();

    // Honeypot: a hidden field that only bots fill in. Stop quietly.
    var honeypot = form.elements.company;
    if (honeypot && honeypot.value !== '') {
      return;
    }

    var invalidFields = getValidatedFields().filter(function (field) {
      return !validateField(field);
    });

    if (invalidFields.length > 0) {
      showStatus(errorSummary(invalidFields.length), 'error');
      // Take the user straight to the first problem.
      invalidFields[0].focus();
      return;
    }

    /* Integration point (only for a real business, never in this demo):
       this is where validated data would be sent to a real service,
       followed by a success or error message based on its answer.
       The server would have to validate the data again: browser
       validation is not security. */

    // DEMO MODE: nothing is sent or stored. Clear the form so no
    // personal data stays on screen, then explain what happened.
    form.reset();
    getValidatedFields().forEach(function (field) {
      field.removeAttribute('aria-invalid');
      var errorElement = getErrorElement(field);
      if (errorElement) errorElement.textContent = '';
    });

    showStatus(
      'Demo complete: all fields are valid. This is a portfolio demo, so ' +
      'nothing was sent or stored, no one will contact you, and the form ' +
      'has been cleared.',
      'success'
    );
  });
})();
