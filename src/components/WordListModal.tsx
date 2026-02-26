import { useState } from 'react';

// Fallback words - these are used when word list is empty
const FIVE_LETTER_WORDS = ['hello', 'world', 'apple', 'bread', 'chair', 'dance', 'earth', 'flame', 'grape', 'house'];
const SIX_LETTER_WORDS = ['garden', 'banana', 'planet', 'orange', 'silver', 'bridge', 'camera', 'dragon', 'forest', 'guitar'];

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: string) => void;
}

type WordLength = 5 | 6;

export function WordListModal({ isOpen, onClose, onSelectWord }: WordListModalProps) {
  const [selectedLength, setSelectedLength] = useState<WordLength>(5);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const words = selectedLength === 5 ? FIVE_LETTER_WORDS : SIX_LETTER_WORDS;
  
  const filteredWords = searchTerm
    ? words.filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
    : words;

  const handleWordClick = (word: string) => {
    onSelectWord(word);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal word-list-modal" onClick={e => e.stopPropagation()}>
        <div className="word-list-header">
          <h2>Word List</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="word-list-tabs">
          <button 
            className={`tab-btn ${selectedLength === 5 ? 'active' : ''}`}
            onClick={() => setSelectedLength(5)}
          >
            5 Letters ({FIVE_LETTER_WORDS.length})
          </button>
          <button 
            className={`tab-btn ${selectedLength === 6 ? 'active' : ''}`}
            onClick={() => setSelectedLength(6)}
          >
            6 Letters ({SIX_LETTER_WORDS.length})
          </button>
        </div>

        <div className="word-list-search">
          <input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="word-list-info">
          <p>Tap a word to use it as today's word, or close to play with a random word.</p>
        </div>

        <div className="word-list-grid">
          {filteredWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              className="word-item"
              onClick={() => handleWordClick(word)}
            >
              {word.toUpperCase()}
            </button>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <p className="no-results">No words found</p>
        )}
      </div>
    </div>
  );
}
