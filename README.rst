=============================
Ace Editor plugin for Pelican
=============================

This plugin adds an *ace editor* to all code-block.
see more : https://ace.c9.io

The default theme does not include *ace editor*, but it is pretty easy to add one (on base.html):

    {{ ace_editor }}

If you're using markdown, you must add this settings on your pelicanconf.py:

* if pelican <= 3.6.3 :

    .. code-block:: rst

        MD_EXTENSIONS = [
            'codehilite(css_class=highlight, linenums=False, use_pygments=False)'
        ]

* if pelican > 3.6.3 :

    .. code-block:: python

        MD_EXTENSIONS = {
            'markdown.extensions.codehilite': {
                'css_class': 'highlight',
                'linenums': False,
                'use_pygments': False
            }
        }
