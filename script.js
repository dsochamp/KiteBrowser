let landingpage = 'https://google.com';
let searchBoxContent = document.getElementById('search');
const tabs = [{ title: 'Home' , domain: landingpage, history: [landingpage], historyIndex: 0}];
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
        tabs.push({ title: 'Tab 1', domain: landingpage, history: [landingpage], historyIndex: 0});
      }

      if (index <= activeTabIndex) {
        activeTabIndex = Math.max(0, activeTabIndex - 1);
      }

      if (activeTabIndex >= tabs.length) {
        activeTabIndex = tabs.length - 1;
      }

      let tabWidth = 100 / tabs.length;

      document.documentElement.style.setProperty('--tab-width', `${tabWidth}vw`);

      window.electronAPI.switchTab({
        number: activeTabIndex
      });

      window.electronAPI.closeTab({
        number: activeTabIndex
      });

      renderTabs();
    });

    tabEl.addEventListener('click', () => {
      activeTabIndex = index;
      const searchBox = document.getElementById('search');
      searchBox.value = tabs[activeTabIndex].domain;
      window.electronAPI.switchTab({
        number: activeTabIndex
      });
      renderTabs();
    });

    tabEl.append(icon, label, close);
    tabBar.appendChild(tabEl);

  });

}

function addTab() {
  const nextNumber = tabs.length + 1;
  tabs.push({ title: `Tab ${nextNumber}`, domain: landingpage, history: [landingpage], historyIndex: 0});
  window.electronAPI.addTab({
    boolean: true,
    number: activeTabIndex
  });
  window.electronAPI.searchDomain({
    domain: landingpage 
  });
  activeTabIndex = tabs.length - 1;
  searchBoxContent.value = '';
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

document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById("refresh");
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      window.electronAPI.reloadPage();
    })
  }

  renderTabs();

  const observer = new ResizeObserver(updateWebViewSize);

  observer.observe(page);

  updateWebViewSize();
});

document.addEventListener('keydown', (event) => {

  if (event.key === 'Enter') {
    if (document.activeElement === searchBoxContent) {

      let searchQuery = searchBoxContent.value.trim();

      if (searchQuery.includes(' ')) {
        searchQuery = 'https://google.com/search?q=' + searchQuery.replaceAll(' ', '+');
      } else if ((!searchQuery.startsWith('https://') && !searchQuery.startsWith('http://') && !searchQuery.startsWith('localhost:')) && searchQuery.includes('.')) {
        searchQuery = 'https://' + searchQuery;
        tabs[activeTabIndex].title = searchQuery.split('/')[2];
      } else if (!searchQuery.startsWith('https://') && !searchQuery.startsWith('http://') && !searchQuery.startsWith('file:///')) {
        searchQuery = 'https://google.com/search?q=' + searchQuery;
      }

      window.electronAPI.searchDomain({
        domain: searchQuery,
        number: activeTabIndex
      });

      const tab = tabs[activeTabIndex];

      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(searchQuery);
      tab.historyIndex = tab.history.length - 1;
      tab.domain = searchQuery;
      window.electronAPI.getTitle((getTitle) => { 
        const tab = tabs[activeTabIndex]; 
        if (!tab || !getTitle) return 'google.com'; 
        tab.title = getTitle; 
      });
      renderTabs();
    }
  }
});

let backbtn = document.getElementById('back')
backbtn.addEventListener('click', () => {

  const tab = tabs[activeTabIndex];

  const pageBehind = tab.history[tab.historyIndex - 1];

  if (!(pageBehind === undefined)) {
    window.electronAPI.searchDomain({
      domain: pageBehind
    });

    tab.historyIndex -= 1;
    tab.domain = pageBehind;
    searchBoxContent.value = pageBehind;
    window.electronAPI.getTitle((getTitle) => { 
      const tab = tabs[activeTabIndex]; 
      if (!tab || !getTitle) return 'google.com'; 
      tab.title = getTitle; 
    });
  }
});


let forwardbtn = document.getElementById('forward')
forwardbtn.addEventListener('click', () => {

  const tab = tabs[activeTabIndex];

  const pageFront = tab.history[tab.historyIndex + 1];

  if (!(pageFront === undefined)) {
    window.electronAPI.searchDomain({
      domain: pageFront
    });
    
    tab.historyIndex += 1;
    tab.domain = pageFront;
    searchBoxContent.value = pageFront;
    window.electronAPI.getTitle((getTitle) => { 
      const tab = tabs[activeTabIndex]; 
      if (!tab || !getTitle) return 'google.com'; 
      tab.title = getTitle; 
    });
  }
});

window.electronAPI.trafficlightsChanged((isFullscreen) => {
  const tabRow = document.querySelector(".tab-row")

  if (isFullscreen) {
    tabRow.classList.add("fullscreen")
  } else {
    tabRow.classList.remove("fullscreen")
  }
})

window.electronAPI.URLchanged((URLchanged) => {
  const tab = tabs[activeTabIndex];

  if (!tab || !URLchanged) return;

  window.electronAPI.getTitle((getTitle) => { 
    const tab = tabs[activeTabIndex]; 
    if (!tab || !getTitle) return 'google.com'; 
    tab.title = getTitle; 
  });

  tab.domain = URLchanged;
  searchBoxContent.value = URLchanged;
  renderTabs();
});

window.electronAPI.getTitle((getTitle) => {
  const tab = tabs[activeTabIndex];

  if (!tab || !getTitle) return;

  tab.title = getTitle;
});

window.electronAPI.openNewTab((url) => {
    const nextNumber = tabs.length + 1;

    tabs.push({
        title: 'loading title...',
        domain: url,
        history: [url],
        historyIndex: 0
    });

    window.electronAPI.getTitle((getTitle) => { 
      const tab = tabs[activeTabIndex]; 
      if (!tab || !getTitle) return 'google.com'; 
      tabs[-1].title = getTitle; 
    });

    activeTabIndex = tabs.length - 1;

    window.electronAPI.addTab({
        boolean: true,
        domain: url
    });

    searchBoxContent.value = url;

    renderTabs();
});