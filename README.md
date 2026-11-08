# Voss Lite : free one-page template for design engineer portfolios

A one-page HTML template: a name set huge on a lilac field with the portrait
between the words, letters that swell under the cursor, a word-by-word statement,
a four-project work grid, a contact line with copy-to-clipboard, and a footer
wordmark. One palette (Lilac), Mona Sans (self-hosted, variable width axis), no
build step, no dependencies. Respects `prefers-reduced-motion` and is a complete
static page without JavaScript.

**Live demo:** https://voss-lite.vercel.app

## Quick start
Edit `index.html`: your name, lede, status, location, socials, projects and the meta description all live there. When your site is ready, delete the `<p class="more">` line in the footer that points to the full theme.


1. Edit the text in `index.html`: your name (in the nav, the hero, the footer wordmark and the page title), the lede, the statement, the four projects, the email.
2. Replace `img/portrait.webp` (4:5) and the four covers in `mocks/` (4:3, 1200px wide) with your own. Keep the filenames or update the `src` paths.
3. Point each project card at your own URL, and update the two `mailto:` links and the copy button's `data-copy`.
4. Upload anywhere: it is static files. Vercel, Netlify and GitHub Pages host it free.

The name and the footer wordmark size themselves to fit, on one line on larger screens, so a longer name just sets smaller. On phones a long name stacks at spaces and hyphens, and the portrait moves above it.

## License

Free for personal and commercial use, including unlimited client projects. If you are building a site with it, attribution is appreciated but not required.

Free template directories and galleries may host and redistribute this template at no charge, provided they credit Mike Smith Design, link to https://github.com/mikesmithdesign/voss-lite, and keep this README and LICENSE.md with the download.

Not permitted: selling this template, charging for access to it, or including it in a paid product, template pack or subscription.

Full terms in LICENSE.md.

The portrait is a Pexels placeholder for preview only, replace it with your own before going live. The project covers are original renders of fictional products.

## Want more?

The full Voss theme adds the project windows assembling as you scroll, the portrait docking into the nav, case studies with animated page transitions, six colour palettes with a switcher, and Work, About and Notes pages. It is built in Astro.

[Voss, the full Astro theme for design engineer portfolios](https://mikesmithdesign.co.uk/themes/voss/)
