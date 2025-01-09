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

function jsConfig(name) {
    return {
        input: `./src/js/${name}.js`,
        output: {
            file: `./assets/js/${name}.min.js`,
            format: 'iife',
            minimize: true,
        },
        plugins: jsPluginConfig,
    }
}

function cssConfig(name) {
    return {
        input: `./src/css/${name}.css`,
        output: {
            file: `./assets/css/${name}.min.css`,
        },
        plugins: cssPluginConfig,
    }
}

function blockScriptConfig(name, blockPath, outputPath) {
    let srcPath = path.join(blockPath, `${name}.js`)
    if (!fileExists(srcPath)) {
        return
    }

    return {
        input: srcPath,
        output: {
            file: `${outputPath}/${name}.min.js`,
            format: 'iife',
            minimize: true,
        },
        plugins: jsPluginConfig,
    }
}

function blockStyleConfig(name, blockPath, outputPath) {
    let srcPath = path.join(blockPath, `${name}.css`)

    if (!fileExists(srcPath)) {
        return
    }

    return {
        input: srcPath,
        output: {
            file: `${outputPath}/${name}.min.css`,
        },
        plugins: cssPluginConfig,
    }
}

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
        'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    resolve(),
    json({ compact: true }),
    babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react'],
    }),
    commonjs(),
    wpResolve(),
    terser(),
]

let config = []

// core setup for main (frontend), admin and editor scripts and styles
const core = ['main', 'admin', 'editor']
core.forEach((name) => {
    config.push(cssConfig(name), jsConfig(name))
})

// block config setup
const blocksDir = './blocks'
const blocks = getDirectories(blocksDir)

// add custom blocks to config
blocks.forEach((blockName) => {
    const blockPath = path.join(blocksDir, blockName)
    const outputPath = `assets/blocks/${blockName}`

    // // Check for JavaScript and CSS files
    // const editorScript = path.join(blockPath, 'index.js')
    // const viewScript = path.join(blockPath, 'view.js')
    // const mainStyle = path.join(blockPath, 'style.css')
    // const editorStyle = path.join(blockPath, 'editor.css')

    const scriptArr = ['index', 'view']
    const styleArr = [`style`, `editor`]

    console.log(scriptArr)
    console.log(styleArr)

    scriptArr.forEach((script) => {
        const blockJsConfig = blockScriptConfig(script, blockPath, outputPath)
        if (blockJsConfig) {
            config.push(blockJsConfig)
        } else {
            console.log(`${script} script doesn't exist`)
        }
    })

    styleArr.forEach((style) => {
        const blockCssConfig = blockStyleConfig(style, blockPath, outputPath)
        if (blockCssConfig) {
            config.push(blockCssConfig)
        } else {
            console.log(`${style} style doesn't exist`)
        }
    })
})

console.log(config)

export default config
