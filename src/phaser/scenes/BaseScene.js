import Phaser from 'phaser';

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.interactiveObjects = {};
  }

  makeInteractive(sprite, name) {
    sprite.setInteractive({ useHandCursor: true });
    
    // Store reference to sprite by name
    this.interactiveObjects[name] = sprite;
    
    // Add hover effect
    sprite.on('pointerover', () => {
      sprite.setTint(0x00ff00);
    });
    
    sprite.on('pointerout', () => {
      sprite.clearTint();
    });
    
    // Handle click
    sprite.on('pointerdown', () => {
      // Dispatch event to React component
      window.dispatchEvent(new CustomEvent('objectClicked', { 
        detail: { objectName: name } 
      }));
    });
  }

  handleCommand(parsedCommand) {
    if (!parsedCommand) {
      console.warn('BaseScene: Invalid command received');
      return;
    }
    
    console.log('BaseScene handling command:', parsedCommand);
    
    const { verb, targetId } = parsedCommand;
    
    // Special case for tree commands - attempt to directly get the tree
    if (targetId.includes('tree')) {
      console.log('Tree command detected in BaseScene');
      const tree = this.interactiveObjects['tree'];
      if (tree && (verb === 'go' || verb === 'walk' || verb === 'move')) {
        console.log('Moving to tree from BaseScene');
        this.movePlayerTo(tree, () => {
          this.showFeedback(true);
          // Special first-time instruction
          if (this.scene.key === 'Level1Scene' && !this.hasVisitedTree) {
            this.hasVisitedTree = true;
            if (this.instructionText) {
              this.instructionText.setText("Great! Now try to interact with other objects or talk to the character.");
            }
          }
        });
        return;
      }
    }
    
    const targetObject = this.interactiveObjects[targetId];
    
    if (!targetObject) {
      // Check for common objects with different names
      if (targetId === 'the tree' || targetId === 'a tree') {
        console.log('Handling renamed tree target');
        this.handleCommand({ verb, targetId: 'tree' });
        return;
      }
      
      console.log(`Object not found: ${targetId}`);
      return this.showFeedback(false);
    }
    
    // Highlight the target momentarily
    targetObject.setTint(0xffff00);
    this.time.delayedCall(500, () => {
      targetObject.clearTint();
    });
    
    // Handle different verbs
    switch (verb) {
      case 'go':
      case 'walk':
      case 'move':
        // Special visual feedback for tree in Level1
        if (targetId === 'tree' && this.scene.key === 'Level1Scene') {
          // Special first-time instruction
          if (!this.hasVisitedTree) {
            this.hasVisitedTree = true;
            if (this.instructionText) {
              this.instructionText.setText("Great! Now try to interact with other objects or talk to the character.");
            }
          }
        }
        
        this.movePlayerTo(targetObject, () => {
          this.showFeedback(true);
        });
        break;
      case 'talk':
      case 'ask':
        this.movePlayerTo(targetObject, () => {
          this.showFeedback(true);
          if (this.onTalkTo) {
            this.onTalkTo(targetId);
          }
        });
        break;
      case 'give':
      case 'pick':
      case 'take':
        this.movePlayerTo(targetObject, () => {
          this.showFeedback(true);
          if (this.onInteractWith) {
            this.onInteractWith(targetId, verb);
          }
        });
        break;
      default:
        this.showFeedback(false);
    }
  }

  completeLevel() {
    const currentKey = this.scene.key;
    let nextScene;
    
    switch (currentKey) {
      case 'Level1Scene':
        nextScene = 'Level2Scene';
        break;
      case 'Level2Scene':
        nextScene = 'Level3Scene';
        break;
      case 'Level3Scene':
        // Level 3 completion will trigger paywall first through event
        window.dispatchEvent(new CustomEvent('levelComplete', {
          detail: { level: 3 }
        }));
        
        // Check if user is already subscribed
        if (localStorage.getItem('subscribed') === 'true') {
          nextScene = 'Level4Scene';
        } else {
          return; // Wait for subscription
        }
        break;
      default:
        return;
    }
    
    if (nextScene) {
      // Add transition effect
      this.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
        if (progress === 1) {
          this.scene.start(nextScene);
        }
      });
    }
  }
}

export default BaseScene; 