# Render Shop

Render Shop is a five-page PC parts marketplace and build-planning demo. The project intentionally keeps the page structure in semantic HTML and the visual system in external CSS. JavaScript is used only where the interface needs behavior: catalog filtering, part selection, compatibility checks, checkout totals, theme persistence, and the Core assistant.

## Pages

| File                   | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `index.html`           | Home page and Core assistant entry point                                |
| `catalog.html`         | Parts catalog, category buttons, filters, sorting, and inspection modal |
| `builder.html`         | Selected parts, removal controls, pricing, and compatibility notes      |
| `recommendations.html` | Rule-based build recommendations                                        |
| `payment.html`         | Demo checkout form with live build totals and review confirmation       |

## HTML and CSS structure

The main layouts, forms, buttons, cards, templates, accessibility labels, and page content are written in the HTML files. The visual system is separated into `style.css`, `pages-additions.css`, `payment.css`, `inspection.css`, `theme.css`, and `ai-bubble.css`. Inline presentation styles have been removed so the pages are easier to read and grade.

`catalog-data.html` stores the catalog and researched price data in JSON script blocks while remaining part of the static HTML project. This avoids putting the product dataset inside application code.

## Run locally on Windows PowerShell

From this project folder:

```powershell
$env:GROQ_API_KEY="your_groq_key"
$env:GROQ_MODEL="openai/gpt-oss-20b"
$env:PORT="8787"
node server.js
```

Then open `http://localhost:8787`.

Keep the terminal open while using the site. Never put the API key in HTML, CSS, JavaScript, or a public repository. Groq model availability and free-tier limits can change, so the server checks available models and tries compatible fallbacks.

## Main behavior

Parts selected in the catalog are saved in `localStorage` under `renderShopBuild`. The builder and checkout read that same list, so removing a part updates the build and checkout totals. The Core assistant sends requests only to the local server proxy; the API key is never sent to the browser.
