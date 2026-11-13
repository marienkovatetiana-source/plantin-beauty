# Plantin Beauty Studio

Marketing website for a beauty studio on Plantinkaai in Antwerp, Belgium. The studio offers nails, lashes and brows, face and body care and permanent make-up, and runs its own beauty academy with in-person courses and an online course.

This is a portfolio project: the design was made in Figma and built by hand as a fast, accessible multi-page site without a framework.

## Who it is for

- Clients looking for a treatment in Antwerp: they see services and prices, read about the team and book through Treatwell or WhatsApp.
- Students looking for beauty courses: they compare courses, see what is included and apply or buy the online course.

## Pages

- **Home**: hero, treatments, why book with us, team, academy, reviews and visit details
- **Treatments**: nails, lashes and brows, face and body, permanent make-up, each with price list, FAQ and booking
- **Academy**: overview of courses and the online course, plus a page for each course
- **Checkout** flow for the online course: checkout, payment received, payment not completed
- **Salon policy**, **Privacy and cookies**, **404**

## Tech

Plain HTML, CSS and JavaScript, bundled with Vite. Pages share a header, footer and icon sprite through Handlebars partials. Photos are stored once as originals and converted at build time into WebP and JPEG in several widths, then served with `srcset` so each screen loads a suitable size.

## Structure

```
src/
  *.html            one file per page
  partials/         header, footer, cookie banner, icon sprite, SEO head tags
  css/              styles split by component and section; design tokens in tokens.css
  js/               small modules: menu, sliders, tabs, FAQ, cookies, checkout form
  images/           logos and SVG icons
  seo.json          title, description and keywords for every page
originals/          source photos
public/             favicon and social sharing image
scripts/            image conversion and icon sprite generation
vite.config.js      build setup, sitemap and robots.txt generation
```

## Design system

Colours, type, spacing and corner radii are defined as CSS custom properties in `src/css/tokens.css` and mirror the variables in the Figma file. The palette is limited to greys, a navy, a periwinkle family and a single raspberry accent. Headings and labels use Anonymous Pro, body text uses Inter (both from Google Fonts).

## SEO and sharing

Each page has its own title, description and keywords, a canonical link, Open Graph and Twitter tags. The home page adds structured data for a local business. Checkout and confirmation pages are marked `noindex`. A sitemap and `robots.txt` are generated at build time, and the site address is read from the `SITE_URL` environment variable.

## Accessibility

Semantic landmarks, a skip link, visible focus states, keyboard-friendly menus and accordions, text contrast checked against WCAG AA, and reduced-motion support.
