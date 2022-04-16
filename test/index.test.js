import { it, expect } from 'vitest'
import { transformAsync } from '@babel/core';
import transformJsx from '@vue/babel-plugin-transform-vue-jsx';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import vBindSync from '../src/index';

const code = `function createApp() {
  return (
    <div>
      {/* a sync prop & plain props */}
      <component visible_sync={this.test} foo="bar">This will be ok</component>
      {/* a sync prop with array item & plain props */}
      <component visible_sync={this.test[1]} foo="bar">This will be ok</component>
      {/* a sync prop with oject item & plain props */}
      <component visible_sync={this.test.a} foo="bar">This will be ok</component>
      {/* a sync prop with array item & boolean props */}
      <component visible_sync={this.test.a} bool>This will be ok</component>
      {/* two sync props */}
      <component visible_sync={this.test.a} open_sync={this.test.b}>This will be ok</component>
      {/* a sync prop & \`v-on\` listener */}
      <component visible_sync={this.test} on={{click:this.test}}>This will be ok</component>
      {/* a sync prop & spread props */}
      <component visible_sync={this.test.a} {...{ props: { foo: 'bar' } }}>This will be ok</component>
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
