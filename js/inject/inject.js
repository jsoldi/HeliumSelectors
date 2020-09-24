(function(){
	var setKindInfo = function(kindInfo) {
		var css = kindInfo ? Gathering.minifyAndCompile(kindInfo) : null;
		window.___selection.selectElements(css ? document.querySelectorAll(css) : []);
		chrome.runtime.sendMessage({ name: 'setUpdatedInfo', value: { kindInfo, css } });
	};

	var recreateKind = function(selectElements) {
		selectElements();
		setKindInfo(Gathering.createKindInfo(window.___selection.getElements()));
	};

	var updateKindInfo = func => chrome.runtime.sendMessage({ name: 'getKindInfo' }, kindInfo => setKindInfo(func(kindInfo)));

    var selectRelative = getRelative => ___selection.selectElements([...new Set(window.___selection.getElements().map(getRelative).filter(r => !!r))]);

    var addElement = element => updateKindInfo(kindInfo => kindInfo ? 
		Gathering.addToKindInfo(kindInfo, [element]) : 
		Gathering.createKindInfo([element])
	);

	window.actions = {
		selectSimilar: () => updateKindInfo(kindInfo => kindInfo ? Gathering.expandKindInfo(kindInfo) : kindInfo),
		selectParent: () => recreateKind(() => selectRelative(e => e.parentElement)),
		selectChild: () => recreateKind(() => selectRelative(e => e.firstElementChild)),
		selectPrevious: () => recreateKind(() => selectRelative(e => e.previousElementSibling)),
		selectNext: () => recreateKind(() => selectRelative(e => e.nextElementSibling)),
		addElement: element => element && addElement(element),
		update: function (selecting, kindInfo) {
			window.___selecting = selecting;
			setKindInfo(kindInfo ? Gathering.updateKindInfo(kindInfo) : null);
		}
	};

    ___selection.onSelectionChanged = () => chrome.runtime.sendMessage({ name: 'previewChanged', value: ___selection.getElements().map(e => e.outerHTML) });
    ___selection.onSelectingChanged = () => chrome.runtime.sendMessage({ name: 'selectingChanged', value: ___selecting });
    ___selection.onElementSelected = element => addElement(element);

    ___selection.onSelectingChanged();
    chrome.runtime.sendMessage({ name: 'pageLoad' });
})();
