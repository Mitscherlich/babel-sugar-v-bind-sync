# babel-sugar-v-bind-sync

Syntactic sugar for v-bind `sync` modifier in JSX.

## Babel Compatibility Notes

This repo is only compatible with Babel 7.x, for 6.x please use [njleonzhang/babel-plugin-vue-jsx-sync](https://github.com/njleonzhang/babel-plugin-vue-jsx-sync)

## Usage

Install the dependencies:

```sh
# for yarn:
yarn add babel-sugar-v-bind-sync
# for npm:
npm install babel-sugar-v-bind-sync --save
```

In your `.babelrc`:

```json
{
  "plugins": ["babel-sugar-v-bind-sync"]
}
```

## Details

This plugin adds v-bind `sync` feature to the JSX and tries to mirror the same behavior as in vue-template-compiler, with a few differences:

1. You should use underscore (\_) instead of dot (.) for `sync` modifier (`foo_sync={this.bar}`)
2. It is recommended to use camelCase version of it (`propName_sync`) in JSX, but you can use kebab-case too (`prop-name_sync`).

```jsx
export default {
  data() {
    return {
      test: 'something',
    };
  },
  render(h) {
    return (
      <div>
        <component visible_sync={this.test} />
      </div>
    );
  },
};
```
