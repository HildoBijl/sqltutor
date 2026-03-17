# Data store

The SQL Valley data store is responsible for storing all user-related data in localStorage.

The first file to note when examining the data store source code is:

- [utils](./utils.ts) contains various support functions used internally by the data store. These are not exported.

Once this has been set up, there is a variety of separate stores that all track a part of the user's data. Each exports its own functions and hooks.

- [settings](./settings/) is the part where all of the user's actions related to site settings are stored. This includes both actual settings (like light/dark mode) and usage patterns (like remembering that you closed that Skill Tree legend).
- [learning](./learning/) is the data store that tracks all data related to your educational experience. Think of the progress you made for each module from the Skill Tree.

Finally, there are some combining functions that support the above learning stores.

- [hooks](./hooks.ts) contains various hooks that combine functionalities from multiple data stores.
