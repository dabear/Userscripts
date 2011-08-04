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


$cells.wrapInner('<span class="searchtext"></span>')

var style = document.createElement("style"),
    rules = document.createTextNode("td.hidetext span.searchtext{ background: black;}");
    
if(style.styleSheet) {
    style.styleSheet.cssText = rules.nodeValue
} else {
    style.appendChild(rules);
}

document.body.appendChild(style);


/* create the search box used for searching the confluence Matrix*/

// 
var $matchedCells = $([]);


$("<input>", {
    type: "text",
    css: { width: "200px"},
    click: function(){
        this.select();
        
    },
    keydown: function(e){
        var isEnterDown = (e.which == 13),
            search = this.value.split(" ");
        if(isEnterDown) {
            var term = $.trim(search[0]).toLowerCase();
            //reset style for former match, if any
            $matchedCells.removeClass("hidetext");
            //avoid looping if we know we want all cells
            if(!term.length) {
                
                $cells.show();
                return true;
            }
            
            log("enter pressed! searching for " + search[0] );
            $matchedCells = $cells.filter( function(){
                
               return this.innerHTML.toLowerCase().indexOf(term) + 1; 
            })
            .getRelatedCells()
            
            
            log("matched " + $matchedCells.length + " cells containing search term '" + term + "'");
            
            $cells
                .not($matchedCells.removeClass("hidetext"))
                .addClass("hidetext");
        }
        return true;
    }
})
.prependTo($table.parent())
.focus().select();




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

        if(cell.nodeName === "TD" ) {
            cells.push(cell);
        }

    }

    //also add all cells horizontally from the current cell
    $cells = $(cells)
    .add($c.siblings() );


    return $cells;

}

$.fn.getRelatedCells = function(){
    return this.map(function(){
        return getRelatedCells(this).get();
    });

};


//var $cells = $(this).getRelatedCells();


})(unsafeWindow.jQuery);