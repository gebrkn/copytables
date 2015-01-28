(function () {

    // Settings
    // ---------------------------

    // Minimal scroll speed (scrolls per second).
    var scrollMinSpeed = 30;

    // Maximal scroll speed (scrolls per second). 
    var scrollMaxSpeed = 150;

    // Scroll speed acceleration. 
    var scrollAcceleration = 1.01;

    // Scroll amount, in pixels.
    var scrollAmount = 30;

    // Class for selected cells.
    var clsSelected = "__copytables__A__";

    // Class for dragged over cells.
    var clsDragover = "__copytables__B__";

    // Dummy class for selected cells.
    var clsSelectedMark = "__copytables__C__";

    // Common tools
    // ---------------------------

    // Shortcut for getElementById.
    var $ = function(id) {
        return document.getElementById(id)
    };

    // Add a collection to an array.
    var $A = function(a, coll) {
        Array.prototype.forEach.call(coll, function(x) { a.push(x) });
        return a;
    };

    // Split a string into words.
    var $W = function(str) {
        return (str || "").split(/\s+/);
    };

    // Shortcut for getElementsByTagName.
    var $$ = function(tags, where) {
        var els = [];
        $W(tags).forEach(function(tag) {
            $A(els, (where || document).getElementsByTagName(tag));
        });
        return els;
    };

    // Shortcut for getElementsByClassName.
    var $C = function(cls, where) {
        return $A([], (where || document).getElementsByClassName(cls));
    };

    // Apply a function to an element and each descendant.
    var walk = function(el, fun) {
        if(el.nodeType != 1)
            return;
        fun(el);
        var cs = el.childNodes;
        for(var i = 0; i < cs.length; i++)
            walk(cs[i], fun);
    };

    // Apply a function to given elements within a parent element.
    var each = function(tag, el, fun) {
        if(!tag.push)
            tag = $W(tag);
        if(el.nodeType != 1)
            return;
        if(tag.indexOf(el.nodeName) >= 0) {
            fun(el);
            return;
        }
        var cs = el.childNodes;
        for(var i = 0; i < cs.length; i++)
            each(tag, cs[i], fun);
    };

    // Remove all given elements.
    var removeAll = function(els) {
        els.forEach(function(el) {
            if(el && el.parentNode)
                el.parentNode.removeChild(el);
        });
    };

    // Find closest parent elements with the given tag name (or names).
    var closest = function(el, tags) {
        tags = $W(tags.toLowerCase());
        while(el) {
            if(el.nodeName && tags.indexOf(el.nodeName.toLowerCase()) >= 0)
                return el;
            el = el.parentNode;
        }
        return null;
    };

    // Add a class to the element.
    var addClass = function(el, cls) {
        if(el) {
            var c = $W(el.className);
            if(c.indexOf(cls) < 0)
                c.push(cls);
            el.className = c.join(" ");
        }
    };

    // Remove a class from the element.
    var removeClass = function(el, cls) {
        if(el && el.className) {
            var cname = $W(el.className).filter(function(x) {
                return x != cls;
            }).join(" ");
            if(cname.length)
                el.className = cname;
            else
                el.removeAttribute("class");
        }
    };

    // True if the element has a given class.
    var hasClass = function(el, cls) {
        return el ? $W(el.className).indexOf(cls) >= 0 : false;
    };

    // True if the element can be scrolled.
    var isScrollable = function(el) {
        if(!el || el == document || el == document.body)
            return false;
        var css = document.defaultView.getComputedStyle(el);
        if(!css.overflowX.match(/scroll|auto/) && !css.overflowY.match(/scroll|auto/))
            return false;
        return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    };

    // Closest parent scrollable element.
    var closestScrollable = function(el) {
        while(el) {
            if(isScrollable(el))
                return el;
            el = el.parentNode;
        }
        return null;
    };

    // Get element's bounds.
    var bounds = function(el) {
        var r = el.getBoundingClientRect();
        return [r.left, r.top, r.right, r.bottom];
    };

    // True if two rectangles intersect.
    var intersect = function(a, b) {
        return !(a[0] >= b[2] || a[2] <= b[0] || a[1] >= b[3] || a[3] <= b[1])
    };

    // Transpose a matrix.
    var transpose = function (m) {
        if(!m || !m[0])
            return m;
        return m[0].map(function(_, c) {
            return m.map(function(row) {
                return row[c];
            });
        });
    };

    // Remove outer rows and columns in a matrix that don't match the `keep` criteria.
    var trimMatrix = function(mat, keep) {
        var fun = function(row) {
            return row.some(function(cell) { return keep(cell) });
        };
        mat = mat.filter(fun);
        mat = transpose(mat).filter(fun);
        return transpose(mat);
    };

    // Strip a string.
    var lstrip = function(s) { return s.replace(/^\s+/, "") };
    var rstrip = function(s) { return s.replace(/\s+$/, "") };
    var strip  = function(s) { return lstrip(rstrip(s)) };

    // Selection manipulation
    // ---------------------------

    // Current selection.
    var selection = null;

    // Last handled event.
    var lastEvent = null;

    // True if a cell has a `selected` class.
    var isSelected = function(el) {
        return el ? (el.className || "").indexOf("__copytables__") >= 0 : false;
    };

    // Convert a table to a matrix. Each element of the matrix is either a real cell (`{td:some-cell}`),
    // or a virtual span cell (`{colRef:other, rowRef:other}`)
    var tableMatrix = function(table) {
        var tds = {}, rows = {}, cols = {};

        each("TD TH", table, function(td) {
            var b = bounds(td);
            var c = b[0], r = b[1];
            cols[c] = rows[r] = 1;
            tds[r + "/" + c] = td;
        });

        rows = Object.keys(rows).sort(function(x, y) { return x - y });
        cols = Object.keys(cols).sort(function(x, y) { return x - y });

        var mat = rows.map(function(r) {
            return cols.map(function(c) {
                return tds[r + "/" + c] ?
                { td: tds[r + "/" + c] } :
                { colRef: null, rowRef: null }
            });
        });

        mat.forEach(function(row, r) {
            row.forEach(function(cell, c) {
                if(!cell.td)
                    return;

                var rs = parseInt(cell.td.rowSpan) || 1;
                var cs = parseInt(cell.td.colSpan) || 1;

                for(var i = 1; i < cs; i++) {
                    if(row[c + i])
                        row[c + i].colRef = cell;
                }
                for(var i = 1; i < rs; i++) {
                    if(mat[r + i])
                        mat[r + i][c].rowRef = cell;
                }
            });
        });

        return mat;
    };

    // Remove outer rows and cols from a table that are not selected.
    var trimTable = function(table) {
        var mat = tableMatrix(table);

        mat = trimMatrix(mat, function(cell) {
            return cell.td && isSelected(cell.td);
        });

        mat.forEach(function(row) {
            row.forEach(function(cell) {
                if(cell.td) {
                    cell.td._keep_ = 1;
                    cell.colSpan = cell.rowSpan = 0;
                }
            });
        });

        var remove = [];

        each("TD TH", table, function(td) {
            if(td._keep_ != 1)
                remove.push(td);
            else if(!isSelected(td))
                td.innerHTML = "";
        });

        removeAll(remove);
        remove = [];

        each("TR", table, function(tr) {
            if(!$$("TD TH", tr).length)
                remove.push(tr);
        });

        removeAll(remove);
        remove = [];

        mat.forEach(function(row) {
            row.forEach(function(cell) {
                if(cell.colRef)
                    cell.colRef.colSpan++;
                if(cell.rowRef)
                    cell.rowRef.rowSpan++;
            });
        });

        mat.forEach(function(row) {
            row.forEach(function(cell) {
                if(!cell.td)
                    return;
                cell.td.removeAttribute("colSpan");
                cell.td.removeAttribute("rowSpan");
                if(cell.colSpan) cell.td.colSpan = cell.colSpan + 1;
                if(cell.rowSpan) cell.td.rowSpan = cell.rowSpan + 1;
            });
        });
    };

    // Return selected cells (`all=false`) or the whole table (`all=true') as text-only matrix.
    var selectedTextMatrix = function(table, all) {
        var m = tableMatrix(table).map(function(row) {
            return row.map(function(cell) {
                if(cell.td && (all || isSelected(cell.td)))
                    return strip(cell.td.innerText.replace(/[\r\n]+/g, " "));
                return "";
            });
        });

        return trimMatrix(m, function(cell) {
            return cell.length > 0;
        });
    };

    // Convert relative URIs to absolute.
    var fixRelativeLinks = function(el) {

        function fix(tags, attrs) {
            each(tags, el, function(e) {
                $W(attrs).forEach(function(attr) {
                    if(e.hasAttribute(attr)) {
                        e[attr] = e[attr]; // force Chrome to absolutize links
                    }
                });
            });
        }

        fix("A AREA LINK", "href");
        fix("IMG INPUT SCRIPT", "src longdesc usemap");
        fix("FORM", "action");
        fix("Q BLOCKQUOTE INS DEL", "cite");
        fix("OBJECT", "classid codebase data usemap");
    };

    // Remove excessive whitespace in a html string.
    var reduceWhitespace = function(html) {
        html = html.replace(/\n\r/g, "\n");
        html = html.replace(/\n[ ]+/g, "\n");
        html = html.replace(/[ ]+\n/g, "\n");
        html = html.replace(/\n+/g, "\n");
        return html;
    };

    // Default table cell styles.
    var defaultStyle = {
        "background-image": "none",
        "background-position": "0% 0%",
        "background-size": "auto",
        "background-repeat": "repeat",
        "background-origin": "padding-box",
        "background-clip": "border-box",
        "background-color": "rgba(0, 0, 0, 0)",
        "border-collapse": "separate",
        "border-top": "0px none rgb(0, 0, 0)",
        "border-right": "0px none rgb(0, 0, 0)",
        "border-bottom": "0px none rgb(0, 0, 0)",
        "border-left": "0px none rgb(0, 0, 0)",
        "caption-side": "top",
        "clip": "auto",
        "color": "rgb(0, 0, 0)",
        "content": "",
        "counter-increment": "",
        "counter-reset": "",
        "direction": "ltr",
        "empty-cells": "show",
        "float": "none",
        "font-family": "Times",
        "font-size": "16px",
        "font-style": "normal",
        "font-variant": "normal",
        "font-weight": "normal",
        "letter-spacing": "normal",
        "line-height": "normal",
        "list-style": "disc outside none",
        "margin": "0px",
        "outline": "rgb(0, 0, 0) none 0px",
        "overflow": "visible",
        "padding": "1px",
        "table-layout": "auto",
        "text-align": "start",
        "text-decoration": "none solid rgb(0, 0, 0)",
        "text-indent": "0px",
        "text-transform": "none",
        "vertical-align": "middle",
        "visibility": "visible",
        "white-space": "normal",
        "word-spacing": "0px",
        "z-index": "auto"
    };

    var defaultStyleProps = Object.keys(defaultStyle);

    // Get actual element style.
    var getStyle = function(el) {
        var computed = window.getComputedStyle(el), style = [];

        defaultStyleProps.forEach(function(p) {
            var val = computed[p];

            // round floating-point pixel values
            val = val.replace(/\b([\d.]+)px\b/g, function(_, $1) {
                return Math.round(parseFloat($1)) + "px";
            });

            if(val != defaultStyle[p]) {
                style.push(p + ":" + val);
            }
        });

        if(computed["display"] == "none") {
            style.push("display:none");
        }

        return style.join(";");
    };

    // Return selected cells (`all=false`) or the whole table (`all=true')
    // as html.
    var selectedHTML = function(table, withCSS, all) {

        each("TD TH", table, function(td) {
            if(hasClass(td, clsSelected)) {
                removeClass(td, clsSelected);
                addClass(td, clsSelectedMark);
            }
        });

        var styles = [];
        walk(table, function(el) {
            styles.push(getStyle(el));
        });

        var frame = document.createElement("IFRAME");
        document.body.appendChild(frame);
        var fdoc = frame.contentDocument;

        var base = fdoc.createElement("BASE");
        base.setAttribute("href", document.location);
        fdoc.body.appendChild(base);

        fdoc.body.appendChild(fdoc.importNode(table, true));
        var ftable = fdoc.body.lastChild;

        walk(ftable, function(el) {
            if(withCSS)
                el.style.cssText = styles.shift();
            else
                el.style = "";
        });

        if(!all) {
            trimTable(ftable);
        }

        each("TD TH", ftable, function(td) {
            removeClass(td, clsSelectedMark);
        });

        fixRelativeLinks(ftable);
        fdoc.body.removeChild(fdoc.body.firstChild);

        var html = fdoc.body.innerHTML;

        each("TD TH", table, function(td) {
            if(hasClass(td, clsSelectedMark)) {
                removeClass(td, clsSelectedMark);
                addClass(td, clsSelected);
            }
        });

        document.body.removeChild(frame);

        return reduceWhitespace(html);
    };

    // Scrolling
    // ---------------------------

    // Scroll timer.
    var scrollTimer = 0;

    // Periodic scroll checker.
    var scrollWatch = function() {
        if(!selection) {
            return;
        }

        if(selection.scrollBase) {

            var sx = selection.scrollBase.scrollLeft, sy = selection.scrollBase.scrollTop;
            var w = selection.scrollBase.clientWidth, h = selection.scrollBase.clientHeight;
            var b = bounds(selection.scrollBase);
            var cx = lastEvent.clientX - b[0];
            var cy = lastEvent.clientY - b[1];


            if(cx < scrollAmount) sx -= scrollAmount;
            if(cx > w - scrollAmount) sx += scrollAmount;
            if(cy < scrollAmount) sy -= scrollAmount;
            if(cy > h - scrollAmount) sy += scrollAmount;

            selection.scrollBase.scrollLeft = sx;
            selection.scrollBase.scrollTop = sy;


        } else {

            // scroll window

            var sx = window.scrollX, sy = window.scrollY;
            var w = window.innerWidth, h = window.innerHeight;
            var cx = lastEvent.clientX;
            var cy = lastEvent.clientY;


            if(cx < scrollAmount) sx -= scrollAmount;
            if(cx > w - scrollAmount) sx += scrollAmount;
            if(cy < scrollAmount) sy -= scrollAmount;
            if(cy > h - scrollAmount) sy += scrollAmount;

            if(sx != window.scrollX || sy != window.scrollY) {
                window.scrollTo(sx, sy);
            }
        }

        selection.scrollSpeed *= scrollAcceleration;
        if(selection.scrollSpeed > scrollMaxSpeed)
            selection.scrollSpeed = scrollMaxSpeed;

        scrollTimer = setTimeout(scrollWatch, 1000 / selection.scrollSpeed);
    };

    // Reset the scroll speed.
    var scrollReset = function() {
        if(!selection) {
            return;
        }
        selection.scrollSpeed = scrollMinSpeed;
    };


    // Selection tools.
    // ---------------------------

    // Start selecting cells.
    var selectionInit = function(e) {

        if(!e || closest(e.target, "A INPUT BUTTON")) {
            return false;
        }

        var td = closest(e.target, "TH TD"),
            table = closest(td, "TABLE");

        if(!table) {
            return false;
        }

        window.getSelection().removeAllRanges();

        if(selection && selection.table != table) {
            selectionReset();
        }

        if(!e.shiftKey) {
            selection = null;
        }

        scrollReset();

        if(selection) {
            selection.anchor = td;
            return true;
        }

        selection = {
            anchor: td,
            table: table,
            x: e.clientX,
            y: e.clientY
        };

        var t = closestScrollable(selection.anchor.parentNode);
        if(t && t != document.documentElement) {
            selection.scrollBase = t;
            selection.x += selection.scrollBase.scrollLeft;
            selection.y += selection.scrollBase.scrollTop;
        } else {
            selection.scrollBase = null;
            selection.x += window.scrollX;
            selection.y += window.scrollY;
        }

        return true;
    };

    // Update current selection.
    var selectionUpdate = function(e) {
        var cx = e.clientX;
        var cy = e.clientY;

        var ax = selection.x;
        var ay = selection.y;

        if(selection.scrollBase) {
            ax -= selection.scrollBase.scrollLeft;
            ay -= selection.scrollBase.scrollTop;
        } else {
            ax -= window.scrollX;
            ay -= window.scrollY;

        }

        var rect = [
            Math.min(cx, ax),
            Math.min(cy, ay),
            Math.max(cx, ax),
            Math.max(cy, ay)
        ];

        $C(clsDragover, selection.table).forEach(function(td) {
            removeClass(td, clsDragover);
        });

        each("TD TH", selection.table, function(td) {
            if(intersect(bounds(td), rect))
                addClass(td, clsDragover);
        });

        if(!selection.selectAnchor) {
            removeClass(selection.anchor, clsDragover);
        }
    };

    // Reset the selection and event handlers.
    var selectionReset = function() {
        $C(clsSelected).forEach(function(td) { removeClass(td, clsSelected) });
        $C(clsDragover).forEach(function(td) { removeClass(td, clsDragover) });

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        selection = null;
    };

    // Command helpers
    // ---------------------------

    // Select a row, a column or a whole table.
    var doSelect = function(command, toggle) {
        var tds = [], sel = bounds(selection.anchor);

        each("TD TH", selection.table, function(td) {
            var b = bounds(td), ok = false;
            switch(command) {
                case "selectRow":    ok = sel[1] == b[1]; break;
                case "selectColumn": ok = sel[0] == b[0]; break;
                case "selectTable":  ok = true; break;
            }
            if(ok)
                tds.push(td);
        });

        var isSelected = tds.every(function(td) { return hasClass(td, clsSelected) });

        if(toggle && isSelected) {
            tds.forEach(function(td) { removeClass(td, clsSelected) });
        } else {
            tds.forEach(function(td) { addClass(td, clsSelected) });
        }
    };

    // Generate content to copy.
    var contentForCopy = function(command) {

        var anySelected = $$("TD TH", selection.table).some(function(td) {
            return isSelected(td);
        });

        switch(command) {
            case "copyRich":
            case "copyHTMLCSS":
                return selectedHTML(selection.table, true, !anySelected);
            case "copyHTML":
                return selectedHTML(selection.table, false, !anySelected);
            case "copyText":
                var m = selectedTextMatrix(selection.table, !anySelected);
                return m.map(function(row) {
                    return rstrip(row.join("\t"));
                }).join("\n");
            case "copyCSV":
                var m = selectedTextMatrix(selection.table, !anySelected);
                return m.map(function(row) {
                    return row.map(function(cell) {
                        return '"' + cell.replace(/"/g, '""') + '"';
                    }).join(",");
                }).join("\n");
        }
        return "";
    };

    // Copy selection as rich text, html or text-only.
    var doCopy = function(command) {
        if(!selection)
            return;
        chrome.runtime.sendMessage({command:command, content:contentForCopy(command)});
    };

    // Event handlers
    // ---------------------------

    // Menu event handler (from the background script).
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(!selectionInit(lastEvent)) {
            selectionReset();
            return;
        }
        switch(message.menuCommand) {
            case "selectRow":
            case "selectColumn":
            case "selectTable":
                doSelect(message.menuCommand, true);
                break;
            case "copyRich":
            case "copyText":
            case "copyHTML":
            case "copyHTMLCSS":
            case "copyCSV":
                doCopy(message.menuCommand);
                break;
        }
        sendResponse({});
    });

    // `mouseDown` - init selection.
    var onMouseDown = function(e) {
        lastEvent = e;

        if(e.which != 1) {
            return;
        }
        if(!e.altKey) {
            selectionReset();
            return;
        }

        if(!selectionInit(e)) {
            selectionReset();
            return;
        }

        selection.selectAnchor = true;
        if(hasClass(selection.anchor, clsSelected)) {
            removeClass(selection.anchor, clsSelected);
            selection.selectAnchor = false;
        }
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        scrollWatch();
        selectionUpdate(e);
        e.preventDefault();
        e.stopPropagation();
    };

    // `mouseMove` - update selection.
    var onMouseMove = function(e) {
        lastEvent = e;

        if(!e.altKey || e.which != 1 || !selection) {
            return;
        }
        selection.scrollSpeed = scrollMinSpeed;
        selectionUpdate(e);
        e.preventDefault();
        e.stopPropagation();
    };

    // `mouseUp` - stop selecting.
    var onMouseUp = function(e) {
        clearTimeout(scrollTimer);

        if(selection)
            $C(clsDragover, selection.table).forEach(function(td) {
                removeClass(td, clsDragover);
                addClass(td, clsSelected);
            });

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    // `doubleClick` - select columns and rows.
    var onDblClick = function(e) {
        if(!selection) {
            return;
        }
        var ctrl = (navigator.userAgent.indexOf("Macintosh") > 0) ? e.metaKey : e.ctrlKey;
        doSelect(ctrl ? "selectRow" : "selectColumn", true);
        e.preventDefault();
        e.stopPropagation();
    };

    // `copy` - copy selection as rich text.
    var onCopy = function(e) {
        if(!selection) {
            return;
        }
        doCopy("copyRich");
        e.preventDefault();
        e.stopPropagation();
    };

    // `contextMenu` - enable/disable extension-specific commands.
    var onContextMenu = function(e) {
        lastEvent = e;
        var td = closest(e.target, "TH TD");
        var table = closest(td, "TABLE");

        if(!table) {
            chrome.runtime.sendMessage({command:"updateMenu", enabled:false});
            return;
        }
        chrome.runtime.sendMessage({command:"updateMenu", enabled:true});
    };

    // main()
    // ---------------------------

    document.body.addEventListener("mousedown", onMouseDown, true);
    document.body.addEventListener("dblclick", onDblClick);
    document.body.addEventListener("copy", onCopy);
    document.body.addEventListener("contextmenu", onContextMenu);

})();

