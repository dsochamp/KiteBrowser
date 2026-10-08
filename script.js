let landingpage = 'https://google.com';
const tabs = [{ title: 'Home' , domain: 'https://google.com'}];
let activeTabIndex = 0;

function renderTabs() {
  const tabBar = document.getElementById('tabBar');

  if (!tabBar) return;

  tabBar.innerHTML = '';

  tabs.forEach((tab, index) => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${index === activeTabIndex ? 'active' : ''}`;
    tabEl.setAttribute('role', 'tab');
    tabEl.setAttribute('aria-selected', index === activeTabIndex ? 'true' : 'false');

    const icon = document.createElement('span');
    icon.className = 'tab-icon';
    icon.innerHTML = '<img src="Images/kitelogo.png" alt="Tab icon">';

    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = tab.title;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'tab-close';
    close.setAttribute('aria-label', `Close ${tab.title}`);
    close.innerHTML = '<img src="Images/remove.png" alt="Close tab">';

    close.addEventListener('click', (event) => {
      event.stopPropagation();
      tabs.splice(index, 1);

      if (tabs.length === 0) {
        tabs.push({ title: 'Tab 1', domain: landingpage });
      }

      if (index <= activeTabIndex) {
        activeTabIndex = Math.max(0, activeTabIndex - 1);
      }

      if (activeTabIndex >= tabs.length) {
        activeTabIndex = tabs.length - 1;
      }

      let tabWidth = 100 / tabs.length;

      document.documentElement.style.setProperty('--tab-width', `${tabWidth}vw`);


      renderTabs();
    });

    tabEl.addEventListener('click', () => {
      activeTabIndex = index;
      const searchBox = document.getElementById('search');
      searchBox.value = tabs[activeTabIndex].domain;
      window.electronAPI.searchDomain({
        domain: tabs[index].domain
      });
      renderTabs();

    });

    tabEl.append(icon, label, close);
    tabBar.appendChild(tabEl);

  });

}

function addTab() {
  const nextNumber = tabs.length + 1;
  tabs.push({ title: `Tab ${nextNumber}`, domain: landingpage});
  window.electronAPI.searchDomain({ domain: landingpage });
  activeTabIndex = tabs.length - 1;
  renderTabs();
}

document.addEventListener('DOMContentLoaded', () => {
  const addTabButton = document.getElementById('addTabButton');
  if (addTabButton) {
    addTabButton.addEventListener('click', addTab);
  }

  renderTabs();
});

const page = document.getElementById("pagerender");

function updateWebViewSize() {
  const rect = page.getBoundingClientRect();

  window.electronAPI.setPageBounds({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  });
}

const observer = new ResizeObserver(updateWebViewSize);

observer.observe(page);

updateWebViewSize();

let recenttabs = ['https://google.com'];
let currenttab = '';

document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById("refresh");
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      window.electronAPI.reloadPage();
    })
  }

  renderTabs();
});

document.addEventListener('keydown', (event) => {

  let searchBoxContent = document.getElementById('search');

  if (event.key === 'Enter') {
    if (document.activeElement === searchBoxContent) {

      let searchQuery = searchBoxContent.value.replace('https://', '').replace('localhost:', '').trim();

      if (searchQuery.includes(' ')) {
        searchQuery = 'https://google.com/search?q=' + searchQuery.replaceAll(' ', '+');
      } else if ((!searchQuery.startsWith('https://') || !searchQuery.startsWith('http://') || !searchQuery.startsWith('localhost:')) && searchQuery.includes('.')) {
        searchQuery = 'https://' + searchQuery;
        tabs[activeTabIndex].title = searchQuery.split('/')[2];
      } else {
        searchQuery = 'https://google.com/search?q=' + searchQuery;
      }

      window.electronAPI.searchDomain({
        domain: searchQuery
      });
        
      currenttab = searchQuery;
      recenttabs.push(searchQuery);

      tabs[activeTabIndex].domain = searchQuery;
      renderTabs();
    }
  }
});

let backbtn = document.getElementById('back')
backbtn.addEventListener('click', () => {
  window.electronAPI.backPage({
    domain: recenttabs[(recenttabs.indexOf(currenttab) - 1)]
  });
  searchBoxContent.value = recenttabs[(recenttabs.indexOf(currenttab) - 1)];

  currenttab = recenttabs[(recenttabs.indexOf(currenttab) - 1)];
});
