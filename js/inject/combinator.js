window.Combinator = (function(){
	function fail(msg) {
		throw new Error(msg);
	}

	function MultiGatherer(gatherers, compile) {
		this.gatherers = gatherers;

		this.gather = function (element) {
			return Object.fromEntries(Object.keys(gatherers).map(function(k) { 
				try {
					return [[k, gatherers[k](element)]]; 
				}
				catch (e) {
					return [];
				}
			}).flat());
		};

		this.compile = compile;
	}

	var element = (function(){
		var gatherAttr = function(filter, e) {
			var entries = Array.from(e.attributes).filter(a => a.name !== 'id').filter(filter).map(a => [a.name, a.value]);
			return entries.length ? Object.fromEntries(entries) : fail('No attributes');
		};

		var fixIdentifier = function(text) {
			return text.replace(/([^a-zA-Z0-9_-])/g, '\\$1'); // TODO: Not good enough
		};

		return new MultiGatherer({
				tag: e => e.tagName,
				id: e => fixIdentifier(e.id || fail('No id')),
				classes: e => e.classList.length ? [...e.classList].map(fixIdentifier) : fail('No classes'),
				valuedAttrs: e => gatherAttr(a => !!a.value, e),
				namedAttrs: e => [...Object.keys(gatherAttr(a => !a.value, e))]
			},
			function(values) {
				var result = '';

				if (values.tag)
					result += values.tag.toLowerCase();

				if (values.id)
					result += '#' + values.id;

				if (values.classes)
					result += Array.from(values.classes).map(c => '.' + c).join('');

				if (values.namedAttrs)
					result += values.namedAttrs.map(k => `[${k}]`).join('');

				if (values.valuedAttrs)
					result += Object.keys(values.valuedAttrs).map(k => `[${k}=${JSON.stringify(values.valuedAttrs[k])}]`).join('');		

				return result;
			}
		);				
	})();

	var pseudo = (function(){
		var getElementIndex = function(node, getSibling) {
		    var index = 0;

		    while (node = getSibling(node))
		        index++;

		    return index;
		};

		var makeBoolean = css => e => e.matches(css) ? true : fail('Element does not match css.');

		return new MultiGatherer({
				['nth-child']: e => getElementIndex(e, e => e.previousElementSibling) + 1,
				['nth-last-child']: e => getElementIndex(e, e => e.nextElementSibling) + 1,
				['first-of-type']: makeBoolean(':first-of-type'),
				['last-of-type']: makeBoolean(':last-of-type'),
				['empty']: makeBoolean(':empty'),
				['not(:empty)']: makeBoolean(':not(:empty)')
			},
			function (values) {
				return Object.keys(this.gatherers)
					.map(k => (function(name, value) {
						switch (typeof value) {
							case 'boolean':
								return value ? `:${name}` : '';
							case 'number':
							case 'string':
								return `:${name}(${value})`;
							default:
								return '';
						}
					})(k, values[k]))
					.join('');		
			}
		);
	})();

	var simple = new (function(){
		this.gather = e => Object.assign(element.gather(e), pseudo.gather(e));
		this.compile = values => values && element.compile(values) + pseudo.compile(values) || '*';
	})();

	var siblings = new MultiGatherer({
			self: e => simple.gather(e || fail('No element')),
			prev: e => simple.gather(e.previousElementSibling || fail('No element'))
		},
		values => values ? (values.prev ? simple.compile(values.prev) + ' + ' : '') + simple.compile(values.self) : '*'
	);

	var combinator = new MultiGatherer({
			0: e => siblings.gather(e || fail('No element')),
			1: e => siblings.gather(e.parentElement || fail('No element')),
			2: e => siblings.gather(e.parentElement.parentElement || fail('No element'))
		},
		values => [...Array(Math.max.apply(null, Object.keys(values)) + 1).keys()].reverse().map(i => siblings.compile(values[i])).join(' > ')
	);

	return combinator;
})();