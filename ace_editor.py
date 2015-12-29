# -*- coding: utf-8 -*-
from __future__ import print_function, unicode_literals

import six
from os import path
import shutil

from docutils import nodes
from docutils.parsers.rst import directives
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import TextLexer, get_lexer_by_name

import pelican.settings as pys
from pelican.settings import DEFAULT_CONFIG
from pelican import signals
from pelican.utils import pelican_open
from pelican.rstdirectives import Pygments


def set_default_settings(settings):
    settings.setdefault('ACE_EDITOR_THEME', 'chrome')
    settings.setdefault('ACE_EDITOR_SCROLL_TOP_MARGIN', 100)
    settings.setdefault('ACE_EDITOR_MAXLINES', 50)
    settings.setdefault('ACE_EDITOR_READONLY', True)
    settings.setdefault('ACE_EDITOR_AUTOSCROLL', True)
    settings.setdefault('ACE_EDITOR_SHOW_INVISIBLE', True)


def init_ace(pelican):
    set_default_settings(DEFAULT_CONFIG)
    if(pelican):
        set_default_settings(pelican.settings)


class JsVar(object):
    def __init__(self, generator):
        self.generator = generator

    def add(self, setting_name):
        setting = self.generator.settings.get(setting_name)
        if type(setting) is str:
            self.generator.ace_editor += "var %s = '%s';" % (
                setting_name, setting
            )
        elif type(setting) is bool:
            self.generator.ace_editor += "var %s = %s;" % (
                setting_name, str.lower(str(setting))
            )
        else:
            self.generator.ace_editor += "var %s = %s;" % (
                setting_name, str(setting)
            )


def generate_ace_editor(generator):
    generator.ace_editor = '<script %s%s%s></script>' % (
        'src="./ace-build/src-min-noconflict/ace.js" ',
        'type="text/javascript" ',
        'charset="utf-8"'
    )
    generator.ace_editor += '<style>'
    static_path = path.join(path.dirname(__file__), "static", "style.css")
    with pelican_open(static_path) as text:
        generator.ace_editor += text + '</style>'
    generator.ace_editor += '<script>'

    js_var = JsVar(generator)
    js_var.add('ACE_EDITOR_SCROLL_TOP_MARGIN')
    js_var.add('ACE_EDITOR_THEME')
    js_var.add('ACE_EDITOR_MAXLINES')
    js_var.add('ACE_EDITOR_READONLY')
    js_var.add('ACE_EDITOR_AUTOSCROLL')
    js_var.add('ACE_EDITOR_SHOW_INVISIBLE')

    script_path = path.join(path.dirname(__file__), "static", "script.js")
    with pelican_open(script_path) as text:
        generator.ace_editor += text + '</script>'

    generator._update_context(['ace_editor'])


def cp_ace_js(pelican, writer):
    src = path.join(path.dirname(__file__), "static", "ace-build")
    dest = path.join(pelican.settings['OUTPUT_PATH'], 'ace-build')
    if path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


class ExtendPygments(Pygments):
    def run(self):
        self.assert_has_content()
        try:
            lexer = get_lexer_by_name(self.arguments[0])
        except ValueError:
            # no lexer found - use the text one instead of an exception
            lexer = TextLexer()

        # Fetch the defaults
        if pys.PYGMENTS_RST_OPTIONS is not None:
            for k, v in six.iteritems(pys.PYGMENTS_RST_OPTIONS):
                # Locally set options overrides the defaults
                if k not in self.options:
                    self.options[k] = v

        if ('linenos' in self.options and
                self.options['linenos'] not in ('table', 'inline')):
            if self.options['linenos'] == 'none':
                self.options.pop('linenos')
            else:
                self.options['linenos'] = 'table'

        for flag in ('nowrap', 'nobackground', 'anchorlinenos'):
            if flag in self.options:
                self.options[flag] = True

        # noclasses should already default to False, but just in case...
        formatter = HtmlFormatter(noclasses=False, **self.options)
        parsed = highlight('\n'.join(self.content), lexer, formatter)
        parsed = parsed.replace(
            '<div class="highlight"><pre>',
            ''.join((
                '<pre class="highlight">',
                '<code class="language-%s">' % lexer.name.lower()
            ))
        )
        parsed = parsed.replace('</pre></div>', '</code></pre>')
        return [nodes.raw('', parsed, format='html')]


def register():
    directives.register_directive('code-block', ExtendPygments)
    directives.register_directive('sourcecode', ExtendPygments)

    signals.initialized.connect(init_ace)
    signals.article_generator_finalized.connect(generate_ace_editor)
    signals.article_writer_finalized.connect(cp_ace_js)
