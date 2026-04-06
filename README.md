# Hangman Game

A simple Hangman game built using React and Tailwind CSS.

🎮 **Play it now:** [https://hangman-three-smoky.vercel.app/](https://hangman-three-smoky.vercel.app/)

## Table of Contents

- [Play Online](#play-online)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Play Online

No setup needed — just visit [https://hangman-three-smoky.vercel.app/](https://hangman-three-smoky.vercel.app/) to play instantly in your browser.

## Installation

1. Clone this repository.
2. Install dependencies:
   ```
   npm install
   ```
3. Generate a GitHub Personal Access Token (PAT):
   - Go to [https://github.com/settings/tokens](https://github.com/settings/tokens).
   - Click **"Generate new token"** → **"Generate new token (classic)"**.
   - Give it a name (e.g. `hangman-game`).
   - No special scopes are required for GitHub Models — leave all checkboxes unchecked.
   - Click **"Generate token"** and copy it immediately (you won't see it again).
4. Create a free account at [https://vercel.com](https://vercel.com) if you don't have one.
5. Install the Vercel CLI globally:
   ```
   npm install -g vercel
   ```
6. Log in to Vercel:
   ```
   vercel login
   ```
7. Link the project and add your token as an environment variable:
   - Run `vercel dev` and follow the prompts to link the project to your Vercel account.
   - Go to your project on [https://vercel.com/dashboard](https://vercel.com/dashboard) → **Settings** → **Environment Variables**.
   - Add a variable named `GITHUB_TOKEN` with your GitHub PAT as the value.
   - Stop `vercel dev`, then run it again — it will pull the token into your local `.env.local` automatically.

## Usage

1. Run the game locally using the Vercel CLI:
   ```
   vercel dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Select a difficulty level, then guess letters to uncover the hidden word!

## Features

- Dynamic word selection via a secure serverless API (Vercel) backed by GitHub Models.
- User-friendly interface with a retro pixel art theme.
- Interactive gameplay with on-screen and physical keyboard support.

## Technologies Used

- React
- Tailwind CSS
- GitHub Models API
- Vercel (serverless functions & hosting)

## Contributing

Contributions are welcome! Please create a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.

## Acknowledgments

- GitHub Models used for word selection: [https://github.com/marketplace/models](https://github.com/marketplace/models)
- Stick figure sample: Loray O'Connell (https://codepen.io/lorayoconnell/pen/pyayOP)

## Contact

For questions or feedback, feel free to reach out at ahmadmhdhamdan@gmail.com.
