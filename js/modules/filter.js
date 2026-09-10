export default function initFilter() {
  const filter = document.querySelector('.filter');
  if (!filter) return;

  const tabs = filter.querySelectorAll('.filter__tab');
  const cards = document.querySelectorAll('[data-category]');

  function getActiveTab() {
    return filter.querySelector('.filter__tab[aria-selected="true"]');
  }

  function setActiveTab(tab) {
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');
  }

  function filterCards(category) {
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.hidden = false;
      } else {
        card.hidden = true;
      }
    });
  }

  function activateTab(tab) {
    setActiveTab(tab);
    const category = tab.getAttribute('data-filter');
    if (category) {
      filterCards(category);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab);
    });
  });

  filter.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Enter', ' '].includes(event.key)) return;

    const currentTab = document.activeElement;
    if (!currentTab || !currentTab.classList.contains('filter__tab')) return;

    event.preventDefault();

    if (event.key === 'Enter' || event.key === ' ') {
      activateTab(currentTab);
      return;
    }

    const tabArray = Array.from(tabs);
    const currentIndex = tabArray.indexOf(currentTab);
    let nextIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabArray.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
    }

    if (nextIndex !== undefined) {
      tabArray[nextIndex].focus();
    }
  });

  const activeTab = getActiveTab();
  if (activeTab) {
    const category = activeTab.getAttribute('data-filter');
    if (category) {
      filterCards(category);
    }
  }
}