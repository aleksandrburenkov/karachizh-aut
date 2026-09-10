const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PHONE_MASK_PLACEHOLDER = '+7 (___) ___-__-__';
const DEMO_MESSAGE = 'Демонстрационный режим: подключите обработчик формы перед публикацией';

function applyPhoneMask(value) {
  const digits = value.replace(/\D/g, '');
  let result = '+7';

  if (digits.length > 1) {
    const rest = digits.slice(1);
    if (rest.length > 0) result += ' (' + rest.slice(0, 3);
    if (rest.length > 3) result += ') ' + rest.slice(3, 6);
    if (rest.length > 6) result += '-' + rest.slice(6, 8);
    if (rest.length > 8) result += '-' + rest.slice(8, 10);
  }

  return result;
}

class FormHandler {
  constructor(form) {
    this.form = form;
    this.status = form.querySelector('[data-form-status]');
    this.fields = form.querySelectorAll('input, select, textarea');
    this.phoneInputs = form.querySelectorAll('input[type="tel"]');
    this.consentCheckbox = form.querySelector('input[type="checkbox"][name*="consent"], input[type="checkbox"][name*="agree"], input[type="checkbox"][name*="policy"], input[type="checkbox"][name*="privacy"]');
    this.b2bTriggers = form.querySelectorAll('[data-b2b-trigger]');
    this.b2bConditionals = form.querySelectorAll('.form__conditional');

    this._onSubmit = this._onSubmit.bind(this);
    this._onPhoneInput = this._onPhoneInput.bind(this);
    this._onBeforeInputPhone = this._onBeforeInputPhone.bind(this);
    this._onB2bChange = this._onB2bChange.bind(this);

    this._setSourcePage();
    this._initPhoneMasks();
    this._initB2bTriggers();
    this.form.addEventListener('submit', this._onSubmit);
    this.form.setAttribute('novalidate', '');
  }

  _setSourcePage() {
    let hiddenField = this.form.querySelector('input[name="source_page"]');
    if (!hiddenField) {
      hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = 'source_page';
      this.form.appendChild(hiddenField);
    }
    hiddenField.value = window.location.pathname;
  }

  _initPhoneMasks() {
    this.phoneInputs.forEach(input => {
      input.setAttribute('placeholder', PHONE_MASK_PLACEHOLDER);
      input.setAttribute('inputmode', 'tel');
      input.addEventListener('input', this._onPhoneInput);
      input.addEventListener('beforeinput', this._onBeforeInputPhone);
    });
  }

  _initB2bTriggers() {
    this.b2bTriggers.forEach(trigger => {
      trigger.addEventListener('change', this._onB2bChange);
    });
    this.b2bTriggers.forEach(trigger => {
      if (trigger.checked || (trigger.tagName === 'SELECT' && trigger.selectedIndex > 0)) {
        this._onB2bChange({ target: trigger });
      }
    });
  }

  _onPhoneInput(event) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const oldValue = input.value;
    const oldDigits = oldValue.replace(/\D/g, '');

    const masked = applyPhoneMask(input.value);
    input.value = masked;

    const newDigits = masked.replace(/\D/g, '');
    if (newDigits.length > oldDigits.length && cursorPos === oldValue.length) {
      const newPos = masked.replace(/[^(]/g, '').length > 0
        ? masked.indexOf('(') + 4 + Math.max(0, newDigits.length - 4)
        : masked.lastIndexOf(newDigits[newDigits.length - 1]) + 1;
      input.setSelectionRange(newPos, newPos);
    } else {
      input.setSelectionRange(cursorPos, cursorPos);
    }
  }

  _onBeforeInputPhone(event) {
    if (event.inputType === 'insertFromPaste') return;
    if (event.data && !/^\d$/.test(event.data)) {
      event.preventDefault();
    }
  }

  _onB2bChange(event) {
    const trigger = event.target;
    const triggerValue = trigger.value;
    const triggerName = trigger.getAttribute('data-b2b-trigger');

    this.b2bConditionals.forEach(conditional => {
      const conditionalTrigger = conditional.getAttribute('data-b2b-conditional');
      if (conditionalTrigger === triggerValue) {
        conditional.hidden = false;
        conditional.querySelectorAll('input, select, textarea').forEach(el => {
          if (el.hasAttribute('data-required-if')) {
            el.setAttribute('required', '');
          }
        });
      } else {
        conditional.hidden = true;
        conditional.querySelectorAll('input, select, textarea').forEach(el => {
          el.removeAttribute('required');
        });
      }
    });
  }

  validate() {
    let isValid = true;
    this.fields.forEach(field => {
      if (!field.checkValidity()) {
        this._showError(field, field.validationMessage);
        isValid = false;
      } else {
        this._clearError(field);
      }
    });

    if (this.consentCheckbox && !this.consentCheckbox.checked) {
      this._showError(this.consentCheckbox, 'Необходимо согласие на обработку данных');
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = this.form.querySelector('.form__field--error input, .form__field--error select, .form__field--error textarea');
      if (firstInvalid) firstInvalid.focus();
    }

    return isValid;
  }

  _showError(field, message) {
    const fieldWrapper = field.closest('.form__field') || field.parentElement;
    if (fieldWrapper) {
      fieldWrapper.classList.add('form__field--error');
    }

    const errorEl = this.form.querySelector(`[data-error-for="${field.name}"]`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      field.setAttribute('aria-describedby', errorEl.id || field.name + '-error');
      if (!errorEl.id) errorEl.id = field.name + '-error';
    }

    field.setAttribute('aria-invalid', 'true');
  }

  _clearError(field) {
    const fieldWrapper = field.closest('.form__field') || field.parentElement;
    if (fieldWrapper) {
      fieldWrapper.classList.remove('form__field--error');
    }

    const errorEl = this.form.querySelector(`[data-error-for="${field.name}"]`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }

    field.removeAttribute('aria-invalid');
  }

  _showStatus(message, isError = false) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.hidden = false;
    this.status.classList.toggle('form__status--error', isError);
    this.status.classList.toggle('form__status--success', !isError);
    this.status.setAttribute('aria-live', 'polite');
    this.status.setAttribute('role', 'alert');
  }

  _clearStatus() {
    if (!this.status) return;
    this.status.textContent = '';
    this.status.hidden = true;
    this.status.classList.remove('form__status--error', 'form__status--success');
  }

  _onSubmit(event) {
    event.preventDefault();
    this._clearStatus();

    if (!this.validate()) return;

    this._showStatus(DEMO_MESSAGE, false);
  }
}

export default function initForms() {
  document.querySelectorAll('[data-form]').forEach(form => {
    new FormHandler(form);
  });
}