chrome.devtools.panels.create("Selectors", "/media/icon/32.png", "/html/panel.html", function (panel) {
	panel.onShown.addListener(() => chrome.runtime.sendMessage({ name: 'panelShown', inspectedTabId: chrome.devtools.inspectedWindow.tabId }));
	panel.onHidden.addListener(() => chrome.runtime.sendMessage({ name: 'panelHidden', inspectedTabId: chrome.devtools.inspectedWindow.tabId }));
});
