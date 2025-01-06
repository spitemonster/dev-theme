# dev

a very opinionated wordpress block theme using rollup for bundling and postcss for styles.

## notes

i generally do not like the prospect of plugin-per-block as i feel it can quickly become overwhelming with larger projects where you are managing not just custom block plugins but also SEO, content, UX and whatever other chaos the clients or users want or need to install. in addition, it is my belief that core functionality should be part of the theme and not separate from it.

i've been moving away from scss for a long time with a preference for postCSS and a more vanilla-esque editing experience, so rollup expects only css files, not scss. that said, nesting at the least is supported and it is not difficult to extend further functionality in postCSS or switch the build process to scss.

## requirements

uses [deno](https://deno.com/)'s standard library in rollup config so will not be compatible with npm out of the box. deno is easy to set up out of the box and i would recommend it fully.
