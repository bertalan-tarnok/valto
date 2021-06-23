const { build } = require('esbuild');

build({
  bundle: true,
  platform: 'node',
  external: ['jsdom'],
  entryPoints: ['src/valto.ts'],
  format: 'cjs',
  loader: { '.ts': 'ts' },
  outfile: 'index.js',
  watch: {
    onRebuild(err) {
      if (err) console.error('build failed: ', err);
      else console.log('compiled');
    },
  },
}).then(() => {
  console.log('compiled');
});
