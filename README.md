Ace Editor plugin for Pelican
=============================

This plugin adds an *ace editor* to all code-block.
https://ace.c9.io

The default theme does not include *ace editor*, but it is pretty easy to add one (on base.html):

    {{ ace_editor }}

If you use markdown, you must add correspondant settings:

* if pelican <= 3.6.3 :

    MD_EXTENSIONS = [
        'codehilite(css_class=highlight, linenums=False, use_pygments=False)'
    ]

* if pelican > 3.6.3 :

    MD_EXTENSIONS = {
        'markdown.extensions.codehilite': {
            'css_class': 'highlight',
            'linenums': False,
            'use_pygments': False
        }
    }
