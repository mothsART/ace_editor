var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};

var correlationDic = {
    'bash': 'sh'
}

// inspiration : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#A_stricter_parse_function
filterInt = function (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}

function linesInAnchor(anchor) {
  anchorObject = {};
  anchorObject.first = 0;
  anchorObject.last = 0;
  anchorObject.anchor = "";
  var firstLineIndex = anchor.indexOf("-L");
  var firstResult = anchor.substring(
    firstLineIndex + 2
  );
  if(filterInt(firstResult)) {
    anchorObject.first = filterInt(firstResult) - 1;
    anchorObject.last = anchorObject.first;
    anchorObject.anchor = anchor.substring(0, firstLineIndex + 2) + firstResult;
    return anchorObject;
  }
  var secondLineIndex = firstResult.indexOf("-L");

  if (!filterInt(firstResult.substring(0, secondLineIndex))) {
    return anchorObject;
  }
  anchorObject.anchor = anchor.substring(0, firstLineIndex + 2) + firstResult.substring(0, secondLineIndex);

  anchorObject.first = filterInt(firstResult.substring(0, secondLineIndex)) - 1;
  var secondResult = firstResult.substring(
    secondLineIndex + 2
  );
  if (!filterInt(secondResult)) {
    anchorObject.last = anchorObject.first;
    return anchorObject;
  }
  anchorObject.last = filterInt(secondResult) - 1;
  return anchorObject;
}

var callback;

$(document).on("keyup", function(event) {
    // Maj -> code 16
    if (event.which == 16) {
        callback(event);
    }
});

$(function() {
    var $pre_filter = $('pre.highlight');
    var pre_len = $pre_filter.length;
    $pre_filter.each(function(item) {
        var lang = $(this).find("code").attr('class').substring(9);
        if (lang in correlationDic) {
            lang = correlationDic[lang];
        }
        var one_render = true;
        // avoid the last carriage return
        $(this).text($(this).text().substring(0, $(this).text().length - 1));

        // Give a unique id on all editor
        var editor_id = 'editor' + parseInt(item + 1);
        $(this).attr('id', editor_id);
        var editor = ace.edit(editor_id);
        editor.setTheme("ace/theme/" + ACE_EDITOR_THEME);
        editor.setShowInvisibles(ACE_EDITOR_SHOW_INVISIBLE);
        editor.setOptions({
            mode: "ace/mode/" + lang,
            maxLines: ACE_EDITOR_MAXLINES,
            readOnly: ACE_EDITOR_READONLY,
            autoScrollEditorIntoView: ACE_EDITOR_AUTOSCROLL
        });
        editor.$blockScrolling = Infinity;

        editor.renderer.on("afterRender", function(event) {
            var anchor = linesInAnchor(location.hash);
            var hash_editor = location.hash.substring(1, location.hash.indexOf("-"));
            if (hash_editor == editor_id && one_render) {
                var offset = $(anchor.anchor).offset();
                if (offset) {
                    $(document).scrollTop(offset.top - ACE_EDITOR_SCROLL_TOP_MARGIN);
                    editor.selection.setRange(new Range(
                        anchor.first, 0, anchor.last,  Number.MAX_VALUE)
                    );
                    one_render = false;
                }
            }
        });

        editor.resize(true);
        $(this).find(".ace_gutter-cell").each(function(inc) {
            var line_id =  editor_id + '-' + 'L' + parseInt(inc + 1);
            $(this).attr('id', line_id);
            $(this).on("click", function(event) {
                $(document).on("keydown", function(event) {
                    // Maj -> code 16
                    if (event.which == 16) {
                        console.log('bing');
                        //callback(event);
                    }
                });
            });
            // $(this).on("click", function(event) {
            //     var old_hash = location.hash;
            //     callback = function(event) {
            //         var first_anchor = linesInAnchor(old_hash);
            //         var last_anchor = linesInAnchor(line_id);
            //         var first = Math.min(first_anchor.first, last_anchor.last);
            //         var last = Math.max(first_anchor.first, last_anchor.last);
            //         editor.selection.setRange(new Range(first, 0, last, Number.MAX_VALUE));
            //         console.log(first_anchor);
            //         console.log(last_anchor);
            //     }
            //     location.hash = line_id;

            //     $(document).scrollTop($(this).offset().top - ACE_EDITOR_SCROLL_TOP_MARGIN);

            //     $pre_filter.each(function(item) {
            //         var editor_id = 'editor' + parseInt(item + 1);
            //         ace.edit(editor_id).selection.setRange(new Range(0, 0, 0, 0));
            //     });
            //     editor.selection.setRange(new Range(inc, 0, inc, Number.MAX_VALUE));
            //     console.log('click');
            // });
        });
    });
});