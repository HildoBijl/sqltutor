# Data store

The SQL Valley data store is responsible for storing all user-related data in localStorage.

## General architecture

The Learning store has three sets of files.

- **[utils.ts](./utils.ts)** contains general tooling to set up new data stores.
- The various folders use these tools to set up data stores. Each folder contains a completely disconnected data store.
- **[hooks.ts](./hooks.ts)** uses the tools provided by the various data stores and expands on them, coming up with hooks that may combine various data stores.

## The various learning stores

Within the folders, we currently have the following learning stores.

- **[settings/](./settings/)** is the part where all of the user's actions related to site settings are stored. This includes both actual settings (like light/dark mode) and usage patterns.
- **[learning/](./learning/)** is the data store that tracks all data related to your educational experience. Think of the progress you made for each module from the Skill Tree.
- **[skillTreeSettings/](./skillTreeSettings/)** tracks the settings you apply to each of the various Skill Trees on the site. Like whether or not you closed the legend, have accessed the planning mode, or which goal you set in it.

## The learning store set-up

Want to add a learning store? Copy one of the existing ones and adjust it as you go. Every learning store consists of the following files.

- **types.ts** contains the format of the store in Typescript types.
- **slice.ts** adds the store actions to the store.
- **persist.ts** is responsible for partializing the store (removing data to only the storable entries) and hydrating it (adding in auxiliary data and checking existing data).
- **version.ts** has potential migrations, in case the learning store had a different set-up in the past.
- **store.ts** loads in the above four files, pulls in some utility functions from [utils.ts](./utils.ts), and assembles everything into a single functioning data store.
