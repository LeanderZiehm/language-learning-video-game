import Phaser from 'phaser';
import Level1Scene from './scenes/Level1Scene';
import Level2Scene from './scenes/Level2Scene';
import Level3Scene from './scenes/Level3Scene';
import Level4Scene from './scenes/Level4Scene';

// Command parser utility function
export function parseCommand(command) {
  const verbs = ["go", "walk", "move", "pick", "talk", "ask", "give", "take"];
  
  const normalizedCommand = command.toLowerCase().trim();
  
  // Handle special case for "go to X" or "go X" command patterns
  if (normalizedCommand.startsWith('go ')) {
    // Extract the target (either after "to" or directly after "go")
    let targetId;
    if (normalizedCommand.startsWith('go to ')) {
      targetId = normalizedCommand.substring(6).trim();
    } else {
      targetId = normalizedCommand.substring(3).trim();
    }
    
    if (targetId) {
      return {
        verb: 'go',
        targetId
      };
    }
  }
  
  // Standard parsing for other commands
  const words = normalizedCommand.split(/\s+/);
  
  // Simple parsing: first word should be a verb, rest is the target
  if (words.length < 2) return null;
  
  const firstWord = words[0];
  const isFirstWordVerb = verbs.includes(firstWord);
  
  if (!isFirstWordVerb) return null;
  
  // Extract the target (everything after the verb)
  const targetId = words.slice(1).join(' ');
  
  return {
    verb: firstWord,
    targetId
  };
}

export function initPhaser(container, profile) {
  // Default game configuration
  const config = {
    type: Phaser.AUTO,
    parent: container,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [Level1Scene, Level2Scene, Level3Scene, Level4Scene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#000000'
  };

  // Create the game instance
  const game = new Phaser.Game(config);
  
  // Pass the profile data to the scenes
  game.registry.set('profile', profile || {});
  
  // Register command event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('commandSubmitted', (e) => {
      const { command } = e.detail;
      const parsedCommand = parseCommand(command);
      
      if (parsedCommand) {
        console.log('Parsed command:', parsedCommand);
        // Dispatch the parsed command to the active scene
        const scene = game.scene.getScenes(true)[0];
        if (scene && scene.handleCommand) {
          scene.handleCommand(parsedCommand);
        }
      } else {
        console.log('Could not parse command:', command);
      }
    });
    
    // Subscribe event listener
    window.addEventListener('userSubscribed', () => {
      game.registry.set('subscribed', true);
      
      // Start level 4 if it's not already started
      if (!game.scene.isActive('Level4Scene')) {
        game.scene.start('Level4Scene');
      }
    });
  }
  
  return game;
} 