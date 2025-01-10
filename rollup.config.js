import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import postcssNesting from 'postcss-nesting'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'
import wpResolve from 'rollup-plugin-wp-resolve'
import glob from 'fast-glob'
import copy from 'rollup-plugin-copy'

const isProduction = process.env.NODE_ENV === 'production'

const globals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/blocks': 'wp.blocks',
    '@wordpress/i18n': 'wp.i18n',
    '@wordpress/element': 'wp.element',
    '@babel/runtime/helpers/toConsumableArray': '_toConsumableArray',
    '@babel/runtime/helpers/slicedToArray': '_slicedToArray',
}

const external = [
    'react',
    'react-dom',
    '@babel/runtime',
    '@wordpress/blocks',
    '@wordpress/i18n',
    '@wordpress/element',
    '@babel/plugin-transform-destructuring',
    '@babel/runtime/helpers/toConsumableArray',
    '@babel/runtime/helpers/slicedToArray',
]

const cssPluginConfig = [
    postcss({
        extract: true,
        minimize: true,
        syntax: 'postcss-scss',
        plugins: [postcssImport(), autoprefixer(), postcssNesting()],
    }),
]

const jsPluginConfig = [
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(
            isProduction ? 'production' : 'development'
        ),
    }),
    resolve(),
    json({ compact: true }),
    babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
    }),
    commonjs(),
    wpResolve(),
]

if (isProduction) {
    jsPluginConfig.push(terser())
}

const config = []

function globalJsConfig(name) {
    return {
        input: `./src/js/${name}.js`,
        output: {
            file: `./assets/js/${name}.min.js`,
            format: 'iife',
            globals,
        },
        external,
        plugins: jsPluginConfig,
    }
}

function globalCssConfig(name) {
    return {
        input: `./src/css/${name}.css`,
        output: {
            file: `./assets/css/${name}.min.css`,
        },
        plugins: cssPluginConfig,
    }
}

// core setup for main (frontend), admin and editor scripts and styles
const core = ['main', 'admin', 'editor']

core.forEach((name) => {
    config.push(globalCssConfig(name), globalJsConfig(name))
})

const blockScripts = await glob('./blocks/**/*.js')
const blockStyles = await glob('./blocks/**/*.css')
const blockMeta = await glob('./blocks/**/block.json')
const blockViews = await glob('./blocks/**/render.php')

const copiedConfig = new Set()

blockScripts.forEach((script) => {
    // get the relevant block.json
    const blockDir = script.replace(/\/[^/]+\.js$/, '')
    let meta = blockMeta.find((m) => m.startsWith(blockDir))
    let render = blockViews.find((v) => v.startsWith(blockDir))

    const copyConfig = []
    const targetConfig = []

    if (meta && !copiedConfig.has(meta)) {
        targetConfig.push({
            src: meta,
            dest: meta
                .replace('/blocks', '/assets/blocks')
                .replace('block.json', ''),
        })

        copiedConfig.add(meta)
    } else {
        meta = false
    }

    if (render && !copiedConfig.has(render)) {
        targetConfig.push({
            src: render,
            dest: render
                .replace('/blocks', '/assets/blocks')
                .replace('render.php', ''),
        })
        copiedConfig.add(render)
    } else {
        render = false
    }

    if (render || meta) {
        copyConfig.push(
            copy({
                targets: targetConfig,
            })
        )
    }

    config.push({
        input: script,
        output: {
            file: `./assets/${script.replace('.js', '.min.js')}`,
            format: 'iife',
            globals,
        },
        external,
        plugins: [...jsPluginConfig, ...copyConfig],
    })
})

blockStyles.forEach((style) => {
    config.push({
        input: style,
        output: {
            file: `./assets/${style.replace('.css', '.min.css')}`,
        },
        plugins: cssPluginConfig,
    })
})

export default config
