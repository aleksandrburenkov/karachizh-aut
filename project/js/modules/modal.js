const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

class Modal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.isOpen = false;
    this.previousActiveElement = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);
  }

  open(trigger) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.previousActiveElement = trigger || document.activeElement;
    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._onKeyDown);
    this.modal.addEventListener('click', this._onOverlayClick);

    this._handleMotion();
    this._trapFocus();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKeyDown);
    this.modal.removeEventListener('click', this._onOverlayClick);

    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }
  }

  _handleMotion() {
    if (prefersReducedMotion()) {
      this.modal.style.transition = 'none';
    } else {
      this.modal.style.transition = '';
    }
  }

  _getFocusableElements() {
    return Array.from(this.modal.querySelectorAll(FOCUSABLE_SELECTOR));
  }

  _trapFocus() {
    const focusable = this._getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      this.modal.focus();
    }
  }

  _onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = this._getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  _onOverlayClick(event) {
    if (event.target === this.modal) {
      this.close();
    }
  }
}

const modals = new Map();

export default function initModals() {
  document.querySelectorAll('.modal').forEach(modalEl => {
    const id = modalEl.id || `modal-${Math.random().toString(36).slice(2, 8)}`;
    if (!modalEl.id) modalEl.id = id;
    modals.set(id, new Modal(modalEl));
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-modal-open]');
    if (!trigger) return;

    event.preventDefault();
    const modalId = trigger.getAttribute('data-modal-open');
    const modalInstance = modals.get(modalId);
    if (modalInstance) {
      modalInstance.open(trigger);
    }
  });

  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('[data-modal-close]');
    if (!closeBtn) return;

    event.preventDefault();
    const modalEl = closeBtn.closest('.modal');
    if (modalEl) {
      const modalInstance = modals.get(modalEl.id);
      if (modalInstance) {
        modalInstance.close();
      }
    }
  });
}