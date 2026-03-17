# SQL Valley

![License](https://img.shields.io/badge/license-MIT-green)
![Built with React](https://img.shields.io/badge/built%20with-React-blue)
![Powered by Vite](https://img.shields.io/badge/bundler-Vite-purple)

SQL Valley is an interactive SQL tutorial for anyone looking to learn SQL or improve their skills. Developed by instructors at the [Eindhoven University of Technology](https://www.tue.nl/en/), it is completely free and open for everyone to use.

**Try it out: [sqlvalley.com](https://sqlvalley.com/)**


## Features

The SQL Valley web app is an innovative educational site (no installation required!) featuring:
- A SQL tutorial structured into dozens of small bite-sized modules.
- An interactive Skill Tree showing the hierarchy between modules and tracking your progress through them.
- Freedom to jump forwards and backwards, ensuring efficient learning.
- Theory conveyed through example-rich explanations, visual summaries and short instructional videos -- adapted to the user's preferences.
- Interactive SQL exercises through a live in-browser database using a realistic mock database.
- Automated feedback on exercise submissions with enhanced error detection.
- Didactic solutions for every exercise, connected to the theory explanations.
- A story/gamification layer (optional): solve a mystery as you progress through the content!
- Privacy ensured: all your data is stored locally on your device. No identifiable data is sent anywhere.


## Running SQL Valley locally

Make sure you have Node.js and npm installed.

```
git clone https://github.com/HildoBijl/sqlvalley.git
cd sqlvalley
npm install
npm run dev
```

This will open a new browser tab at http://localhost:3000/ showing the site locally.


## The tech stack

The app runs fully client-side, using an in-browser SQLite database. We use the following technology to make this happen.
- [Vite](https://vite.dev/) for development and bundling.
- [React](https://react.dev/) for front-end rendering.
- [Material UI](https://mui.com/material-ui/) for layout and styling.
- [CodeMirror](https://codemirror.net/) for our SQL input fields.
- [SQL.JS](https://sql.js.org/) to run [SQLite](https://sqlite.org/) as in-browser database.
- [Firebase](https://firebase.google.com/) for hosting.
- [Zustand](https://zustand.docs.pmnd.rs/learn/getting-started/introduction) and localStorage to track your progress.
All other parts, like the Skill Tree tool, the mock database and the storyline, are developed in-house.


## The documentation

For detailed architecture and code structure, see the [source directory (src)](./src/).


## Contributing

Feel free to open issues or submit pull requests. For major changes, please contact us first at [h.j.bijl@tue.nl](mailto:h.j.bijl@tue.nl).


## License

This project is licensed under the MIT License.

