import type { LetterFeedback, HintSummary, WordLength, GameStats, DailyChallenge } from '../types';
import { FIVE_LETTER_WORDS, SIX_LETTER_WORDS } from '../data/words';

/**
 * Get a random word based on word length
 */
export function getRandomWord(wordLength: WordLength): string {
  const wordList = wordLength === 5 ? FIVE_LETTER_WORDS : SIX_LETTER_WORDS;
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

/**
 * Get the daily word based on date
 * Uses a deterministic algorithm to pick the same word for everyone on the same day
 */
export function getDailyWord(wordLength: WordLength): string {
  const wordList = wordLength === 5 ? FIVE_LETTER_WORDS : SIX_LETTER_WORDS;
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function to get consistent daily index
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % wordList.length;
  return wordList[index];
}

/**
 * Check if a word is valid 
 * Now allows ANY word of the correct length (5 or 6 letters)
 */
export function isValidWord(word: string, wordLength?: number): boolean {
  const cleanWord = word.toLowerCase().trim();
  const len = cleanWord.length;
  
  // Check if it's a valid length (5 or 6 letters)
  if (len !== 5 && len !== 6) return false;
  
  // If wordLength is specified, check if it matches
  if (wordLength !== undefined && len !== wordLength) return false;
  
  // Allow any word with only letters
  return /^[a-z]+$/.test(cleanWord);
}

/**
 * Generate feedback for a guess against the secret word.
 * 
 * DUPLICATE LETTER LOGIC (Wordle-style):
 * 
 * When a letter appears multiple times in the guess, we need to handle it carefully:
 * 1. First, mark all CORRECT (green) positions - letters that match exactly
 * 2. Then, for remaining letters, check for PRESENT (yellow) letters
 *    but only count them if there are still unmatched letters in the secret word
 * 
 * Example: Secret = "SPEED", Guess = "EERIE"
 * - Position 0: 'E' vs 'S' -> not match
 * - Position 1: 'E' vs 'P' -> not match  
 * - Position 2: 'R' vs 'E' -> not match
 * - Position 3: 'I' vs 'E' -> not match
 * - Position 4: 'E' vs 'D' -> not match
 * 
 * First pass (find exact matches):
 * - Secret has 'E' at positions 1, 2
 * - Guess has 'E' at positions 0, 1, 4
 * - Position 1: 'E' == 'E' -> CORRECT
 * 
 * Second pass (handle duplicates for yellow):
 * - Remaining secret letters: P, E, D (one E left after exact match)
 * - Remaining guess letters: E at pos 0, E at pos 4
 * - Guess E at pos 0: 'E' in secret? Yes (but already matched) -> ABSENT
 * - Guess E at pos 4: 'E' in secret? Yes (remaining) -> PRESENT
 * 
 * @param guess - The guessed word
 * @param secret - The secret word
 * @returns Array of LetterFeedback with status for each position
 */
export function getGuessFeedback(guess: string, secret: string): LetterFeedback[] {
  const guessLower = guess.toLowerCase();
  const secretLower = secret.toLowerCase();
  
  const feedback: LetterFeedback[] = [];
  const secretChars = secretLower.split('');
  const guessChars = guessLower.split('');
  const secretCharCounts: Record<string, number> = {};
  
  // Count characters in secret word
  for (const char of secretChars) {
    secretCharCounts[char] = (secretCharCounts[char] || 0) + 1;
  }
  
  // First pass: Find exact matches (CORRECT)
  const exactMatchedIndices: number[] = [];
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === secretChars[i]) {
      feedback[i] = { letter: guessChars[i], status: 'correct' };
      exactMatchedIndices.push(i);
      secretCharCounts[guessChars[i]]--;
    }
  }
  
  // Second pass: Find present but wrong position (PRESENT)
  for (let i = 0; i < guessChars.length; i++) {
    // Skip if already marked as correct
    if (exactMatchedIndices.includes(i)) {
      continue;
    }
    
    const char = guessChars[i];
    if (secretCharCounts[char] && secretCharCounts[char] > 0) {
      feedback[i] = { letter: char, status: 'present' };
      secretCharCounts[char]--;
    } else {
      feedback[i] = { letter: char, status: 'absent' };
    }
  }
  
  // Fill any remaining (shouldn't happen but just in case)
  for (let i = 0; i < guessChars.length; i++) {
    if (!feedback[i]) {
      feedback[i] = { letter: guessChars[i], status: 'absent' };
    }
  }
  
  return feedback;
}

