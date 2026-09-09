document.addEventListener('partialsLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('contactFormStatus');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;

    const fields = [
      { id: 'contactName', check: (v) => v.trim().length > 0 },
      { id: 'contactEmail', check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
      { id: 'contactMessage', check: (v) => v.trim().length > 0 }
    ];

    fields.forEach(({ id, check }) => {
      const input = document.getElementById(id);
      const errorEl = form.querySelector(`[data-error-for="${id}"]`);
      if (!input) return;

      const valid = check(input.value);
      if (errorEl) errorEl.hidden = valid;
      if (!valid) isValid = false;
    });

    if (!isValid) {
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent = 'Please correct the errors above.';
      }
      return;
    }

    // Honest limitation: no backend/email service is connected yet.
    // This does not send the message anywhere. It only confirms the
    // form itself is filled in correctly.
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent =
        'This form is not yet connected to send messages. Please call or email us directly for now.';
    }
  });
});
