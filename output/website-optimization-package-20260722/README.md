# Gin Website Optimization Package

This package contains the files needed to optimize the visual design of the Gin personal project website.

## Request

Please optimize the website visual design based on the existing code. Do not rewrite the project structure, do not change business logic, and do not invent project content.

## Goals

1. Improve the overall visual quality and professional feel.
2. Improve the homepage layout, hero section, project cards, sharing section, and contact section.
3. Improve project detail page layout, gallery presentation, and responsive behavior.
4. Keep the existing routes, data structure, text source, and image paths.
5. Use only the provided real project material. Do not invent project features, metrics, users, screenshots, outcomes, or captions.
6. After changes, explain which files changed and how to run or verify the site.

## Key Files

- `app/page.tsx`: homepage structure.
- `app/product/[slug]/page.tsx`: project detail page structure.
- `app/site-data.ts`: project data, text, links, image paths, categories, and sharing items.
- `app/globals.css`: global visual styles and responsive CSS.
- `app/layout.tsx`: root layout and metadata.
- `public/projects/`: real project screenshots and gallery images.
- `docs/requirements.md`: product requirements and acceptance criteria.
- `tests/rendered-html.test.mjs`: current server-rendered HTML checks.
- `package.json`: scripts and dependencies.
- `reference-screenshots/current-feedback.png`: screenshot of the current discussion/request context.

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Vinext / Vite / Cloudflare Worker style runtime

## Existing Commands

```bash
npm run dev
npm run build
npm test
npm run lint
```

## Important Constraints

- Keep content grounded in the provided source files and images.
- Do not use fake placeholder case-study content.
- Do not replace real screenshots with unrelated stock images.
- Do not remove existing project links or routes.
- Keep the site maintainable through `app/site-data.ts`.
