import 'regenerator-runtime/runtime';
import { transformAsync } from '@babel/core';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import vBindSync from '../lib';
import prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';

const code = `
function createApp() {
  return (
    <div>
      <component visible_sync={this.test}>This will be ok</component>
      <component visible_sync={this.test[1]}>This will be ok</component>
      <component visible_sync={this.test.a}>This will be ok</component>
    </div>
  )
}
`;

function compile(input) {
  return transformAsync(input, {
    plugins: [syntaxJSX, vBindSync],
  });
}

function highlight(code, lang) {
  return `<pre data-lang="${lang}">
    <code class="lang-${lang}">${prism.highlight(code, prism.languages[lang])}</code>
  </pre>`;
}

const $ = (...args) => document.querySelector(...args);

(async function () {
  const $source = $('#source');
  const $output = $('#output');

  $source.innerHTML = highlight(code, 'jsx');
  const { code: result } = await compile(code);
  $output.innerHTML = highlight(result, 'javascript');
})();
