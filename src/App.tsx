import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';

function AppContent() {
  const { settings, toggleDarkMode, toggleColorblindMode, toggleSound } = useGame();
  const [inGame, setInGame] = useState(false);
  
  const handleStartGame = () => {
    setInGame(true);
  };
  
  const handleBackToHome = () => {
    setInGame(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">SQUIRDLE</h1>
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={toggleDarkMode}
            aria-label={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {settings.darkMode ? '🌙' : '☀️'}
          </button>
          <button 
            className="icon-btn" 
            onClick={toggleColorblindMode}
            aria-label={settings.colorblindMode ? 'Disable colorblind mode' : 'Enable colorblind mode'}
          >
            👁️
          </button>
          <button 
            className="icon-btn" 
            onClick={toggleSound}
            aria-label={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {settings.soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        {!inGame ? (
          <HomeScreen onStartGame={handleStartGame} />
        ) : (
          <GameScreen onBackToHome={handleBackToHome} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
