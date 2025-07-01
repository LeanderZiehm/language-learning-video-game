import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { initPhaser } from '../phaser';

function GameCanvas({ profile }) {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameInstanceRef.current && gameContainerRef.current) {
      // Initialize the Phaser game
      gameInstanceRef.current = initPhaser(gameContainerRef.current, profile);
    }

    return () => {
      // Clean up the Phaser game instance when component unmounts
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [profile]);

  return (
    <div className="game-canvas-container w-full flex-grow flex items-center justify-center">
      <div 
        ref={gameContainerRef} 
        className="game-canvas relative" 
        style={{ 
          width: '800px',
          height: '600px',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 120px)',
          margin: '0 auto'
        }}
      >
        {/* Phaser will render the game canvas here */}
        
        {/* Floating verb panel */}
        <div id='floating-panel' className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 rounded-lg p-2 shadow-lg z-10">
          <div className="flex flex-wrap justify-center gap-2">
            {["go", "walk", "talk", "ask", "give", "take"].map(verb => (
              <button
                key={verb}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('verbClicked', { 
                    detail: { verb } 
                  }));
                }}
              >
                {verb}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCanvas; 