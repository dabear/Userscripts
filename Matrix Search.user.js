// ==UserScript==
// @name           Search Matrix
// @namespace      bjorninge.no
// @include        http://wiki/confluence/display/DOC/Dokumentasjon+for+Fagsystemer
// ==/UserScript==
/*global jQuery: true, unsafeWindow */
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
    rules = document.createTextNode("td.hidetext, span.hidetext { visibility:hidden;} span.errorlabel{ color: red;}");
    
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

var $submit = $("<input />", {
   type: "submit",
   val: "Søk",
   click: function () {
    doSearch();
    return false;
   }
   
});

var $errorLabel = $('<span />', {
   className: "hidetext errorlabel",
   html: "Ingen match!"
});

$container.append($input, $submit, $errorLabel);
$container.prependTo($table.parent());

function doSearch() {
    //values to be used for searching, lower cased version for case insensitive searches
    var val = $input.val(),
        searches = val.split(/\s+/);
        

    
    //reset style for former match, if any
    $matchedCells.removeClass("hidetext");
    $errorLabel.addClass("hidetext");
    
    //avoid looping if we know we want all cells
    if (!val.length) {
        log("avoiding looping");
        $cells.removeClass("hidetext");
        return true;
    }
    
    
    
    
    log("enter pressed! searching for " + searches.join(",") );
    $matchedCells = $cells.filter(function () {
        //avoid innerhtml as cell can contain multiple children
        var html = (this.textContent || this.innerText).toLowerCase(),
            matches = 0;
        for(var i = 0, len=searches.length; i < len; i++) {
            var term = searches[i].toLowerCase();
            log("term:" + term);
            
            //first term can be empty if search string starts with emptyspace
            if(!term) {
                continue;
            }
            
            //all search terms must be found in the cell
            var partMatched = html.indexOf(term) + 1;
            
            //part of the search was not found in the cell, we can brake out early
            if(!partMatched) {
                return false;
            }
            
        }
        
        return true; 
    });
    //.getRelatedCells();
    
    log("matched " + $matchedCells.length + " cells containing search terms '" + searches.join(",") + "'");
    
    if(!$matchedCells.length) {
        $errorLabel.removeClass("hidetext");
    }
    
    
    
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

$.fn.getRelatedCells = function () {
    return this.map(function () {
        return getRelatedCells(this).get();
    });
};

})(unsafeWindow.jQuery);