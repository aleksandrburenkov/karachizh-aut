const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class Navigation {
  constructor() {
    this.toggle = document.querySelector('.header__menu-toggle');
    this.nav = document.getElementById('main-nav');
    this.navLinks = [];
    this.isOpen = false;
    this._onToggle = this._onToggle.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
  }

  init() {
    this.navLinks = this.nav.querySelectorAll('.header__nav-link');
    this.toggle.addEventListener('click', this._onToggle);
  }

  open() {
    this.isOpen = true;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.nav.classList.add('header__nav--open');
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('click', this._onClickOutside);

    if (!prefersReducedMotion()) {
      this.toggle.style.transition = 'none';
      this.nav.style.transition = 'none';
    }

    requestAnimationFrame(() => {
      if (this.navLinks.length > 0) {
        this.navLinks[0].focus();
      }
    });
  }

  close() {
    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.nav.classList.remove('header__nav--open');
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('click', this._onClickOutside);
    this.toggle.focus();
  }

  _onToggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  _onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab' && this.navLinks.length > 0) {
      const first = this.navLinks[0];
      const last = this.navLinks[this.navLinks.length - 1];

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

  _onClickOutside(event) {
    if (!this.nav.contains(event.target) && !this.toggle.contains(event.target)) {
      this.close();
    }
  }
}

export default function initNavigation() {
  const nav = new Navigation();
  if (nav.toggle && nav.nav) {
    nav.init();
  }
}