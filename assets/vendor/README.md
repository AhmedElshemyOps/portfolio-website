# InfraQuote PDF dependencies

- jsPDF 4.2.1: `https://registry.npmjs.org/jspdf/-/jspdf-4.2.1.tgz`, MIT license in `jspdf-LICENSE.txt`.
- DejaVu Sans regular and bold: redistributed under the license in `fonts/DejaVu-LICENSE.txt`.

The library and fonts load only when the user requests a client PDF. PDF creation uses text and drawing primitives; it does not parse user HTML or fetch remote user images.
