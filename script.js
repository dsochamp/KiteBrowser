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
        tabs.push({ title: 'Tab 1' });
      }

      if (index <= activeTabIndex) {
        activeTabIndex = Math.max(0, activeTabIndex - 1);
      }

      if (activeTabIndex >= tabs.length) {
        activeTabIndex = tabs.length - 1;
      }

      renderTabs();
    });

    tabEl.addEventListener('click', () => {
      activeTabIndex = index;
      renderTabs();
    });

    tabEl.append(icon, label, close);
    tabBar.appendChild(tabEl);
  });

}

function addTab() {
  const nextNumber = tabs.length + 1;
  tabs.push({ title: `Tab ${nextNumber}` });
  activeTabIndex = tabs.length - 1;
  renderTabs();
}


tabWidth = 100 / tabs.length;

document.documentElement.style.setProperty('--tab-width', `${tabWidth}vw`);

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

let searchBoxContent = document.getElementById('search');

let searchQuery = searchBoxContent.value

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (document.activeElement === searchBoxContent) {
      if (searchQuery.includes(' ')) {
        searchQuery = 'https://google.com/search?q=' + searchQuery.replaceAll(' ', '+');
        console.log(searchQuery)
      } else if (searchQuery.includes('.') && !searchQuery.startsWith('https://') || !searchQuery.startsWith('http://') || !searchQuery.startsWith('localhost:')) {
        searchQuery = 'https://' + searchQuery
        console.log(searchQuery)
      } else {
        searchQuery = 'https://google.com/search?q=' + searchQuery
        console.log(searchQuery)
      }

      window.electronAPI.searchDomain({
        domain: searchBoxContent
      });
        
      currenttab = searchQuery
      recenttabs.push(searchQuery);
    }
  }
});

document.addEventListener('click', (event) => { 

  let backbtn = document.getElementById('back')
  backbtn.addEventListener('click', () => {
    window.electronAPI.backPage({
      domain: recenttabs[(recenttabs.indexOf(currenttab) - 1)]
    });
    searchBoxContent.value = recenttabs[(recenttabs.indexOf(currenttab) - 1)];

    currenttab = recenttabs[(recenttabs.indexOf(currenttab) - 1)];
  });
});
