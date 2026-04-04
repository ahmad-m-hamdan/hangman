# Hangman Game

A simple Hangman game built using React and Tailwind CSS.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Installation

1. Clone this repository.
2. Generate a GitHub Personal Access Token (PAT):
   - Go to [https://github.com/settings/tokens](https://github.com/settings/tokens).
   - Click **"Generate new token"** → **"Generate new token (classic)"**.
   - Give it a name (e.g. `hangman-game`).
   - No special scopes are required for GitHub Models — you can leave all checkboxes unchecked.
   - Click **"Generate token"** and copy the token immediately (you won't see it again).
3. Create a `.env` file in the project root directory and add your GitHub PAT:  
   `REACT_APP_GITHUB_TOKEN=your-github-pat`  
   Replace `your-github-pat` with your actual token.
4. Run `npm install` to install dependencies.
5. Run `npm start` to start the game.

## Usage

1. Launch the game and that's it!
2. Guess letters to uncover the hidden word and avoid losing the game.

## Features

- Dynamic word selection from GitHub free AI Models API.
- User-friendly interface.
- Interactive gameplay.

## Technologies Used

- React
- Tailwind CSS
- GitHub Models API (via OpenAI SDK)

## Contributing

Contributions are welcome! Please create a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.

## Acknowledgments

- GitHub Models used for word selection: [https://github.com/marketplace/models](https://github.com/marketplace/models)
- Stick figure sample: Loray O'Connell (https://codepen.io/lorayoconnell/pen/pyayOP)

## Contact

For questions or feedback, feel free to reach out at ahmadmhdhamdan@gmail.com.
