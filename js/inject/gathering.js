window.Gathering = (function(){
	var union = function(vals1, vals2) {
		if (vals2 == null)
			return vals1;

		if (vals1 == null)
			return vals2;

		if (vals1.constructor.name !== vals2.constructor.name)
			throw new Error('Different value types');

		switch (vals1.constructor.name) {
			case 'Array':
				return [...vals1, ...vals2];
			case 'Object':
				return Object.fromEntries(
					Object.keys(vals1).concat(Object.keys(vals2)).map(k => [k, union(vals1[k], vals2[k])])
				);
			case 'String':
			case 'Boolean':
			case 'Number':
				if (vals1 !== vals2)
					throw new Error(`Values are not equal.`);

				return vals1;
			default:
				throw new Error(`Type not supported: ${vals1.constructor.name}`);
		}
	};

	var intersect = function(vals1, vals2) {
		if (vals1?.constructor?.name && vals2?.constructor?.name) {
			if (vals1.constructor.name !== vals2.constructor.name)
				throw new Error('Different value types');

			switch (vals1.constructor.name) {
				case 'Array':
					var set = vals2.filter(v => vals1.includes(v));

					if (set.length === 0)
						throw new Error('No set matches');

					return set;
				case 'Object':
					var entries = [];

					for (var k of Object.keys(vals1)) {
						try {
							entries.push([k, intersect(vals1[k], vals2[k])]);
						}
						catch (e) { }
					}

					if (entries.length === 0)
						throw new Error('No object matches');

					return Object.fromEntries(entries);
				case 'String':
				case 'Boolean':
				case 'Number':
					if (vals1 !== vals2)
						throw new Error('No match');

					return vals1;
				default:
					throw new Error(`Type not supported: ${vals1.constructor.name}`);
			}
		}
		else
			throw new Error('Empty value');
	};

	var join = kinds => kinds.length ? union(kinds[0], join(kinds.slice(1))) : null;

	var split = (function(){
		var splitIterator = function*(values) {
			switch (values.constructor.name) {
				case 'Array':
					for (var value of values)
						for (var item of split(value))
							yield [item];
					break;							
				case 'Object':
					for (var k of Object.keys(values))
						for (var item of split(values[k]))
							yield { [k]: item };
					break;
				case 'String':
				case 'Boolean':
				case 'Number':
					yield values;
					break;
				default:
					throw new Error(`Type not supported: ${values.constructor.name}`);
			}
		};

		return values => [...splitIterator(values)];
	})();

	var findMissingIndexes = function (oldValues, newValues) {
		var oldItems = split(oldValues).map(JSON.stringify);
		var newSet = new Set(split(newValues).map(JSON.stringify));
		return oldItems.map((item, index) => newSet.has(item) ? [] : [index]).flat();
	};

	var minifyAndCompile = function(kindInfo) {
		var splitKind = split(kindInfo.kind);
		var indexes = Sets.smallest(kindInfo.sets.map(s => new Set(s)));
		var mins = indexes.map(i => splitKind[i]);
		var result = join(mins);
		return Combinator.compile(result);
	};

	var updateKindInfo = function(kindInfo) {
		var splitKind = split(kindInfo.kind);
		var oldSets = kindInfo.sets || splitKind.map(k => []);

		if (splitKind.length !== oldSets.length)
			throw new Error('Sets sizes do not match.');

		var sets = splitKind.map((k, i) => [...oldSets[i], ...document.querySelectorAll(Combinator.compile(k))]);
		var norm = Sets.normalize(sets);

		if (splitKind.length !== norm.length)
			throw new Error('Something failed badly.');

		return { kind: kindInfo.kind, sets: norm };
	};

	var addToKind = function(kind, elements) {
		for (var element of elements) {
			var newValues = Combinator.gather(element);
			kind = intersect(kind, newValues);
		}

		return kind;
	};

	var addToKindInfo = function(kindInfo, elements) {
		if (elements.length) {
			var kind = addToKind(kindInfo.kind, elements);
			var newSets = [...kindInfo.sets];
			findMissingIndexes(kindInfo.kind, kind).reverse().forEach(i => newSets.splice(i, 1));
			var sets = Sets.normalize(newSets);
			return { kind, sets };
		}
		else
			return kindInfo;
	};

	var createKindInfo = function(elements) {
		if (elements.length === 0)
			return null;

		var firstKind = Combinator.gather(elements[0]);
		var kind = addToKind(firstKind, elements.slice(1));
		var kindInfo = updateKindInfo({ kind });
		return kindInfo;
	};

	var findMoreElements = function(kind) {
		var sets = split(kind).map(k => new Set(document.querySelectorAll(Combinator.compile(k))));

		if (sets.length > 1) {
			var ranks = Array.from({ length: sets.length + 1 }, () => new Set());
			var map = new Map();

			for (var set of sets) {
				for (var e of set) {
					var rank = map.get(e);

					if (!rank) {
						map.set(e, 1);
						ranks[1].add(e);
					}
					else {
						map.set(e, rank + 1);
						ranks[rank].delete(e);
						ranks[rank + 1].add(e);
					}
				}
			}

			for (var i = ranks.length - 2; i >= 0; i--) {
				if (ranks[i].size)
					return [...ranks[i]];
			}
		}

		return [];
	};

	return {
		createKindInfo: elements => createKindInfo(elements), 
		addToKindInfo: (kindInfo, elements) => addToKindInfo(kindInfo, elements),
		minifyAndCompile: kindInfo => minifyAndCompile(kindInfo),
		compile: kindInfo => Combinator.compile(kindInfo.kind),
		updateKindInfo: kindInfo => updateKindInfo(kindInfo),
		expandKindInfo: kindInfo => addToKindInfo(kindInfo, findMoreElements(kindInfo.kind))
	};
})();
