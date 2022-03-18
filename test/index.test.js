import { it, expect } from 'vitest'
import { transformAsync } from '@babel/core';
import transformJsx from '@vue/babel-plugin-transform-vue-jsx';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import vBindSync from '..';

const code = `function createApp() {
  return (
    <div>
      <component visible_sync={this.test} foo="bar">This will be ok</component>
      <component visible_sync={this.test[1]} foo="bar">This will be ok</component>
      <component visible_sync={this.test.a} foo="bar">This will be ok</component>
      <component visible_sync={this.test.a} open_sync={this.test.b}>This will be ok</component>
      <component visible_sync={this.test} on={{click:this.test}}>This will be ok</component>
    </div>
  )
}`

it('should compiled match snapshot', async () => {
  const output = await compile(code)

  expect(output).matchSnapshot()
})

function compile(input) {
  return transformAsync(input, {
    plugins: [syntaxJSX, vBindSync, transformJsx],
  }).then(({ code }) => code)
}
