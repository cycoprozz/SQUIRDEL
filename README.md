# WordGame - A Modern Word Guessing Game

A polished, modern word guessing game inspired by Wordle with unique features to help players learn.

## Features

### Core Gameplay
- **5-letter and 6-letter modes** - Choose your preferred word length
- **6 attempts for 5-letter, 7 for 6-letter** - Strategic challenge levels
- **Color-coded feedback**:
  - 🟩 Green = Correct letter, correct position
  - 🟨 Yellow = Correct letter, wrong position  
  - ⬛ Gray = Letter not in word

### Unique Twist: Hint Summary
After each guess, see a hint summary showing:
- Number of letters from your guess that exist in the secret word
- Number of letters in the correct position

This helps players understand how close they are to the answer!

### Game Modes
- **Daily Challenge** - Same word for everyone each day
- **Unlimited Mode** - Practice with random words

### Accessibility
- **Dark mode by default** (with light mode toggle)
- **Colorblind-friendly mode** - Alternative colors for better distinction
- **Keyboard input support** - Type on your physical keyboard
- **Screen reader friendly** - ARIA labels

### Additional Features
- On-screen keyboard with color-coded keys
- Local storage for stats persistence
- Game statistics tracking

## How Duplicate Letter Logic Works

The game uses proper Wordle-style duplicate letter handling:

1. **First pass**: Mark all exact matches (green) - letters in the correct position
2. **Second pass**: For remaining letters, check for present (yellow) letters but only if there are still unmatched letters in the secret word

**Example**: Secret = "SPEED", Guess = "EERIE"
- First pass: Position 1 ('E' == 'E') → CORRECT
- Second pass: 
  - Secret still has one 'E' remaining
  - Guess has 'E' at position 4, which matches → PRESENT
  - Guess 'E' at position 0 has no remaining 'E' in secret → ABSENT

This ensures accurate feedback for words with repeated letters.

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack
- React + TypeScript
- Vite for fast development
- CSS Variables for theming
- Local Storage for persistence

## Project Structure

```
src/
├── components/       # UI Components
│   ├── HomeScreen.tsx
│   └── GameScreen.tsx
├── context/         # React Context
│   └── GameContext.tsx
├── data/            # Word lists
│   └── words.ts
├── types/           # TypeScript types
│   └── index.ts
└── utils/           # Game logic
    └── gameLogic.ts
```

## License

MIT
