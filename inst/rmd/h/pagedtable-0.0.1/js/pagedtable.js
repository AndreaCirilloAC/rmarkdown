// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

var PagedTable = function (pagedTable) {
  var me = this;

  var source = function(pagedTable) {
    var sourceElems = [].slice.call(pagedTable.children).filter(function(e) {
      return e.hasAttribute("data-pagedtable-source");
    });

    if (sourceElems === null || sourceElems.length !== 1) {
      throw("A single data-pagedtable-source was not found");
    }

    return JSON.parse(sourceElems[0].innerHTML);
  }(pagedTable);

  var options = function(source) {
    var options = typeof(source.options) !== "undefined" &&
      source.options !== null ? source.options : {};

    var columns = typeof(options.columns) !== "undefined" ? options.columns : {};

    var positiveIntOrNull = function(value) {
      return parseInt(value) >= 0 ? parseInt(value) : null;
    };

    return {
      pages: positiveIntOrNull(options.pages),
      rows: positiveIntOrNull(options.rows),
      columns: {
        min: positiveIntOrNull(columns.min),
        max: positiveIntOrNull(columns.max)
      }
    };
  }(source);

  var Page = function(data, options) {
    var me = this;

    var defaults = {
      max: 1,
      rows: 10
    };

    me.number = 0;
    me.max = options.pages !== null ? options.pages : defaults.max;
    me.visible = me.max + 1;
    me.rows = options.rows !== null ? options.rows : defaults.rows;

    var getPageCount = function() {
      return Math.ceil(data.length / me.rows);
    };

    me.setPageNumber = function(newPageNumber) {
      if (newPageNumber < 0) newPageNumber = 0;
      if (newPageNumber >= getPageCount()) newPageNumber = getPageCount() - 1;

      me.number = newPageNumber;
    };

    me.setVisiblePages = function(visiblePages) {
      me.visible = Math.min(me.max + 1, visiblePages);
      me.setPageNumber(me.number);
    };

    me.getVisiblePageRange = function() {
      var start = me.number - Math.max(Math.floor((me.visible - 1) / 2), 0);
      var end = me.number + Math.floor(me.visible / 2);
      var pageCount = getPageCount();

      if (start < 0) {
        var diffToStart = 0 - start;
        start += diffToStart;
        end += diffToStart;
      }

      if (end > pageCount) {
        var diffToEnd = end - pageCount;
        start -= diffToEnd;
        end -= diffToEnd;
      }

      start = start < 0 ? 0 : start;
      end = end >= pageCount ? pageCount : end;

      return {
        start: start,
        end: end
      };
    };

    me.getRowStart = function() {
      var rowStart = page.number * page.rows;
      if (rowStart < 0)
        rowStart = 0;

      return rowStart;
    };

    me.getRowEnd = function() {
      var rowStart = me.getRowStart();
      return Math.min(rowStart + me.rows, data.length);
    };

    me.getPaddingRows = function() {
      var rowStart = me.getRowStart();
      var rowEnd = me.getRowEnd();
      return data.length > me.rows ? me.rows - (rowEnd - rowStart) : 0;
    };
  };

  var Columns = function(data, columns, options) {
    var me = this;

    me.defaults = {
      max: 10,
      min: 5
    };

    me.number = 0;
    me.visible = 0;
    me.total = columns.length;
    me.subset = [];
    me.padding = 0;
    me.min = options.columns !== null && options.columns.min !== null ? options.columns.min : me.defaults.min;
    me.max = options.columns !== null && options.columns.max !== null ? options.columns.max : me.defaults.max;
    me.widths = {};

    var widthsLookAhead = 10;
    var paddingColChars = 10;

    // set some default initial values that will get adjusted iin runtime
    me.measures = {
      padding: 12,
      character: 8,
      defaults: true
    };

    me.emptyNames = function() {
      columns.forEach(function(column) {
        if (columns.label !== null && columns.label !== "")
          return false;
      });

      return true;
    };

    var parsePadding = function(value) {
      return parseInt(value) >= 0 ? parseInt(value) : 0;
    };

    var calculateWidths = function() {
      columns.forEach(function(column) {
        var maxChars = column.label.toString().length;
        for (var idxRow = 0; idxRow < Math.min(widthsLookAhead, data.length); idxRow++) {
          maxChars = Math.max(maxChars, data[idxRow][column.name.toString()].length);
        }

        me.widths[column.name] = {
          // width in characters
          chars: maxChars,
          // width for the inner html columns
          inner: maxChars * me.measures.character,
          // width adding outer styles like padding
          outer: maxChars * me.measures.character + me.measures.padding
        };
      });
    };

    calculateWidths();

    me.calculateMeasures = function(measuresCell) {
      if (!me.measures.defaults)
        return;

      var measuresCellStyle = window.getComputedStyle(measuresCell, null);

      var newPadding = parsePadding(measuresCellStyle.paddingLeft) +
            parsePadding(measuresCellStyle.paddingRight);

      var sampleString = "ABCDEFGHIJ0123456789";
      var newCharacter = Math.ceil(measuresCell.clientWidth / sampleString.length);

      if (newPadding <= 0 || newCharacter <= 0)
        return;

      me.measures.padding = newPadding;
      me.measures.character = newCharacter;
      me.measures.defaults = false;

      calculateWidths();
    };

    me.getWidth = function() {
      var widthOuter = 0;
      for (var idxCol = 0; idxCol < me.subset.length; idxCol++) {
        var columnName = me.subset[idxCol].name;
        widthOuter = widthOuter + me.widths[columnName].outer;
      }

      widthOuter = widthOuter + me.padding * paddingColChars * me.measures.character;

      if (me.hasMoreLeftColumns()) {
        widthOuter = widthOuter + columnNavigationWidthPX + me.measures.padding;
      }

      if (me.hasMoreRightColumns()) {
        widthOuter = widthOuter + columnNavigationWidthPX + me.measures.padding;
      }

      return widthOuter;
    };

    me.updateSlice = function() {
      if (me.number + me.visible >= me.total)
        me.number = me.total - me.visible;

      if (me.number < 0) me.number = 0;

      me.subset = columns.slice(me.number, Math.min(me.number + me.visible, me.total));

      me.subset = me.subset.map(function(column) {
        Object.keys(column).forEach(function(colKey) {
          column[colKey] = column[colKey] === null ? "" : column[colKey].toString();
        });

        column.width = null;
        return column;
      });
    };

    me.setVisibleColumns = function(columnNumber, newVisibleColumns, paddingCount) {
      me.number = columnNumber;
      me.visible = newVisibleColumns;
      me.padding = paddingCount;

      me.updateSlice();
    };

    me.incColumnNumber = function(increment) {
      me.number = me.number + increment;
    };

    me.setColumnNumber = function(newNumber) {
      me.number = newNumber;
    };

    me.setPaddingCount = function(newPadding) {
      me.padding = newPadding;
    };

    me.getPaddingCount = function() {
      return me.padding;
    };

    me.hasMoreLeftColumns = function() {
      return me.number > 0;
    };

    me.hasMoreRightColumns = function() {
      return me.number + me.visible < me.total;
    };

    me.updateSlice(0);
    return me;
  };

  var data = source.data;
  var page = new Page(data, options);
  var columns = new Columns(data, source.columns, options);

  var table;
  var tableDiv;
  var header;
  var tableDivLastWidth = -1;
  var tbody;

  // Caches pagedTable.clientWidth, specially for webkit
  var cachedPagedTableClientWidth = null;

  var onChangeCallbacks = [];

  var clearSelection = function() {
    if(document.selection && document.selection.empty) {
      document.selection.empty();
    } else if(window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
    }
  };

  var columnNavigationWidthPX = 5;

  var renderColumnNavigation = function(increment, backwards) {
    var arrow = document.createElement("div");
    arrow.setAttribute("style",
      "border-top: " + columnNavigationWidthPX + "px solid transparent;" +
      "border-bottom: " + columnNavigationWidthPX + "px solid transparent;" +
      "border-" + (backwards ? "right" : "left") + ": " + columnNavigationWidthPX + "px solid;");

    var header = document.createElement("th");
    header.appendChild(arrow);
    header.setAttribute("style",
      "cursor: pointer;" +
      "vertical-align: middle;" +
      "min-width: " + columnNavigationWidthPX + "px;" +
      "width: " + columnNavigationWidthPX + "px;");

    header.onclick = function() {
      columns.incColumnNumber(backwards ? -1 : increment);

      renderFooter();
      me.animateColumns(backwards);

      clearSelection();
      triggerOnChange();
    };

    return header;
  };

  var maxColumnWidth = function(width) {
    var padding = 80;
    var columnMax = Math.max(cachedPagedTableClientWidth - padding, 0);

    return parseInt(width) > 0 ?
      Math.min(columnMax, parseInt(width)) + "px" :
      columnMax + "px";
  };

  var clearHeader = function() {
    var thead = pagedTable.querySelectorAll("thead")[0];
    thead.innerHTML = "";
  };

  var renderHeader = function(clear) {
    cachedPagedTableClientWidth = pagedTable.clientWidth;

    var fragment = document.createDocumentFragment();

    header = document.createElement("tr");
    fragment.appendChild(header);

    if (columns.number > 0)
      header.appendChild(renderColumnNavigation(-columns.visible, true));

    columns.subset = columns.subset.map(function(columnData) {
      var column = document.createElement("th");
      column.setAttribute("align", columnData.align);

      column.style.maxWidth = maxColumnWidth(null);
      if (columnData.width) {
        column.style.minWidth =
          column.style.maxWidth = maxColumnWidth(columnData.width);
      }

      var columnName = document.createElement("div");
      if (columnData.label === "") {
        columnName.innerHTML = "&nbsp;";
      }
      else {
        columnName.appendChild(document.createTextNode(columnData.label));
      }
      column.appendChild(columnName);

      var columnType = document.createElement("div");
      columnType.setAttribute("class", "pagedtable-header-type");
      if (columnData.type === "") {
        columnType.innerHTML = "&nbsp;";
      }
      else {
        columnType.appendChild(document.createTextNode("<" + columnData.type + ">"));
      }
      column.appendChild(columnType);

      header.appendChild(column);

      columnData.element = column;

      return columnData;
    });

    for (var idx = 0; idx < columns.getPaddingCount(); idx++) {
      var paddingCol = document.createElement("th");
      paddingCol.setAttribute("class", "pagedtable-padding-col");
      header.appendChild(paddingCol);
    }

    if (columns.number + columns.visible < columns.total)
      header.appendChild(renderColumnNavigation(columns.visible, false));

    if (typeof(clear) == "undefined" || clear) clearHeader();
    var thead = pagedTable.querySelectorAll("thead")[0];
    thead.appendChild(fragment);
  };

  me.animateColumns = function(backwards) {
    var thead = pagedTable.querySelectorAll("thead")[0];

    var headerOld = thead.querySelectorAll("tr")[0];
    var tbodyOld = table.querySelectorAll("tbody")[0];

    me.fitColumns(backwards);

    renderHeader(false);

    header.style.opacity = "0";
    header.style.transform = backwards ? "translateX(-30px)" : "translateX(30px)";
    header.style.transition = "transform 200ms linear, opacity 200ms";
    header.style.transitionDelay = "0";

    renderBody(false);

    if (headerOld) {
      headerOld.style.position = "absolute";
      headerOld.style.transform = "translateX(0px)";
      headerOld.style.opacity = "1";
      headerOld.style.transition = "transform 100ms linear, opacity 100ms";
      headerOld.setAttribute("class", "pagedtable-remove-head");
      headerOld.addEventListener("webkitTransitionEnd", function() {
        var headerOldByClass = thead.querySelector(".pagedtable-remove-head");
        if (headerOldByClass) thead.removeChild(headerOldByClass);
      });
    }

    if (tbodyOld) table.removeChild(tbodyOld);

    tbody.style.opacity = "0";
    tbody.style.transition = "transform 200ms linear, opacity 200ms";
    tbody.style.transitionDelay = "0ms";

    // force relayout
    window.getComputedStyle(header).opacity;
    window.getComputedStyle(tbody).opacity;

    if (headerOld) {
      headerOld.style.transform = backwards ? "translateX(20px)" : "translateX(-30px)";
      headerOld.style.opacity = "0";
    }

    header.style.transform = "translateX(0px)";
    header.style.opacity = "1";

    tbody.style.opacity = "1";
  }

  me.onChange = function(callback) {
    onChangeCallbacks.push(callback);
  };

  var triggerOnChange = function() {
    onChangeCallbacks.forEach(function(onChange) {
      onChange();
    });
  };

  var clearBody = function() {
    if (tbody) {
      table.removeChild(tbody);
      tbody = null;
    }
  };

  var renderBody = function(clear) {
    cachedPagedTableClientWidth = pagedTable.clientWidth

    var fragment = document.createDocumentFragment();

    var pageData = data.slice(page.getRowStart(), page.getRowEnd());

    pageData.forEach(function(dataRow, idxRow) {
      var htmlRow = document.createElement("tr");
      htmlRow.setAttribute("class", (idxRow % 2 !==0) ? "even" : "odd");

      if (columns.hasMoreLeftColumns())
        htmlRow.appendChild(document.createElement("td"));

      columns.subset.forEach(function(columnData) {
        var cellName = columnData.name;
        var dataCell = dataRow[cellName];
        var htmlCell = document.createElement("td");

        if (dataCell === "NA") htmlCell.setAttribute("class", "pagedtable-na-cell");
        if (dataCell === "__NA__") dataCell = "NA";

        var cellText = document.createTextNode(dataCell);
        htmlCell.appendChild(cellText);
        if (dataCell.length > 50) {
          htmlCell.setAttribute("title", dataCell);
        }
        htmlCell.setAttribute("align", columnData.align);
        htmlCell.style.maxWidth = maxColumnWidth(null);
        if (columnData.width) {
          htmlCell.style.minWidth = htmlCell.style.maxWidth = maxColumnWidth(columnData.width);
        }
        htmlRow.appendChild(htmlCell);
      });

      for (var idx = 0; idx < columns.getPaddingCount(); idx++) {
        var paddingCol = document.createElement("td");
        paddingCol.setAttribute("class", "pagedtable-padding-col");
        htmlRow.appendChild(paddingCol);
      }

      if (columns.hasMoreRightColumns())
        htmlRow.appendChild(document.createElement("td"));

      fragment.appendChild(htmlRow);
    });

    for (var idxPadding = 0; idxPadding < page.getPaddingRows(); idxPadding++) {
      var paddingRow = document.createElement("tr");

      var paddingCellRow = document.createElement("td");
      paddingCellRow.innerHTML = "&nbsp;";
      paddingCellRow.setAttribute("colspan", "100%");
      paddingRow.appendChild(paddingCellRow);

      fragment.appendChild(paddingRow);
    }

    if (typeof(clear) == "undefined" || clear) clearBody();
    tbody = document.createElement("tbody");
    tbody.appendChild(fragment);

    table.appendChild(tbody);
  };

  var getLabelInfo = function() {
    var pageStart = page.getRowStart();
    var pageEnd = page.getRowEnd();
    var totalRows = data.length;
    var totalRowsLabel = totalRows.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

    var infoText = (pageStart + 1) + "-" + pageEnd + " of " + totalRowsLabel + " rows";
    if (totalRows < page.rows) {
      infoText = totalRowsLabel + " row" + (totalRows != 1 ? "s" : "");
    }
    if (columns.total > columns.visible) {
      infoText = infoText + " | " + (columns.number + 1) + "-" +
        (Math.min(columns.number + columns.visible, columns.total)) +
        " of " + columns.total + " columns";
    }

    return infoText;
  };

  var clearFooter = function() {
    var footer = pagedTable.querySelectorAll("div.pagedtable-footer")[0];
    footer.innerHTML = "";

    return footer;
  };

  var renderFooter = function() {
    var footer = clearFooter();

    var next = document.createElement("a");
    next.appendChild(document.createTextNode("Next"));
    next.onclick = function() {
      page.setPageNumber(page.number + 1);
      renderBody();
      renderFooter();

      triggerOnChange();
    };
    if (data.length > page.rows) footer.appendChild(next);

    var pageNumbers = document.createElement("div");
    pageNumbers.setAttribute("class", "pagedtable-indexes");

    var pageRange = page.getVisiblePageRange();
    for (var idxPage = pageRange.start; idxPage < pageRange.end; idxPage++) {
      var pageLink = document.createElement("a");
      pageLinkClass = idxPage === page.number ? "pagedtable-index pagedtable-index-current" : "pagedtable-index";
      pageLink.setAttribute("class", pageLinkClass);
      pageLink.setAttribute("data-page-index", idxPage);
      pageLink.onclick = function() {
        page.setPageNumber(parseInt(this.getAttribute("data-page-index")));
        renderBody();
        renderFooter();

        triggerOnChange();
      };

      pageLink.appendChild(document.createTextNode(idxPage + 1));
      pageNumbers.appendChild(pageLink);
    }
    if (data.length > page.rows) footer.appendChild(pageNumbers);

    var previous = document.createElement("a");
    previous.appendChild(document.createTextNode("Previous"));
    previous.onclick = function() {
      page.setPageNumber(page.number - 1);
      renderBody();
      renderFooter();

      triggerOnChange();
    };
    if (data.length > page.rows) footer.appendChild(previous);

    var infoLabel = document.createElement("div");
    infoLabel.setAttribute("class", "pagedtable-info");
    infoLabel.setAttribute("title", getLabelInfo());
    infoLabel.appendChild(document.createTextNode(getLabelInfo()));
    footer.appendChild(infoLabel);

    var enabledClass = "pagedtable-index-nav";
    var disabledClass = "pagedtable-index-nav pagedtable-index-nav-disabled";
    previous.setAttribute("class", page.number <= 0 ? disabledClass : enabledClass);
    next.setAttribute("class", (page.number + 1) * page.rows >= data.length ? disabledClass : enabledClass);
  };

  var measuresCell = null;

  var renderMeasures = function() {
    var measuresTable = document.createElement("table");
    measuresTable.style.visibility = "hidden";
    measuresTable.style.position = "absolute";
    measuresTable.style.whiteSpace = "nowrap";
    measuresTable.style.height = "auto";
    measuresTable.style.width = "auto";

    var measuresRow = document.createElement("tr");
    measuresTable.appendChild(measuresRow);

    measuresCell = document.createElement("td");
    var sampleString = "ABCDEFGHIJ0123456789";
    measuresCell.appendChild(document.createTextNode(sampleString));

    measuresRow.appendChild(measuresCell);

    tableDiv.appendChild(measuresTable);
  }

  me.render = function() {
    tableDiv = document.createElement("div");
    pagedTable.appendChild(tableDiv);
    var pagedTableClass = data.length > 0 ?
      "pagedtable pagedtable-not-empty" :
      "pagedtable pagedtable-empty";

    if (columns.total == 0 || (columns.emptyNames() && data.length == 0)) {
      pagedTableClass = pagedTableClass + " pagedtable-empty-columns";
    }

    tableDiv.setAttribute("class", pagedTableClass);

    renderMeasures();

    table = document.createElement("table");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("class", "table table-condensed");
    tableDiv.appendChild(table);

    table.appendChild(document.createElement("thead"));

    var footerDiv = document.createElement("div");
    footerDiv.setAttribute("class", "pagedtable-footer");
    tableDiv.appendChild(footerDiv);

    // if the host has not yet provided horizontal space, render hidden
    if (tableDiv.clientWidth <= 0) {
      tableDiv.style.opacity = "0";
    }

    me.renderColumns();

    // retry seizing columns later if the host has not provided space
    var retries = 100;
    function retryFitColumns() {
      retries = retries - 1;
      if (retries > 0) {
        if (tableDiv.clientWidth <= 0) {
          setTimeout(retryFitColumns, 100);
        } else {
          me.renderColumns();
          triggerOnChange();
        }
      }
    }
    if (tableDiv.clientWidth <= 0) {
      retryFitColumns();
    }
  };

  var registerWidths = function() {
    columns.subset = columns.subset.map(function(column) {
      column.width = columns.widths[column.name].inner;
      return column;
    });
  };

  var parsePadding = function(value) {
    return parseInt(value) >= 0 ? parseInt(value) : 0;
  };

  // The goal of this function is to add as many columns as possible
  // starting from left-to-right, when the right most limit is reached
  // it tries to add columns from the left as well.
  //
  // When startBackwards is true columns are added from right-to-left
  me.fitColumns = function(startBackwards) {
    columns.calculateMeasures(measuresCell);

    if (tableDiv.clientWidth > 0) {
      tableDiv.style.opacity = 1;
    }

    var visibleColumns = tableDiv.clientWidth <= 0 ? Math.max(columns.max, 1) : 1;
    var columnNumber = columns.number;
    var paddingCount = 0;

    // track a list of added columns as we build the visible ones to allow us
    // to remove columns when they don't fit anymore.
    var columnHistory = [];

    var lastTableHeight = 0;
    var backwards = startBackwards;

    var tableDivStyle = window.getComputedStyle(tableDiv, null);
    var tableDivPadding = parsePadding(tableDivStyle.paddingLeft) +
      parsePadding(tableDivStyle.paddingRight);

    var addPaddingCol = false;
    var currentWidth = 0;

    while (true) {
      columns.setVisibleColumns(columnNumber, visibleColumns, paddingCount);
      currentWidth = columns.getWidth();

      if (tableDiv.clientWidth - tableDivPadding < currentWidth) {
        break;
      }

      columnHistory.push({
        columnNumber: columnNumber,
        visibleColumns: visibleColumns,
        paddingCount: paddingCount
      });

      if (columnHistory.length > 100) {
        console.error("More than 100 tries to fit columns, aborting");
        break;
      }

      if (columns.visible + columns.getPaddingCount() >= columns.max) {
        break;
      }

      // if we run out of right-columns
      if (!backwards && columnNumber + columns.visible >= columns.total) {
        // if we started adding right-columns, try adding left-columns
        if (!startBackwards && columnNumber > 0) {
          backwards = true;
        }
        else if (columns.min === null || visibleColumns + columns.getPaddingCount() >= columns.min) {
          break;
        }
        else {
          paddingCount = paddingCount + 1;
        }
      }

      // if we run out of left-columns
      if (backwards && columnNumber == 0) {
        // if we started adding left-columns, try adding right-columns
        if (startBackwards && columnNumber + columns.visible < columns.total) {
          backwards = false;
        }
        else if (columns.min === null || visibleColumns + columns.getPaddingCount() >= columns.min) {
          break;
        }
        else {
          paddingCount = paddingCount + 1;
        }
      }

      // when moving backwards try fitting left columns first
      if (backwards && columnNumber > 0) {
        columnNumber = columnNumber - 1;
      }

      if (columnNumber + visibleColumns < columns.total) {
        visibleColumns = visibleColumns + 1;
      }
    }

    var lastRenderableColumn = {
        columnNumber: columnNumber,
        visibleColumns: visibleColumns,
        paddingCount: paddingCount
    };

    if (columnHistory.length > 0) {
      lastRenderableColumn = columnHistory[columnHistory.length - 1];
    }

    columns.setVisibleColumns(
      lastRenderableColumn.columnNumber,
      lastRenderableColumn.visibleColumns,
      lastRenderableColumn.paddingCount);

    if (pagedTable.offsetWidth > 0) {
      page.setVisiblePages(Math.max(Math.ceil(1.0 * (pagedTable.offsetWidth - 250) / 40), 2));
    }

    registerWidths();

    tableDivLastWidth = tableDiv.clientWidth
  };

  me.renderColumns = function() {
    me.fitColumns(false);

    renderHeader();
    renderBody();
    renderFooter();
  }

  me.resizeColumns = function() {
    var tableDivLastResizeWidth = -1;

    function resizeColumnsDelayed() {
      if (tableDiv.clientWidth !== tableDivLastResizeWidth) {
        tableDivLastResizeWidth = tableDiv.clientWidth;
        setTimeout(resizeColumnsDelayed, 500);
      } else {
        if (tableDiv.clientWidth !== tableDivLastWidth) {
          me.renderColumns();
          triggerOnChange();
        }
      }
    }

    resizeColumnsDelayed();
  };
};

var PagedTableDoc;
(function (PagedTableDoc) {
  var allPagedTables = [];

  PagedTableDoc.renderAll = function() {
    allPagedTables = [];

    var pagedTables = [].slice.call(document.querySelectorAll('[data-pagedtable]'));
    pagedTables.forEach(function(pagedTable, idx) {
      pagedTable.setAttribute("pagedtable-page", 0);
      pagedTable.setAttribute("class", "pagedtable-wrapper");

      var pagedTableInstance = new PagedTable(pagedTable);
      pagedTableInstance.render();

      allPagedTables.push(pagedTableInstance);
    });
  };

  PagedTableDoc.resizeAll = function() {
    allPagedTables.forEach(function(pagedTable) {
      pagedTable.renderColumns();
    });
  };

  window.addEventListener("resize", PagedTableDoc.resizeAll);

  return PagedTableDoc;
})(PagedTableDoc || (PagedTableDoc = {}));

window.onload = function() {
  PagedTableDoc.renderAll();
};
