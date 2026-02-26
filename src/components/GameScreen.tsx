import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

interface GameScreenProps {
  onBackToHome: () => void;
}

export function GameScreen({ onBackToHome }: GameScreenProps) {
  const {
    gameState,
    currentHint,
    keyboardStatus,
    submitGuess,
    addLetter,
    removeLetter,
    resetGame
  } = useGame();

  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { secretWord, guesses, currentGuess, gameStatus, wordLength, maxAttempts, gameMode } = gameState;
  const attemptsRemaining = maxAttempts - guesses.length;

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (currentGuess.length !== wordLength) {
      setMessage(`Word must be ${wordLength} letters`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const success = submitGuess(currentGuess);
    if (!success) {
      setMessage('Not in word list');
      setTimeout(() => setMessage(null), 2000);
    }
  }, [currentGuess, wordLength, submitGuess]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameStatus !== 'playing') return;

    const key = event.key.toUpperCase();

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      removeLetter();
    } else if (/^[A-Z]$/.test(key)) {
      addLetter(key);
    }
  }, [gameStatus, handleSubmit, removeLetter, addLetter]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Show modal when game ends
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      setTimeout(() => setShowModal(true), 1500);
    }
  }, [gameStatus]);

  // Handle virtual keyboard press
  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACK') {
      removeLetter();
    } else {
      addLetter(key);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    setShowModal(false);
  };

  const handleBackHome = () => {
    setShowModal(false);
    onBackToHome();
  };

  // Generate row class based on word length
  const rowClass = wordLength === 5 ? 'row-5' : 'row-6';

  return (
    <div className="game-container">
      {/* Header Info */}
      <div className="game-header-info">
        <span className="game-mode-badge">
          {gameMode === 'daily' ? 'Daily' : 'Unlimited'} • {wordLength} Letters
        </span>
        <span className="attempts-remaining">
          {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} left
        </span>
      </div>

      {/* Game Board */}
      <div className="board">
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = isCurrentRow ? currentGuess : (guesses[rowIndex]?.word || '');
          const feedback = guesses[rowIndex]?.feedback || [];
          
          return (
            <div 
              key={rowIndex} 
              className={`row ${rowClass}`}
            >
              {Array.from({ length: wordLength }).map((_, tileIndex) => {
                const letter = guess[tileIndex] || '';
                const feedbackItem = feedback[tileIndex];
                const status = feedbackItem?.status || '';
                
                return (
                  <div
                    key={tileIndex}
                    className={`tile ${status} ${isCurrentRow && letter ? 'active' : ''}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Hint Summary */}
      {currentHint && (
        <div className="hint-summary">
          <div className="hint-item">
            <span className="hint-value">{currentHint.lettersInWord}</span>
            <span className="hint-label">Letters in word</span>
          </div>
          <div className="hint-item">
            <span className="hint-value">{currentHint.correctPosition}</span>
            <span className="hint-label">Correct position</span>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="message error">
          {message}
        </div>
      )}

      {/* Keyboard */}
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => {
              const isWide = key === 'ENTER' || key === 'BACK';
              const status = keyboardStatus[key === 'BACK' ? 'BACKSPACE' : key];
              
              return (
                <button
                  key={key}
                  className={`key ${isWide ? 'wide' : ''} ${status || ''}`}
                  onClick={() => handleKeyPress(key)}
                  aria-label={key === 'BACK' ? 'Backspace' : key}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className={`modal-title ${gameStatus}`}>
              {gameStatus === 'won' ? '🎉 You Won!' : '😞 Game Over'}
            </h2>
            
            <div className="modal-secret">
              {secretWord}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {gameStatus === 'won' 
                ? `You guessed the word in ${guesses.length} attempt${guesses.length !== 1 ? 's' : ''}!`
                : 'Better luck next time!'}
            </p>
            
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={handlePlayAgain}>
                Play Again
              </button>
              <button className="modal-btn secondary" onClick={handleBackHome}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
