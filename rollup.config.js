import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { node: '8' },
            modules: false,
            loose: true,
          },
        ],
      ],
    }),
    terser({
      output: { comments: false },
    }),
  ],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
};
