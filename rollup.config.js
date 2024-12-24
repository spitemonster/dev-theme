import postcss from 'rollup-plugin-postcss'
import postcssNesting from 'postcss-nesting'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'
import wpResolve from 'rollup-plugin-wp-resolve'
import * as fs from 'node:fs'
import * as path from 'jsr:@std/path'

// function names should be self explanatory
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory()
    })
}

function fileExists(name) {
    try {
        return fs.statSync(name).isFile()
    } catch {
        return false
    }
}

// probably a more efficient method for setting up config but ¯\_(ツ)_/¯
let config = [
    {
        input: './src/js/main.js',
        output: {
            file: './assets/js/main.js',
            format: 'iife',
        },
        plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' })],
    },
    {
        input: './src/js/editor.js',
        output: {
            file: './assets/js/editor.js',
            format: 'iife',
        },
        plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' })],
    },
    {
        input: './src/css/main.css',
        output: {
            file: './assets/css/main.css',
        },
        plugins: [
            postcss({
                extract: true,
                minimize: true,
                syntax: 'postcss-scss',
                plugins: [postcssImport(), autoprefixer(), postcssNesting()],
            }),
        ],
    },
    {
        input: './src/css/editor.css',
        output: {
            file: './assets/css/editor.css',
        },
        plugins: [
            postcss({
                extract: true,
                minimize: true,
                syntax: 'postcss-scss',
                plugins: [postcssImport(), autoprefixer(), postcssNesting()],
            }),
        ],
    },
]

const blocksDir = './blocks'
const blocks = getDirectories(blocksDir)
const cssPluginConfig = [
    postcss({
        extract: true,
        minimize: true,
        syntax: 'postcss-scss',
        plugins: [postcssImport(), autoprefixer(), postcssNesting()],
    }),
]

const jsPluginConfig = [
    json({ compact: true }),
    babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react'], // JSX
    }),
    commonjs(),
    wpResolve(),
]

// add custom blocks to config
blocks.forEach((blockName) => {
    const blockConfig = []

    const blockPath = path.join(blocksDir, blockName)
    const outputPath = `assets/blocks/${blockName}`

    // Check for JavaScript and CSS files
    const mainScript = path.join(blockPath, 'index.js')
    const viewScript = path.join(blockPath, 'view.js')
    const mainStyle = path.join(blockPath, 'style.css')
    const editorStyle = path.join(blockPath, 'editor.css')

    if (fileExists(mainScript)) {
        blockConfig.push({
            input: mainScript,
            output: {
                file: `${outputPath}/index.min.js`,
                format: 'iife',
            },
            plugins: jsPluginConfig,
        })
    }

    if (fileExists(viewScript)) {
        blockConfig.push({
            input: viewScript,
            output: {
                file: `${outputPath}/view.min.js`,
                format: 'iife',
            },
            plugins: jsPluginConfig,
        })
    }

    if (fileExists(mainStyle)) {
        blockConfig.push({
            input: mainStyle,
            output: {
                file: `${outputPath}/style.min.css`,
            },
            plugins: cssPluginConfig,
        })
    }

    if (fileExists(editorStyle)) {
        blockConfig.push({
            input: editorStyle,
            output: {
                file: `${outputPath}/editor.min.css`,
            },
            plugins: cssPluginConfig,
        })
    }

    config = [...config, ...blockConfig]
})

export default config
