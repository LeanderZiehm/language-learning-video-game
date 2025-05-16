import Phaser from 'phaser';
import { 
  loadCharacterSprites, 
  loadEnvironmentAssets, 
  createCharacterAnimations 
} from '../../assets/assetLoader';

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.interactiveObjects = {};
  }

  loadAssets() {
    // Load character sprites and environment assets
    loadCharacterSprites(this);
    loadEnvironmentAssets(this);
  }

  createPlayer(x, y) {
    // Try to use animated sprite first, fall back to static if needed
    let spriteKey = 'player_idle';
    if (this.textures.exists('player_idleAnim')) {
      spriteKey = 'player_idleAnim';
    }
    
    this.player = this.physics.add.sprite(x, y, spriteKey);
    this.player.setCollideWorldBounds(true);
    
    // Set up character animations if not already done
    if (!this.anims.exists('player_idle')) {
      createCharacterAnimations(this);
    }
    
    // Play idle animation if it exists
    if (this.anims.exists('player_idle')) {
      this.player.anims.play('player_idle', true);
    }
    
    // Scale the player sprite for better visibility
    this.player.setScale(2);
    
    return this.player;
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

  movePlayerTo(targetSprite, onComplete = () => {}) {
    if (!targetSprite || !this.player) return;
    
    // Get target position - offset slightly to stand in front of the object
    const targetX = targetSprite.x;
    
    // For the Y position, position the player at the bottom of the target
    // plus a small offset so they stand in front of it
    let targetY = targetSprite.y;
    
    // If the target has an origin at the bottom, adjust the position
    if (targetSprite.originY === 1) {
      // Position player in front of the object
      targetY = targetY + 10; // Stand slightly in front
    }
    
    // Special handling for trees
    if (targetSprite.texture.key === 'harvestTrees') {
      // Move to the bottom of the tree with some offset
      targetY = targetY + 15;
      
      // Move slightly to the side to look more natural
      // Randomly choose left or right
      const sideOffset = Math.random() > 0.5 ? 20 : -20;
      targetX += sideOffset;
    }
    
    // Calculate distance for duration
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      targetX, targetY
    );
    
    // Add a visual indication of the destination
    const destination = this.add.circle(targetX, targetY, 10, 0x00ff00, 0.5);
    destination.setDepth(100); // Make sure it's visible above other elements
    
    // Calculate direction for flipping the sprite
    const direction = targetX < this.player.x ? -1 : 1;
    this.player.setFlipX(direction === -1);
    
    // Play running animation
    if (this.anims.exists('player_run')) {
      this.player.anims.play('player_run', true);
    }
    
    // Create moving animation
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: distance / 200 * 1000, // speed: 200 pixels per second
      ease: 'Linear',
      onComplete: () => {
        // Remove destination indicator
        destination.destroy();
        
        // Switch back to idle animation
        if (this.anims.exists('player_idle')) {
          this.player.anims.play('player_idle', true);
        }
        
        // Call the completion callback
        onComplete();
      }
    });
  }

  createHeartAnimation(x, y) {
    const heart = this.add.sprite(x, y, 'heart').setScale(0);
    this.tweens.add({
      targets: heart,
      scale: 4, // Increase scale since heart sprite is smaller
      y: y - 50,
      duration: 700,
      ease: 'Quad.out',
      onComplete: () => {
        this.tweens.add({
          targets: heart,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            heart.destroy();
          }
        });
      }
    });
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

  handleCommand(parsedCommand) {
    if (!parsedCommand) return;
    
    const { verb, targetId } = parsedCommand;
    const targetObject = this.interactiveObjects[targetId];
    
    if (!targetObject) {
      // Check for common objects with different names
      if (targetId === 'the tree') {
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

  showFeedback(success) {
    if (success) {
      this.createHeartAnimation(this.player.x, this.player.y);
    }
    
    // In a real implementation, this would send specific feedback to the HUD
    // For now, we'll use the generic simulation in the HUD component
  }
}

export default BaseScene; 