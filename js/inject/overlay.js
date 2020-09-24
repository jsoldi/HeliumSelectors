(function () {
    if (!window.___overlayInjected) {
        window.___overlayInjected = true;
        var elementsCreated = false;
        var selecting = false;
        var overlayDiv = null;
        var mouseDiv = null;
        var htmlDiv = null;
        var tagNameSpan = null;
        var idSpan = null;
        var classSpan = null;
        var selectionFooter = null;
        var resizeInterval = null;
        var tempStyleStackName = 'md928sdy4tqo';
	    var ignoreClassName = '_n4waStD3fu5G';

		var upperTag = function (element) {
		    return element.nodeType === 1 ? element.tagName.toUpperCase() : "HS-NODE";
		};
			        
	    var getFrameDocument = function (frame) {
	        try {
	            return frame.contentDocument;
	        } catch (err) {
	            return null;
	        }
	    };

	    var getFrameDocumentElement = function (frame) {
	        var doc = getFrameDocument(frame);
	        return doc ? doc.documentElement : null;
	    };

	    var getChildren = function (parent, expectElements) {
	        if (upperTag(parent) === 'IFRAME')
	            parent = getFrameDocumentElement(parent);

	        if (parent)
	            return expectElements ? parent.children : parent.childNodes;
	        else
	            return [];
	    };

	    var isIgnoreClass = function (node) {
	        if (node.nodeType !== 1)
	            return false;

	        return node.classList.contains(ignoreClassName);
	    };

        var setTempStyle = function (element, name, value) {
            try {
                if (!element[tempStyleStackName])
                    element[tempStyleStackName] = [];

                if (element.getAttribute('style') === null)
                    element[tempStyleStackName].___wasNull = true;

                var oldValue = element.style[name];
                element[tempStyleStackName].push(() => element.style[name] = oldValue);
                element.style[name] = value;
            }
            catch (e) {
                // Do nothing
            }
        };

        var unsetTempStyles = function (element) {
            try {
                if (element[tempStyleStackName]) {
                    while (element[tempStyleStackName].length)
                        element[tempStyleStackName].pop()();

                    if (element[tempStyleStackName].___wasNull && !element.getAttribute('style'))
                        element.removeAttribute('style');

                    delete element[tempStyleStackName];
                }
            }
            catch (e) {
                // Do nothing
            }
        };

        var fixZIndexes = function (element) {
            try {
                if (element.style.visibility !== 'hidden' && !element.classList.contains(ignoreClassName)) {
                    var style = element.ownerDocument.defaultView.getComputedStyle(element);
                    var zIndex = style['z-index'];

                    if (zIndex && zIndex !== 'auto') {
                        var value = parseInt(zIndex);

                        if (value >= 2147483640)
                            setTempStyle(element, 'z-index', (value - 8).toString());
                    }
                }
            }
            catch (e) {
                // Do nothing
            }

            for (var child of getChildren(element, true))
                fixZIndexes(child);
        };

        var unsetAllTempStyles = function (element) {
            try {
                unsetTempStyles(element);
            }
            catch (e) {
                // Do nothing
            }

            for (var child of getChildren(element, true))
                unsetAllTempStyles(child);
        };

        var onResize = function () {
            selection.followElements();
        };

        var selection = new (function () {
            var className = '_yMm5Rfp3icM2';
            var visible = false;
            var pauseChangeNotificationRequests = 0;
            var map = new Map(); // Maps selected elements to divs
            var _highlightedElement = null;

            var getVisibility = function () {
                return visible ? 'visible' : 'hidden';
            };

            var onSelectionChanged = function () {
                if (pauseChangeNotificationRequests === 0 && window.___selection.onSelectionChanged) {
                    window.___selection.onSelectionChanged();
                }
            };

            Object.defineProperty(this, 'ignoredClass', { get: function () { return ignoreClassName } });
            Object.defineProperty(this, 'className', { get: function () { return className; } });

            Object.defineProperty(this, "length", {
                get: function () {
                    return map.size;
                }
            });

            Object.defineProperty(this, 'visible', {
                get: function () {
                    return visible;
                },
                set: function (value) {
                    if (value !== visible) {
                        visible = !!value;

                        for (var div of map.values())
                            div.style.visibility = getVisibility();
                    }
                }
            });

            Object.defineProperty(this, 'highlightedElement', {
                get: () => _highlightedElement,
                set: element => {
                    if (element) {
                        var rect = getAbsoluteRect(element);
                        setElementLocation(mouseDiv, rect);
                        htmlDiv.style.visibility = 'visible';

                        tagNameSpan.textContent = upperTag(element).toLowerCase();

                        if (element.id)
                            idSpan.textContent = "#" + element.id;
                        else
                            idSpan.textContent = "";

                        classSpan.textContent = [...element.classList || []].map(c => '.' + c).join('');

                        var scrollLeft = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                        htmlDiv.style.left = Math.min(rect.left, scrollLeft + document.documentElement.clientWidth - htmlDiv.scrollWidth) + 'px';

                        if ((rect.top - htmlDiv.offsetHeight) < document.body.scrollTop)
                            htmlDiv.style.top = (rect.top + rect.height) + 'px';
                        else
                            htmlDiv.style.top = (rect.top - htmlDiv.offsetHeight) + 'px';
                    }
                    else {
                        htmlDiv.style.visibility = 'hidden';
                        moveOffScreen(mouseDiv);
                    }

                    _highlightedElement = element;
                }
            });

            this.getElements = function () {
                return [...map.keys()];
            };

            this.contains = function (element) {
                return map.has(element);
            };

            this.makeChanges = function (func) {
                pauseChangeNotificationRequests++;

                try {
                    func.apply(this);
                }
                finally {
                    pauseChangeNotificationRequests--;
                    onSelectionChanged();
                }
            };

            this.followElements = function () {
                for (var kvp of map)
                    setElementLocation(kvp[1], getAbsoluteRect(kvp[0]));
            };

            this.add = function (element) {
                if (!this.contains(element)) {
                    var div = document.createElement('div');
                    div.classList.add(ignoreClassName);
                    div.classList.add(className);
                    div.style.visibility = getVisibility();
                    setElementLocation(div, getAbsoluteRect(element));
                    document.documentElement.appendChild(div);
                    map.set(element, div);
                    onSelectionChanged();
                    return true;
                }
                else
                    return false;
            };

            this.remove = function (element) {
                if (this.contains(element)) {
                    var div = map.get(element);
                    document.documentElement.removeChild(div);
                    map.delete(element);
                    onSelectionChanged();
                    return true;
                }
                else
                    return false;
            };

            this.clear = function () {
                if (map.size > 0) {
                    this.makeChanges(function () {
                        var elements = this.getElements();

                        for (var i = 0, len = elements.length; i < len; i++)
                            this.remove(elements[i]);
                    });
                }
            };

            this.selectElements = function (elements) {
                this.makeChanges(function () {
                    this.clear();

                    for (var i = 0, len = elements.length; i < len; i++)
                        this.add(elements[i]);
                });
            };
        })();

        var getViewportRect = function (element) {
            var clientRect = null;

            if (element.nodeType === 1) {
                clientRect = element.getBoundingClientRect();
            }
            else {
                var range = document.createRange();
                range.selectNode(element);
                clientRect = range.getBoundingClientRect();

                if (range.detach)
                    range.detach();
            }

            return clientRect;
        };

        var getAbsoluteViewRect = function (element) {
            var rect = getViewportRect(element);

            if (element.ownerDocument !== document) {
                var frameRect = getAbsoluteViewRect(element.ownerDocument.defaultView.frameElement);

                return {
                    top: frameRect.top + rect.top,
                    left: frameRect.left + rect.left,
                    width: rect.width,
                    height: rect.height
                };
            }
            else
                return rect;
        };

        var getAbsoluteRect = function (element) {
            var viewRect = getAbsoluteViewRect(element);

            return {
                top: viewRect.top + window.pageYOffset,
                left: viewRect.left + window.pageXOffset,
                width: viewRect.width,
                height: viewRect.height
            };
        };

        var setElementLocation = function (element, rect) {
            element.style.left = "" + rect.left + "px";
            element.style.top = "" + rect.top + "px";
            element.style.width = "" + rect.width + "px";
            element.style.height = "" + rect.height + "px";
        };

        var moveOffScreen = function (element) {
            setElementLocation(element, { top: -100, left: -100, width: 0, height: 0 });
        };

        var isPointInRect = function (p, r) {
            return p.x > r.left && p.y > r.top && p.x < (r.left + r.width) && p.y < (r.top + r.height);
        };

        var getElementUnderPoint = function (parentDocument, viewX, viewY, findTextNodes) {
            var elements = parentDocument.elementsFromPoint(viewX, viewY);

            for (var i = 0, len = elements.length; i < len; i++) {
                var el = elements[i];
                if (!isIgnoreClass(el)) {
                    if (upperTag(el) === 'IFRAME') {
                        var doc = getFrameDocument(el);

                        if (doc) {
                            var frameRect = el.getBoundingClientRect();
                            var frameX = viewX - frameRect.left;
                            var frameY = viewY - frameRect.top;
                            var innerElement = getElementUnderPoint(doc, frameX, frameY, findTextNodes);

                            if (innerElement)
                                return innerElement;
                        }
                    }
                    else if (findTextNodes && el.childNodes.length > 1 && el.childNodes.length !== el.children.length) {
                        var parentRect = getViewportRect(el);

                        for (var n = 0, nl = el.childNodes.length; n < nl; n++) {
                            var node = el.childNodes[n];

                            if (node.nodeType === 3) {
                                var childRect = getViewportRect(node);

                                if ((node.data || "").trim() && isPointInRect({ x: viewX, y: viewY }, childRect)) {
                                    if (childRect.width !== parentRect.width || childRect.height !== parentRect.height) {
                                        return node;
                                    }
                                }
                            }
                        }
                    }

                    return el;
                }
            }

            return null;
        };

        var textNodesUnder = function (el) {
            var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            while (n = walk.nextNode())
                a.push(n);
            return a;
        };

        var mousemoveHandler = function (e) {
            if (selecting) {
                var viewX = e.pageX - window.pageXOffset;
                var viewY = e.pageY - window.pageYOffset;
                var element = getElementUnderPoint(document, viewX, viewY, false);
                ___selection.highlightedElement = element;
            }
        };

        var mouseleaveHandler = function (e) {
            if (selecting)
                ___selection.highlightedElement = null;
        };

        var mousedownHandler = function (e) {
            if (selecting && e.button === 0 && ___selection.highlightedElement && ___selection.onElementSelected) {
            	___selection.onElementSelected(___selection.highlightedElement);
            }
        };

        Object.defineProperty(window, '___selection', { get: function () { return selection; } });

        Object.defineProperty(window, '___selecting', {
            get: function () { return selecting; },
            set: function (val) {
                if (val !== selecting) {
                    selecting = val;

                    if (selecting) {
                        if (!elementsCreated) {
                            elementsCreated = true;
                            var style = document.createElement('style');
                            overlayDiv = document.createElement('div');
                            mouseDiv = document.createElement('div');
                            htmlDiv = document.createElement('div');
                            selectionFooter = document.createElement('div');
                            tagNameSpan = document.createElement('span');
                            idSpan = document.createElement('span');
                            classSpan = document.createElement('span');

                            window.___overlayDiv = overlayDiv;

                            // TODO: Change these IDs:
                            overlayDiv.id = 'overlayDiv';
                            mouseDiv.id = 'mouseDiv';
                            htmlDiv.id = 'htmlDiv';
                            tagNameSpan.id = 'tagNameSpan';
                            idSpan.id = 'idSpan';
                            classSpan.id = 'classSpan';
                            selectionFooter.id = 'selectionFooter';

                            overlayDiv.classList.add(ignoreClassName);
                            mouseDiv.classList.add(ignoreClassName);
                            htmlDiv.classList.add(ignoreClassName);
                            tagNameSpan.classList.add(ignoreClassName);
                            idSpan.classList.add(ignoreClassName);
                            classSpan.classList.add(ignoreClassName);
                            selectionFooter.classList.add(ignoreClassName);

                            htmlDiv.appendChild(tagNameSpan);
                            htmlDiv.appendChild(idSpan);
                            htmlDiv.appendChild(classSpan);

                            var css = "";
                            css += "#overlayDiv	{ position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index:2147483640; background-color: #A09670; opacity: 0.25 }";
                            css += "#mouseDiv { position: absolute; top: 0px; left: 0px; width: 0px; height: 0px; z-index: 2147483641; background-color: #43B; opacity: 0.5; }";
                            css += "." + selection.className + " { box-sizing: content-box; position: absolute; top: 0px; left: 0px; width: 0px; height: 0px; z-index: 2147483642; border: 3px solid #6600ff; border-radius: 3px 3px 3px 3px; margin-top: -3px; margin-left: -3px }";
                            css += "#htmlDiv { display: inline-block; position: absolute; top: 0px; left: -500px; z-index: 2147483643; background-color: #333740; font: 12px Consolas; padding-right: 8px; padding-left: 8px; padding-top: 3px; padding-bottom: 3px; }";
                            css += "#tagNameSpan { color: #ee78e6 }";
                            css += "#idSpan { color: #ffab66 }";
                            css += "#classSpan { color: #88c8ef }";
                            css += "#selectionFooter { left: -500px; animation:footerMessage 0.5s 1; animation-fill-mode: forwards; animation-delay:2s; display: inline-block; position: fixed; bottom:0%; background-color: #333740; color: #FFF; font: 12px Consolas; padding-right: 8px; padding-left: 8px; padding-top: 3px; padding-bottom: 3px }";
                            css += "@keyframes footerMessage { from {opacity :1;} to {opacity :0;} }";

                            style.textContent = css;
                            document.head.appendChild(style);
                            document.documentElement.appendChild(selectionFooter);
                            document.documentElement.appendChild(overlayDiv);
                            document.documentElement.appendChild(mouseDiv);
                            document.documentElement.appendChild(htmlDiv);
                        }

                        document.addEventListener("mousemove", mousemoveHandler);
                        document.addEventListener("mouseleave", mouseleaveHandler);
                        document.addEventListener("mousedown", mousedownHandler);

                        overlayDiv.style.visibility = 'visible';
                        mouseDiv.style.visibility = 'visible';
                        selectionFooter.style.visibility = 'visible';
                        selection.visible = true;

                        if (resizeInterval === null)
                            resizeInterval = setInterval(() => onResize(), 500);

                        window.addEventListener('resize', onResize);
                        onResize();

                        setTimeout(() => fixZIndexes(document.documentElement), 1);
                    }
                    else {
                        document.removeEventListener("mousemove", mousemoveHandler);
                        document.removeEventListener("mouseleave", mouseleaveHandler);
                        document.removeEventListener("mousedown", mousedownHandler);

                        moveOffScreen(mouseDiv);
                        overlayDiv.style.visibility = 'hidden';
                        mouseDiv.style.visibility = 'hidden';
                        htmlDiv.style.visibility = 'hidden';
                        selectionFooter.style.visibility = 'hidden';
                        selection.visible = false;
                        window.removeEventListener('resize', onResize);

                        if (resizeInterval !== null) {
                            clearInterval(resizeInterval);
                            resizeInterval = null;
                        }

                        setTimeout(() => unsetAllTempStyles(document.documentElement), 1);
                    }

                    if (window.___selection.onSelectingChanged)
                        window.___selection.onSelectingChanged();
                }
            }
        });
    }
})();
