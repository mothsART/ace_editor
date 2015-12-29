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

        editor.renderer.on("afterRender", function(e) {
            var hash_editor = location.hash.substring(1, location.hash.indexOf("-"));
            if ($(document).scrollTop() != 0 && hash_editor == editor_id && one_render) {
                var offset = $(location.hash).offset();
                if (offset) {
                    $(document).scrollTop(offset.top - ACE_EDITOR_SCROLL_TOP_MARGIN);
                    var select_indice = parseInt(location.hash.substring(location.hash.indexOf("L") + 1));
                    editor.selection.setRange(new Range(
                        select_indice - 1, 0, select_indice - 1,  Number.MAX_VALUE)
                    );
                    one_render = false;
                }
            }
        });

        editor.resize(true);
        $(this).find(".ace_gutter-cell").each(function(inc) {
            var line_id =  editor_id + '-' + 'L' + parseInt(inc + 1);
            $(this).attr('id', line_id);
            $(this).on("click", function() {
                location.hash = line_id;
                $(document).scrollTop($(this).offset().top - ACE_EDITOR_SCROLL_TOP_MARGIN);

                $pre_filter.each(function(item) {
                    var editor_id = 'editor' + parseInt(item + 1);
                    ace.edit(editor_id).selection.setRange(new Range(0, 0, 0, 0));
                });

                editor.selection.setRange(new Range(inc, 0, inc, Number.MAX_VALUE));
            });
        });
    });
});