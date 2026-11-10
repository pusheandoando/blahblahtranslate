# Blah Blah Translate
Chrome extension (Manifest V3) that translates whole web pages, selected text and text typed in input fields, no API key required. Written by Christian (@pusheandoando)





## Setup
1. Install Node.js 18 or newer.
2. Run `npm run setup` to download the library into `blahblahtranslate/lib`.
3. Open `chrome://extensions`, enable Developer mode, click Load unpacked and select the `blahblahtranslate` folder.





## How it works
- No script runs on a page until you use the extension. Scripts are injected on demand through the activeTab permission.
- Page texts are cleaned (invisible and control characters, repeated whitespace, strings without letters, URLs and emails) and sent in batches. Each batch is one request: the texts are joined by line breaks and split again after translation. If the line count does not match, the batch is split in halves until every text is translated on its own.
- Rate limits (429), server errors and network errors are retried with growing delays. Every request has a timeout, so nothing can hang forever.
- Only the top document is processed. Iframes, templates, canvas, math and code elements are skipped.
- Icons are inline SVG defined in `blahblahtranslate/shared/icons.js` (paths from the Lucide set), so no icon library or build step is needed.
- Batch size (measured as URL-encoded length), concurrency, retry and timeout settings live in `blahblahtranslate/shared/constants.js`.





## Limitations
- Content inside iframes is not translated.
- Content added to the page after the translation starts is not translated.
- A single text longer than about 5000 characters can be rejected by Google and is reported as failed.
- After reloading the extension from chrome://extensions, reload the open tabs before using it on them.