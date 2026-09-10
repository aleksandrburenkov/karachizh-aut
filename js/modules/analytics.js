export default function initAnalytics() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-analytics]');
    if (!target) return;

    const eventName = target.getAttribute('data-analytics');
    if (!eventName) return;

    const label = target.getAttribute('data-analytics-label') || '';
    const category = target.getAttribute('data-analytics-category') || 'interaction';

    console.log(`[Analytics] Event: ${eventName} | Category: ${category}${label ? ' | Label: ' + label : ''} | Page: ${window.location.pathname}`);
  });
}