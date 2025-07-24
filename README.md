# 🐍 Snake Game (React & Tailwind CSS Version)

A classic Snake game, rebuilt from the ground up with a modern tech stack: **Vite, React, and Tailwind CSS**. This version retains all the features of the original while offering a more modular, scalable, and maintainable codebase.

## ✨ Features

- **Classic Snake Gameplay**: Control the snake and grow by eating food.
- **Component-Based UI**: Built with reusable React components.
- **Utility-First Styling**: Styled with the power and flexibility of Tailwind CSS.
- **Blazing Fast Development**: Powered by Vite's instant hot module replacement (HMR).
- **Responsive Design**: Works perfectly on desktop and mobile devices.
- **High Score Tracking**: Keeps track of your best score using local storage.
- **Progressive Difficulty**: Game speed increases every 50 points.
- **Multiple Control Options**: Arrow keys, WASD, and touch controls.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 14 or higher) and npm installed on your machine.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/yourusername/react-snake-game.git](https://github.com/yourusername/react-snake-game.git)
    cd react-snake-game
    ```

2.  **Install NPM packages:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

4.  **Build for production:**
    ```bash
    npm run build
    ```
    This command builds the app for production to the `dist` folder.

## 📁 File Structure

The project uses a standard Vite + React structure for better organization and scalability.

````bash
/snake-game
├── dist/               # Production build output
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components (Header, Modal, etc.)
│   ├── pages/          # Page components (Home, Game, About)
│   ├── App.jsx         # Main application component and routing
│   ├── index.css       # Global styles and Tailwind directives
│   └── main.jsx        # React application entry point
├── .gitignore
├── index.html          # Main HTML template for Vite
├── package.json
├── postcss.config.js   # PostCSS configuration for Tailwind
├── tailwind.config.js  # Tailwind CSS theme customization
└── README.md
````

## 🛠️ Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A next-generation frontend tooling that provides a faster and leaner development experience.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **HTML5 Canvas**: For rendering the game board, snake, and food.
- **JavaScript (ES6+)**: For all the game logic, state management (with React Hooks), and interactivity.
- **Remix Icons**: For modern and clean UI icons.
- **Google Fonts**: For the 'Poppins' font family.

## 🎨 Customization

Customizing the game is straightforward:

- **Styling & Colors**: Modify utility classes directly in the JSX components or customize the theme in `tailwind.config.js`.
- **Game Mechanics**: All core game logic (speed, scoring, constants) can be found and adjusted within the `src/pages/GamePage.jsx` component.
- **UI Text & Layout**: Change the content and structure within the respective React components in the `src/components` and `src/pages` folders.

## 👨‍💻 Developer

**Nischay Bandodiya**

- Portfolio: [nischay-bandodiya-portfolio.vercel.app](https://nischay-bandodiya-portfolio.vercel.app)
- GitHub: [github.com/Nischayb99](https://github.com/Nischayb99)

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing! 🎮**

_Built with ❤️ and React by Nischay Bandodiya_
