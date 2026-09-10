const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class Faq {
  constructor(container) {
    this.container = container;
    this.questions = container.querySelectorAll('.faq__question');
    this._onClick = this._onClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onDetailsToggle = this._onDetailsToggle.bind(this);

    this._initButtons();
    this._initDetails();
  }

  _initButtons() {
    this.questions.forEach(question => {
      question.addEventListener('click', this._onClick);
      question.addEventListener('keydown', this._onKeyDown);
    });
  }

  _initDetails() {
    const detailsElements = this.container.querySelectorAll('details.faq__details');
    detailsElements.forEach(details => {
      if (prefersReducedMotion()) {
        details.style.transition = 'none';
      }
      details.addEventListener('toggle', this._onDetailsToggle);
    });
  }

  _toggle(question) {
    const answer = question.nextElementSibling;
    if (!answer || !answer.classList.contains('faq__answer')) return;

    const isExpanded = question.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      question.setAttribute('aria-expanded', 'false');
      answer.hidden = true;
    } else {
      this.questions.forEach(other => {
        if (other !== question) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.nextElementSibling;
          if (otherAnswer && otherAnswer.classList.contains('faq__answer')) {
            otherAnswer.hidden = true;
          }
        }
      });

      question.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  }

  _onClick(event) {
    event.preventDefault();
    this._toggle(event.currentTarget);
  }

  _onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._toggle(event.currentTarget);
    }
  }

  _onDetailsToggle(event) {
    const details = event.target;
    if (!prefersReducedMotion()) return;

    const summary = details.querySelector('summary');
    if (summary) {
      summary.style.transition = 'none';
    }
  }
}

export default function initFaq() {
  document.querySelectorAll('.faq').forEach(faq => new Faq(faq));
}