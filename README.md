# Book Page Count and KDP Spine Estimator

Free, single-page browser tool that turns a word count into an estimated paperback page count, then calculates the Amazon KDP spine width and the full cover wrap size (with 0.125 in bleed).

**Live tool:** https://grades2018.github.io/book-page-count-estimator/

## Features

- Word count to page count for common trim sizes (5 x 8, 5.25 x 8, 5.5 x 8.5, 6 x 9, 7 x 10, 8.5 x 11)
- Layout density presets plus an optional words-per-page override
- Chapter openings, front matter and back matter included, rounded up to an even page count
- KDP spine width for white, cream, premium color and standard color paper
- Full cover wrap size in inches and millimeters
- Warnings for the KDP minimum page count, maximum page count and the 80-page spine text rule
- Paste text to count words; everything runs locally, nothing is uploaded
- No build step, no dependencies

## How the numbers work

- Pages = words / words per page, plus about half a page per chapter opening, plus front and back matter, rounded up to an even number.
- Words per page are rules of thumb for an 11 pt serif body. Your font, leading and margins change this, so treat the result as a planning estimate and check the page count of your formatted PDF.
- Spine width = page count x paper thickness, using the per-page values in the [KDP Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950): white 0.002252 in, cream 0.0025 in, premium color 0.002347 in, standard color 0.002252 in.
- Cover width = bleed + back cover + spine + front cover + bleed. Cover height = bleed + trim height + bleed.
- KDP maximum page counts also depend on trim size; the tool uses the widest limit per paper type. Confirm with the official KDP cover calculator before uploading.

## Run locally

Open `index.html` in a browser. To run the tests (Node 18+):

```sh
npm test
```

The calculation logic lives in [`calc.js`](calc.js) and can be reused in Node or the browser.

## Need the manuscript first?

[ImagineYourBook](https://www.imagineyourbook.com/) plans and drafts a complete book from your idea (text with a designed cover, Word and EPUB export). $0 7-day trial with a card, then $24.99/month unless you cancel. This tool is made by the ImagineYourBook team.

## See also

- [Awesome KDP AI Tools](https://github.com/grades2018/awesome-kdp-ai-tools)
- [Awesome Lists for Writers](https://github.com/grades2018/awesome-lists-for-writers)
- [fiction-slop-lint](https://github.com/grades2018/fiction-slop-lint)

## License

MIT. Not affiliated with Amazon or Kindle Direct Publishing.