/**
 * Calculate hint summary after a guess
 * Shows:
 * - Number of letters that exist in the secret word (regardless of position)
 * - Number of letters in the correct position
 */
export function getHintSummary(guess: string, secret: string): HintSummary {
  const guessLower = guess.toLowerCase();
  const secretLower = secret.toLowerCase();
  
  // Count letters in correct position
  let correctPosition = 0;
  for (let i = 0; i < guessLower.length; i++) {
    if (guessLower[i] === secretLower[i]) {
      correctPosition++;
    }
  }
  
  // Count unique letters that exist in secret word (regardless of position)
  const secretChars = new Set(secretLower.split(''));
  let lettersInWord = 0;
  const countedLetters = new Set<string>();
  
  for (const char of guessLower) {
    if (secretChars.has(char) && !countedLetters.has(char)) {
      lettersInWord++;
      countedLetters.add(char);
    }
  }
  
  return {
    lettersInWord,
    correctPosition
  };
}

/**
 * Check if the guess is correct
 */
export function isGuessCorrect(guess: string, secret: string): boolean {
  return guess.toLowerCase() === secret.toLowerCase();
}

/**
 * Get max attempts based on word length
 */
export function getMaxAttempts(wordLength: WordLength): number {
  return wordLength === 5 ? 6 : 7;
}

/**
 * Load game stats from local storage
 */
export function loadStats(): GameStats {
  try {
    const stored = localStorage.getItem('wordgame_stats');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    guessDistribution: {}
  };
}

/**
 * Save game stats to local storage
 */
export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem('wordgame_stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

/**
 * Update stats after a game ends
 */
export function updateStats(won: boolean, guesses: number): GameStats {
  const stats = loadStats();
  
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
    stats.guessDistribution[guesses] = (stats.guessDistribution[guesses] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(stats);
  return stats;
}

/**
 * Load app settings from local storage
 */
export function loadSettings(): { darkMode: boolean; colorblindMode: boolean; soundEnabled: boolean } {
  try {
    const stored = localStorage.getItem('wordgame_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  
  return {
    darkMode: true,
    colorblindMode: false,
    soundEnabled: true
  };
}

/**
 * Save app settings to local storage
 */
export function saveSettings(settings: { darkMode: boolean; colorblindMode: boolean; soundEnabled: boolean }): void {
  try {
    localStorage.setItem('wordgame_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/**
 * Get today's daily challenge info
 */
export function getDailyChallenge(): DailyChallenge {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash for consistency
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Alternate between 5 and 6 letter words based on day
  const wordLength: WordLength = Math.abs(hash) % 2 === 0 ? 5 : 6;
  const wordList = wordLength === 5 ? FIVE_LETTER_WORDS : SIX_LETTER_WORDS;
  const wordIndex = Math.abs(hash) % wordList.length;
  
  return {
    date: dateString,
    wordIndex,
    wordLength
  };
}

/**
 * Check if daily challenge has been completed today
 */
export function isDailyChallengeCompleted(): boolean {
  try {
    const stored = localStorage.getItem('wordgame_daily');
    if (stored) {
      const daily = JSON.parse(stored);
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      return daily.date === dateString && daily.completed;
    }
  } catch (e) {
    console.error('Failed to check daily challenge:', e);
  }
  return false;
}

/**
 * Save daily challenge completion
 */
export function saveDailyChallengeCompleted(won: boolean, wordLength: WordLength, guesses: number): void {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  try {
    localStorage.setItem('wordgame_daily', JSON.stringify({
      date: dateString,
      completed: true,
      won,
      wordLength,
      guesses
    }));
  } catch (e) {
    console.error('Failed to save daily challenge:', e);
  }
}
