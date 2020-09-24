function $(css) { return document.querySelector(css); }

var Checkbox = (function(){	
	function makeCheckbox(element, uncheckedTooltip, checkedTooltip) {
		var updateTooltip = () => element.setAttribute('data-text', element.checked ? checkedTooltip : uncheckedTooltip);

		Object.defineProperty(element, 'checked', {
			get: () => element.classList.contains('checked'),
			set: function (value) {
				if (element.checked !== value) {
					if (value)
						element.classList.add('checked');
					else
						element.classList.remove('checked');

					updateTooltip();
					element.dispatchEvent(new Event('checked'));		
				}
			}
		});

		element.addEventListener('click', () => element.checked = !element.checked);
		updateTooltip();
		return element;
	}

	function init() {
		for (var cb of document.querySelectorAll('.checkbox'))
			makeCheckbox(cb, cb.getAttribute('data-text-unchecked'), cb.getAttribute('data-text-checked'));
	}

	return { init };
})();

var Theme = (function(){
	function getSystemTheme() {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches)
			return 'dark';
		else if (window.matchMedia('(prefers-color-scheme: light)').matches)
			return 'light';
		else
			return null;
	}

	function getDevtoolsTheme() {
		var theme = chrome?.devtools?.panels?.themeName;

		if (theme === 'dark' || theme === 'darkChromium')
			return 'dark';
		else if (theme === 'light' || theme === 'lightChromium' || theme === 'default')
			return 'light';
		else
			return null;
	}

	function init() {
		var theme = getDevtoolsTheme() || getSystemTheme();

		if (theme)
			document.body.classList.add(theme);
		else
			document.body.classList.add('light');
	}

	return { init };
})();
