# dev

a very opinionated wordpress block theme using rollup for bundling and postcss for styles.

## notes

i generally do not like the prospect of plugin-per-block as i feel it can quickly become overwhelming with larger projects where you are managing not just custom block plugins but also SEO, content, UX and whatever other chaos the clients or users want or need to install. in addition, it is my belief that core functionality should be part of the theme and not separate from it.

i've been moving away from scss for a long time with a preference for postCSS and a more vanilla-esque editing experience, so rollup expects only css files, not scss. that said, nesting at the least is supported and it is not difficult to extend further functionality in postCSS or switch the build process to scss.

## requirements

uses deno's standard library so will not be compatible with npm out of the box.

## areas for improvement

i am not certain about how i am registering blocks; there is a lot of `file_exists` checking which i know can be kind of slow, so i am very open to input on how this could be improved.

## blocks

### card

a simple static block that allows the user to select an image, a caption and a url and renders an optionally linked figure on the front end.

### posts

a simple dynamic block that displays a list of posts of a given post type.
