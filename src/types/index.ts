// Game configuration types

export type WordLength = 5 | 6;
export type GameMode = 'daily' | 'unlimited';
export type Difficulty = 'normal' | 'hard';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterFeedback {
  letter: string;
  status: LetterStatus;
}

export interface Guess {
  word: string;
  feedback: LetterFeedback[];
}

export interface GameState {
  secretWord: string;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  wordLength: WordLength;
  gameMode: GameMode;
  difficulty: Difficulty;
  maxAttempts: number;
}

export interface HintSummary {
  lettersInWord: number;
  correctPosition: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: Record<number, number>;
}

export interface AppSettings {
  darkMode: boolean;
  colorblindMode: boolean;
  soundEnabled: boolean;
  lastPlayedDate?: string;
}

export interface DailyChallenge {
  date: string;
  wordIndex: number;
  wordLength: WordLength;
}
