# dev

an opinionated wordpress block theme using rollup for bundling and postcss for styles.

## requirements

uses [deno](https://deno.com/)'s standard library in rollup config so will not be compatible with npm out of the box. deno is easy to set up out of the box and i would recommend it fully.

## installation

`git clone` this repo

`deno install` to install required packages

`deno run dev` to live update any changes to block or theme scripts and styles

`deno run build` to bundle and minify all scripts and styles into `/assets`

## notes

i generally do not like the prospect of plugin-per-block as i feel it can quickly become overwhelming with larger projects where you are managing not just custom block plugins but also SEO, content, UX and whatever other chaos the clients or users want or need to install. in addition, it is my belief that core functionality should be part of the theme and not separate from it. to that end this theme features block includes that are built into `/assets`. from there, it should be pretty straightforward to copy the content of a block's assets folder into another theme.

i've been moving away from scss for a long time with a preference for postCSS and a more vanilla-esque editing experience, so rollup expects only css files, not scss. that said, nesting at the least is supported and it is not difficult to extend further functionality in postCSS or switch the build process to scss.

features separate scripts and styles each for admin, editor and frontend (main).

block registration is partially handled by a transient to prevent unnecessary PHP `file_exists` lookups; whether a given block has scripts or styles is stored in this transient, which is checked when enqueuing. if blocks are updated at all, the transient is cleared and a new one is created, so you do not need to manually clear it when you create new blocks or update existing ones.
