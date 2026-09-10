import initNavigation from './modules/navigation.js';
import initForms from './modules/forms.js';
import initModals from './modules/modal.js';
import initFaq from './modules/faq.js';
import initAnalytics from './modules/analytics.js';
import initFilter from './modules/filter.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initForms();
  initModals();
  initFaq();
  initAnalytics();
  initFilter();
});