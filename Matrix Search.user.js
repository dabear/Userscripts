// ==UserScript==
// @name           Search Matrix
// @namespace      bjorninge.no
// @include        http://wiki/confluence/display/DOC/Dokumentasjon+for+Fagsystemer
// ==/UserScript==
function log(s){ console.log(s);}

(function(jQuery){
var $ = jQuery;

var $table = $(".confluenceTable").eq(0),
    $rows = $($table.attr("rows")),
    $cells = $rows.find("td,th");



//
// Add stylesheet rules manually, because jquery fails creating <style>
// tags with content, at least inside greasemonkey
//
var style = document.createElement("style"),
    rules = document.createTextNode("td.hidetext { visibility:hidden;}");
    
if(style.styleSheet) {
    style.styleSheet.cssText = rules.nodeValue;
} else {
    style.appendChild(rules);
}

document.body.appendChild(style);



//
// Create the search box used for searching the confluence Matrix
// 
var $matchedCells = $([]),
    $container = $("<div />");

var $input = $("<input>", {
    type: "text",
    val: "Søk i matrise",
    css: { width: "200px"},
    click: function(){
        this.select();
        
    },
    keydown: function(e){          
        if(e.which == 13) {
            doSearch();
        }
        return true;
    }
});

var $submit = $("<input>", {
   type: "submit",
   click: function () {
    doSearch();
    return false;
   }
});

$container.append($input, $submit);
$container.prependTo($table.parent());

function doSearch() {
    //values to be used for searching, lower cased version for case insensitive searches
    var val = $input.val(),
        search = val.split(" "),
        term = $.trim(search[0]).toLowerCase();
    log("term:" + term );
    log("len:" + term.length);
    //reset style for former match, if any
    $matchedCells.removeClass("hidetext");
    //avoid looping if we know we want all cells
    if (!val.length) {
        log("avoiding looping");
        $cells.removeClass("hidetext");
        return true;
    }
    
    log("enter pressed! searching for " + search[0] );
    $matchedCells = $cells.filter(function () {
       return this.innerHTML.toLowerCase().indexOf(term) + 1; 
    })
    .getRelatedCells();
    
    log("matched " + $matchedCells.length + " cells containing search term '" + term + "'");
    
    $cells
        .not($matchedCells.removeClass("hidetext"))
        .addClass("hidetext");
        
    return true;
    
}


function getRelatedCells(c) {
    var $c =  $(c),
        idx = c.cellIndex,
        $cells,
        $parent = $c.closest("tr").parent(),
        rows = $parent.attr("rows"),
        cells = [];

    //for each row, add the member which has same vertical placement as current cell
    for(var i=0, len=rows.length; i < len; i++) {
        var cell = rows[i].cells[idx];
        
        if(cell && cell.nodeName === "TD" ) {
            cells.push(cell);
        }

    }

    //also add all cells horizontally from the current cell
    $cells = $(cells)
    .add($c.siblings());

    return $cells;
}

$.fn.getRelatedCells = function(){
    return this.map(function(){
        return getRelatedCells(this).get();
    });
};

})(unsafeWindow.jQuery);