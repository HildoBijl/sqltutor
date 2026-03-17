# SQL Valley - Source code

This `src` directory contains all source code for SQL Valley. It is organized into four categories of files/subfolders.

- Core configuration and styling
- Reusable utilities and components
- Educational logic and content
- Page composition and rendering

Together, these layers move from low-level configuration to high-level user-facing pages.

The files/subfolders are listed in *order of dependency*: later files/folders may import from earlier files/folders, but not the other way around.


## Core configuration and styling

First we set up some site-wide settings and theming.

- **[constants](./constants.ts)** defines a few site-wide settings, like the app name, the theme colors and more.
- **[theme](./theme.ts)** has a variety of theme settings determining the styling of the web app.
- **[index.css](./index.css)** contains further CSS styling.
- **[assets](./assets/)** contains various images, logos and other resources needed to display the web app.


## Reusable utilities and components

Next, we have a wide range of reusable utility functions and components, suitable for inclusion anywhere on the site.

- **[utils](./utils/)** has a large variety of JavaScript utility functions that are used across the site.
- **[mockData](./mockData/)** provides the sample data used in exercises, along with tools to process and apply it.
- **[store](./store/)** manages user settings and progress, storing them in localStorage and exposing hooks to read/update data.
- **[components](./components/)** contains reusable React UI components used throughout the app (such as layout containers, SQL editors, drawing tools).


## Educational logic and content

Given the above general-purpose utilities, we now zoom in on the educational matters.

- **[learning](./learning/)** contains the *engine* and UI for delivering educational content (tabs, exercises, grading, feedback). It does _not_ include actual content.
- **[curriculum](./curriculum/)** contains the *content itself*: modules with theory pages, summaries and exercises built using the learning tools.


## Page composition and rendering

All components are bundled into pages and rendered.

- **[navigation](./navigation/)** defines the pages of the web app, combining components into user-facing views and wiring them together via routing.
- **[App](./App.tsx)** imports the router and wraps it in global providers (state, theme, and such), then renders the full application.
- **[main](./main.tsx)** is the main file that Vite uses to set up and display the `App` component.


## Where to start

If you're new to the codebase:
- Familiarity with React is recommended.
- Start with [main](./main.tsx) and [App](./App.tsx) to understand how the app is initialized.
- Then explore [navigation](./navigation/) to see how pages are structured.
- From there, dive into [learning](./learning/) and [curriculum](./curriculum/) for the core educational content.
