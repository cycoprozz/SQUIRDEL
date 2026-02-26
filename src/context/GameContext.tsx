import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { WordLength, GameMode, GameState, LetterFeedback, HintSummary, GameStats, AppSettings } from '../types';
import {
  getRandomWord,
  getDailyWord,
  isValidWord,
  getGuessFeedback,
  getHintSummary,
  isGuessCorrect,
  getMaxAttempts,
  loadStats,
  updateStats,
  loadSettings,
  saveSettings,
  saveDailyChallengeCompleted
} from '../utils/gameLogic';

interface GameContextType {
  // Game state
  gameState: GameState;
  currentHint: HintSummary | null;
  lastGuessFeedback: LetterFeedback[] | null;
  keyboardStatus: Record<string, 'correct' | 'present' | 'absent' | undefined>;
  
  // Stats & Settings
  stats: GameStats;
  settings: AppSettings;
  
  // Actions
  startGame: (wordLength: WordLength, gameMode: GameMode, customWord?: string) => void;
  submitGuess: (guess: string) => boolean;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  resetGame: () => void;
  toggleDarkMode: () => void;
  toggleColorblindMode: () => void;
  toggleSound: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    secretWord: '',
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    wordLength: 5,
    gameMode: 'unlimited',
    difficulty: 'normal',
    maxAttempts: 6
  });
  
  const [currentHint, setCurrentHint] = useState<HintSummary | null>(null);
  const [lastGuessFeedback, setLastGuessFeedback] = useState<LetterFeedback[] | null>(null);
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, 'correct' | 'present' | 'absent' | undefined>>({});
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // Initialize keyboard status from settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-colorblind', settings.colorblindMode ? 'true' : 'false');
  }, [settings.darkMode, settings.colorblindMode]);

  const startGame = useCallback((wordLength: WordLength, gameMode: GameMode, customWord?: string) => {
    let secretWord: string;
    
    // Use custom word if provided and valid, otherwise get word based on mode
    if (customWord && customWord.length > 0 && customWord.length === wordLength) {
      secretWord = customWord.toLowerCase();
      console.log('Using custom word:', secretWord);
    } else if (gameMode === 'daily') {
      secretWord = getDailyWord(wordLength);
      console.log('Using daily word:', secretWord);
    } else {
      secretWord = getRandomWord(wordLength);
      console.log('Using random word:', secretWord);
    }
    
    setGameState({
      secretWord,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      wordLength,
      gameMode,
      difficulty: 'normal',
      maxAttempts: getMaxAttempts(wordLength)
    });
    
    setCurrentHint(null);
    setLastGuessFeedback(null);
    setKeyboardStatus({});
  }, []);

  const updateKeyboardStatus = useCallback((feedback: LetterFeedback[]) => {
    setKeyboardStatus(prev => {
      const newStatus = { ...prev };
      
      for (const item of feedback) {
        const currentStatus = newStatus[item.letter];
        
        // Only update if new status is better
        if (item.status === 'correct') {
          newStatus[item.letter] = 'correct';
        } else if (item.status === 'present' && currentStatus !== 'correct') {
          newStatus[item.letter] = 'present';
        } else if (item.status === 'absent' && currentStatus !== 'correct' && currentStatus !== 'present') {
          newStatus[item.letter] = 'absent';
        }
      }
      
      return newStatus;
    });
  }, []);

  const submitGuess = useCallback((guess: string): boolean => {
    const word = guess.toLowerCase();
    
    // Validate word
    if (word.length !== gameState.wordLength) {
      return false;
    }
    
    if (!isValidWord(word, gameState.wordLength)) {
      return false;
    }
    
    // Get feedback
    const feedback = getGuessFeedback(word, gameState.secretWord);
    const hint = getHintSummary(word, gameState.secretWord);
    
    // Update keyboard
    updateKeyboardStatus(feedback);
    
    // Add guess to history
    const newGuesses = [...gameState.guesses, { word, feedback }];
    const won = isGuessCorrect(word, gameState.secretWord);
    const lost = !won && newGuesses.length >= gameState.maxAttempts;
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      currentGuess: '',
      gameStatus: won ? 'won' : lost ? 'lost' : 'playing'
    }));
    
    setLastGuessFeedback(feedback);
    setCurrentHint(hint);
    
    // Update stats on game end
    if (won || lost) {
      const newStats = updateStats(won, newGuesses.length);
      setStats(newStats);
      
      // Save daily challenge completion
      if (gameState.gameMode === 'daily') {
        saveDailyChallengeCompleted(won, gameState.wordLength, newGuesses.length);
      }
    }
    
    return true;
  }, [gameState, updateKeyboardStatus]);

  const addLetter = useCallback((letter: string) => {
    // Don't allow letters that are marked as absent (not in word)
    const upperLetter = letter.toUpperCase();
    if (keyboardStatus[upperLetter] === 'absent') {
      return;
    }
    
    setGameState(prev => {
      if (prev.currentGuess.length >= prev.wordLength || prev.gameStatus !== 'playing') {
        return prev;
      }
      return {
        ...prev,
        currentGuess: prev.currentGuess + letter.toLowerCase()
      };
    });
  }, [keyboardStatus]);

  const removeLetter = useCallback(() => {
    setGameState(prev => {
      if (prev.currentGuess.length === 0 || prev.gameStatus !== 'playing') {
        return prev;
      }
      return {
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    startGame(gameState.wordLength, gameState.gameMode);
  }, [gameState.wordLength, gameState.gameMode, startGame]);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => {
      const newSettings = { ...prev, darkMode: !prev.darkMode };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const toggleColorblindMode = useCallback(() => {
    setSettings(prev => {
      const newSettings = { ...prev, colorblindMode: !prev.colorblindMode };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSettings(prev => {
      const newSettings = { ...prev, soundEnabled: !prev.soundEnabled };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const value: GameContextType = {
    gameState,
    currentHint,
    lastGuessFeedback,
    keyboardStatus,
    stats,
    settings,
    startGame,
    submitGuess,
    addLetter,
    removeLetter,
    resetGame,
    toggleDarkMode,
    toggleColorblindMode,
    toggleSound
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
