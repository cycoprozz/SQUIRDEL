import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WordListModal } from './WordListModal';
import type { WordLength, GameMode } from '../types';

interface HomeScreenProps {
  onStartGame: () => void;
}

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { startGame, stats } = useGame();
  const [selectedLength, setSelectedLength] = useState<WordLength>(5);
  const [selectedMode, setSelectedMode] = useState<GameMode>('unlimited');
  const [showWordList, setShowWordList] = useState(false);
  const [customWord, setCustomWord] = useState<string | null>(null);

  const handlePlay = () => {
    console.log('Play clicked - customWord:', customWord, 'selectedLength:', selectedLength, 'selectedMode:', selectedMode);
    startGame(selectedLength, selectedMode, customWord || undefined);
    onStartGame();
  };

  const handleSelectWord = (word: string) => {
    console.log('Word selected:', word, 'length:', word.length);
    setCustomWord(word);
    setSelectedLength(word.length as WordLength);
  };

  const handleClearCustomWord = () => {
    setCustomWord(null);
  };

  return (
    <div className="home-screen">
      <div className="home-logo">
        <h1 className="home-title">SQUIRDLE</h1>
        <p className="home-subtitle">Guess the word in limited attempts</p>
      </div>

      <div className="home-options">
        <div className="option-group">
          <span className="option-label">Word Length</span>
          <div className="option-buttons">
            <button
              className={`option-btn ${selectedLength === 5 ? 'selected' : ''}`}
              onClick={() => setSelectedLength(5)}
            >
              5 Letters
            </button>
            <button
              className={`option-btn ${selectedLength === 6 ? 'selected' : ''}`}
              onClick={() => setSelectedLength(6)}
            >
              6 Letters
            </button>
          </div>
        </div>

        <div className="option-group">
          <span className="option-label">Game Mode</span>
          <div className="option-buttons">
            <button
              className={`option-btn ${selectedMode === 'daily' ? 'selected' : ''}`}
              onClick={() => setSelectedMode('daily')}
            >
              Daily Challenge
            </button>
            <button
              className={`option-btn ${selectedMode === 'unlimited' ? 'selected' : ''}`}
              onClick={() => setSelectedMode('unlimited')}
            >
              Unlimited
            </button>
          </div>
        </div>

        {/* Custom Word Selection */}
        <div className="option-group">
          <span className="option-label">Choose Word (Optional)</span>
          {customWord ? (
            <div className="selected-word-display">
              <span className="selected-word">{customWord.toUpperCase()}</span>
              <button 
                className="clear-word-btn" 
                onClick={handleClearCustomWord}
                aria-label="Clear selected word"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              className="view-words-btn"
              onClick={() => setShowWordList(true)}
            >
              📚 View Word List
            </button>
          )}
        </div>

        <button className="play-btn" onClick={handlePlay}>
          Play
        </button>

        <div className="stats-row">
          <button className="stats-btn">
            Games: {stats.gamesPlayed} | Wins: {stats.gamesWon}
          </button>
        </div>
      </div>

      <WordListModal 
        isOpen={showWordList}
        onClose={() => setShowWordList(false)}
        onSelectWord={handleSelectWord}
      />
    </div>
  );
}
