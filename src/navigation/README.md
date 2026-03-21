# Navigation

The navigation folder is responsible for bundling all the components defined elsewhere into sensible pages, as well as displaying the right page, based on the given URL.

It contains three parts. The first two are separately defined (no dependencies between them) and the third one bundles the other two together.

- **[layout/](./layout/)** defines the layout of a page: the header bar on top and the page below.
- **[pages/](./pages/)** contains all pages that can be displayed in the web app.
- **[router.tsx](./router.tsx)** imports all of the above, and uses the given URL to display the correct page in the right way. This is the only part that is exported.
