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
    <div className="game-canvas-container w-full h-full flex-grow flex items-center justify-center">
      <div 
        ref={gameContainerRef} 
        className="game-canvas relative w-full h-full" 
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Phaser will render the game canvas here */}
        
        {/* Floating verb panel */}
        <div id='floating-panel' className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 rounded-lg p-2 shadow-lg z-10">
          <div className="flex flex-wrap justify-center gap-2">
            {["go","talk","to","the","tree","girl"].map(verb => (
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