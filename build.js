const esbuild = require('esbuild')

const isWatch = process.argv.includes('--watch')

const buildOptions = {
  entryPoints: ['src/widget.js'],
  bundle: true,
  format: 'iife',
  outfile: 'dist/widget.js',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  target: ['es2020'],
  loader: { '.css': 'text' },
  logLevel: 'info',
}

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch()
    console.log('Watching for changes...')
  })
} else {
  esbuild.build(buildOptions)
}
