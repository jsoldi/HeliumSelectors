function makePreview(html, maxLength) {
	var clean = txt => txt.replace(/(\r\n|\n|\r)/gm, '').replace('\t', ' ').replace(/ +/g, ' ');

	if (html.length <= maxLength)
		return clean(html);

    var temp = document.createElement('template');
    temp.innerHTML = html;

	if (temp.content.children.length > 0) {
		var child = temp.content.children[0];

		if (child.outerHTML.length > maxLength)
			child.textContent = '\u2026';

		return clean(child.outerHTML);
	}
	else
		return clean(body.innerHTML);
}

function injectEval(script) { 
	return new Promise((a, r) => chrome?.devtools?.inspectedWindow?.eval(script, { useContentScriptContext: true }, (result, ex) => ex?.value ? r(ex.value) : a(result))); 
}

function assignScript(buttonId, script, callback) {
	$(`#${buttonId}`).addEventListener('click', async function () { 
		var result = await injectEval(script);

		if (callback)
			callback(result);
	});	
}

window.addEventListener('load', function(){
	var panelVisible = false
	var kindInfo = null;

	var updateInject = () => injectEval(`window.actions.update(${$('#selecting').checked && panelVisible}, ${JSON.stringify(kindInfo)})`);

	chrome.runtime?.onMessage.addListener(function (msg, sender, reply) {
		if (chrome.devtools.inspectedWindow.tabId === msg.inspectedTabId || chrome.devtools.inspectedWindow.tabId === sender?.tab?.id) {
		    switch (msg.name) {
		   		case 'pageLoad':
		   			updateInject();
		   			break;
		   		case 'panelShown':
		   			if (!panelVisible) {
		   				panelVisible = true;
		   				updateInject();
		   			}
		   			break;
		   		case 'panelHidden':
		   			if (panelVisible) {
		   				panelVisible = false;
		   				updateInject();
		   			}
		   			break;
		    	case 'previewChanged':
					$('#preview').innerText = msg.value.map(html => makePreview(html, 300)).join('\n');
					hljs.highlightBlock($('#preview'));
					$('#footer').innerText = `${msg.value.length} Elements Selected`;
		    		break;
		    	case 'getKindInfo':
		    		reply(kindInfo);
		    		break;
		    	case 'setUpdatedInfo':
		    		kindInfo = msg.value.kindInfo;
					$('#css').innerText = msg.value.css;
					hljs.highlightBlock($('#css'));
		    		break;
		    }
		}
	});

	Theme.init();
	Checkbox.init();

	$('#selecting').addEventListener('checked', updateInject);
	
	assignScript('selectSimilar', 'window.actions.selectSimilar()');
	assignScript('selectInspected', 'window.actions.addElement($0)');

	assignScript('selectParent', 'window.actions.selectParent()');
	assignScript('selectChild', 'window.actions.selectChild()');
	assignScript('selectPrevious', 'window.actions.selectPrevious()');
	assignScript('selectNext', 'window.actions.selectNext()');

	$('#reset').addEventListener('click', () => { kindInfo = null; updateInject(); });

	$('#css').addEventListener('click', function(e) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(e.currentTarget);
        selection.removeAllRanges();
        selection.addRange(range);
	});

	hljs.highlightBlock($('#preview'));
	hljs.highlightBlock($('#css'));

	window.addEventListener('beforeunload', () => { panelVisible = false; updateInject(); });
	$('#selecting').checked = true;	
});
