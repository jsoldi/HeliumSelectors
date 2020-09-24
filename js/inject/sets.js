window.Sets = (function() {
	var findSmallestSet = function(sets, remaining) {
		return sets.reduce(
			function (acc, cur, index) {
				var remain = [...cur].filter(e => remaining.has(e));
				var len = remain.length;
				return len < acc.len ? { index, remain, len } : acc;
			}, 
			{ len: Infinity }
		);
	};

	var intersect = function(sets) {
	    if (!sets.length) 
	    	return new Set();

	    var i = sets.reduce((m, s, i) => s.size < sets[m].size ? i : m, 0);
	    var smallest = sets[i];
	    var res = new Set();

	    for (let val of smallest)
	        if (sets.every(s => s.has(val)))
	             res.add(val);

	    return res;
	};

	var smallestSets = function(sets) {
		sets = sets.map(s => s instanceof Set ? s : new Set(s));
		var intersection = intersect(sets);
		sets = sets.map(s => new Set([...s].filter(e => !intersection.has(e))));
		var remaining = new Set(sets.map(s => [...s]).flat());
		var result = [];

		do {
			var { index, remain } = findSmallestSet(sets, remaining);
			result.push(index);
			remaining = new Set(remain);
		}
		while (remaining.size !== 0);					

		return result;
	};

	// Goes from [[b, c, b], [a, b], [d, d, e, c]] to [[0, 1], [0, 2], [1, 3, 4]] where a: 2, b: 0, c: 1, d: 3, e: 4
	var enumerate = function(sets) {
		var result = [];
		var map = new Map();

		for (var set of sets) {
			var res = new Set();

			for (var e of set) {
				var index;

				if (!map.has(e)) {
					index = map.size;
					map.set(e, index);
				}
				else
					index = map.get(e);

				res.add(index);
			}

			result.push(res);
		} 

		return result.map(l => [...l].sort());
	}

	// Goes from [[0, 1], [0, 2], [1, 3, 4]] to [[0, 1], [0, 2], [1], [2], [2]]
	var pivot = function(source) {
		var target = [];

		for (var i = 0; i < source.length; i++) {
			for (var n of source[i]) {
				var list = null;

				if (!(list = target[n])) {
					list = [];
					target[n] = list;				
				}

				list.push(i);
			}
		}

		return target;
	};

	// Goes from [[0, 1], [0, 2], [2], [2], [1]] to [[0, 1], [0, 2], [1], [2]]
	var deduplicate = function(sets) {
		return [...new Set(sets.map(t => JSON.stringify(t)))].map(json => JSON.parse(json)).sort(function(a, b) {
		    var len = Math.min(a.length, b.length);

		    for (var i = 0; i < len; i++) {
		    	if (a[i] !== b[i])
		    		return a[i] - b[i];
		    }

		    return a.length - b.length;
		});
	}

	// Goes from [[b, c, b], [a, b], [d, d, e, c]] to [[0, 1], [0, 2], [1, 3]] where a: 2, b: 0, c: 1, d & e: 3
	var normalize = function(sets) {
		var nums = enumerate(sets);
		var piv = pivot(nums);
		var ded = deduplicate(piv);
		var res = pivot(ded);
		return res;
	};

	return {
		smallest: sets => smallestSets(sets),
		normalize: sets => normalize(sets)
	};
})();
