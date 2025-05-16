import BaseScene from './BaseScene';

class Level1Scene extends BaseScene {
  constructor() {
    super('Level1Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 3;
  }

  preload() {
    console.log('Level1Scene preload started');
    // Directly load the character sprites
    this.load.spritesheet('adam', 'assets/Modern tiles_Free/Characters_free/Adam_16x16.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    
    // Load specific animations
    this.load.spritesheet('adam_idle', 'assets/Modern tiles_Free/Characters_free/Adam_idle_anim_16x16.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    
    this.load.spritesheet('adam_run', 'assets/Modern tiles_Free/Characters_free/Adam_run_16x16.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    
    // Load NPCs
    this.load.spritesheet('amelia', 'assets/Modern tiles_Free/Characters_free/Amelia_16x16.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    
    // Load tilesets
    this.load.image('tiles_interior', 'assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png');
    this.load.image('tiles_room', 'assets/Modern tiles_Free/Interiors_free/16x16/Room_Builder_free_16x16.png');
    this.load.image('tiles_set1', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/tilesets/Set 1.0.png');
    this.load.image('tiles_set2', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/tilesets/Set 1.1.png');
    this.load.image('tiles_set3', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/tilesets/Set 1.2.png');
    this.load.image('tiles_fences', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/tilesets/fences and ladders etc.png');
    
    // Load vegetation
    this.load.image('trees', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/Vegetation/Trees 3.png');
    this.load.image('veg_objects', 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/Vegetation/Some Objects.png');
  }

  create() {
    console.log('Level1Scene create started');
    
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Create a basic outdoor environment background using tiles
    this.createBackground();
    
    // Add trees and decorations
    this.createTrees();
    
    // Add a bench
    this.createBench();
    
    // Add player character
    this.createPlayerCharacter();
    
    // Add NPC
    this.createNPC(seeksBoy);
    
    // Add text for instructions
    this.createGameText();
    
    // Set up command listener
    this.setupCommandListener();
    
    console.log('Level1Scene created successfully');
  }
  
  createBackground() {
    // Create a green grass background using the tileset
    // Using Set 1.0.png which has grass tiles
    
    // First add a solid color base
    const bg = this.add.rectangle(0, 0, 2000, 1200, 0x85c17e);
    bg.setOrigin(0, 0);
    bg.setDepth(-10);
    
    // Add grass tiles from the tileset
    const tilesetName = this.textures.exists('tiles_set1') ? 'tiles_set1' : null;
    
    if (tilesetName) {
      // Create a grid of grass tiles
      for (let x = 0; x < 800; x += 32) {
        for (let y = 350; y < 600; y += 32) {
          // Create proper image slices from the tileset
          const tileX = x + Math.random() * 20 - 10;
          const tileY = y + Math.random() * 20 - 10;
          
          // Randomly choose different grass tiles
          const tile = this.add.image(tileX, tileY, tilesetName);
          tile.setScale(2);
          
          // Set the crop to select a specific grass tile from the tileset
          // These are approximate coordinates for grass tiles in Set 1.0.png
          tile.setCrop(32, 0, 16, 16);
          
          tile.setDepth(-5);
        }
      }
      
      // Add a path
      this.createPath();
    }
  }
  
  createPath() {
    // Create a dirt path using tiles
    const pathPoints = [
      { x: 100, y: 450 },
      { x: 200, y: 400 },
      { x: 400, y: 350 },
      { x: 600, y: 400 },
      { x: 700, y: 450 }
    ];
    
    // Use a different tile for the path
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      
      // Calculate how many tiles to place along the path
      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const steps = Math.ceil(distance / 20);
      
      for (let j = 0; j <= steps; j++) {
        const x = Phaser.Math.Linear(start.x, end.x, j / steps);
        const y = Phaser.Math.Linear(start.y, end.y, j / steps);
        
        // Create a path tile
        const pathTile = this.add.image(x, y, 'tiles_set1');
        pathTile.setScale(1.5);
        
        // Set crop to select a dirt/path tile
        pathTile.setCrop(48, 0, 16, 16);
        
        // Add some randomness to rotation and scale
        pathTile.setRotation(Math.random() * 0.2 - 0.1);
        pathTile.setDepth(1);
      }
    }
  }
  
  createTrees() {
    // Main tree that player can interact with
    const mainTree = this.add.image(400, 200, 'trees');
    mainTree.setOrigin(0.5, 1);
    mainTree.setScale(3);
    mainTree.setDepth(200);
    
    // Add physics and make it interactive
    this.physics.world.enable(mainTree);
    mainTree.body.setImmovable(true);
    this.makeInteractive(mainTree, 'tree');
    
    // Add more decorative trees
    const treePositions = [
      { x: 150, y: 150, scale: 2 },
      { x: 650, y: 180, scale: 2.5 },
      { x: 720, y: 250, scale: 1.5 }
    ];
    
    treePositions.forEach(tree => {
      const treeSprite = this.add.image(tree.x, tree.y, 'trees');
      treeSprite.setOrigin(0.5, 1);
      treeSprite.setScale(tree.scale);
      treeSprite.setDepth(tree.y);
    });
    
    // Add some flowers and small vegetation
    const vegPositions = [
      { x: 300, y: 300 },
      { x: 500, y: 200 },
      { x: 250, y: 400 },
      { x: 550, y: 350 }
    ];
    
    vegPositions.forEach(pos => {
      const veg = this.add.image(pos.x, pos.y, 'veg_objects');
      veg.setScale(2);
      veg.setDepth(pos.y);
      
      // Make the flowers interactive
      if (pos.x === 500 && pos.y === 200) {
        this.physics.world.enable(veg);
        veg.body.setImmovable(true);
        this.makeInteractive(veg, 'flowers');
      }
    });
  }
  
  createBench() {
    // Create a bench using the Room_Builder tileset
    if (this.textures.exists('tiles_room')) {
      const bench = this.add.image(600, 400, 'tiles_room');
      bench.setScale(2);
      
      // Set crop to select a bench tile
      bench.setCrop(368, 128, 32, 16);
      
      bench.setDepth(400);
      
      // Add physics
      this.physics.world.enable(bench);
      bench.body.setImmovable(true);
      
      // Make it interactive
      this.makeInteractive(bench, 'bench');
    }
  }
  
  createPlayerCharacter() {
    // Create the player character using Adam sprite
    this.player = this.physics.add.sprite(100, 350, 'adam');
    this.player.setScale(2);
    this.player.setDepth(350);
    this.player.setCollideWorldBounds(true);
    
    // Create animations
    if (!this.anims.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('adam_idle', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('player_run')) {
      this.anims.create({
        key: 'player_run',
        frames: this.anims.generateFrameNumbers('adam_run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Play idle animation
    this.player.anims.play('player_idle', true);
  }
  
  createNPC(seeksBoy) {
    // Create NPC using either Alex or Amelia sprite
    const npcX = 600;
    const npcY = 250;
    
    this.npc = this.physics.add.sprite(npcX, npcY, seeksBoy ? 'alex' : 'amelia');
    
    // If the sprites don't exist, use Adam as fallback
    if (!this.npc.texture.key) {
      this.npc = this.physics.add.sprite(npcX, npcY, 'adam');
    }
    
    this.npc.setScale(2);
    this.npc.setDepth(npcY);
    
    // Make NPC interactive
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Add collision with player
    this.physics.add.collider(this.player, this.npc);
  }
  
  setupCommandListener() {
    // Listen for command events from the UI
    if (typeof window !== 'undefined') {
      console.log('Setting up command listener in Level1Scene');
      
      const handleCommand = (e) => {
        const { command } = e.detail;
        console.log('Level1Scene received command:', command);
        
        // Check specifically for "go to tree" variations
        const lowerCmd = command.toLowerCase().trim();
        if (lowerCmd.includes('tree')) {
          console.log('Tree command detected');
          // Find the tree object
          const tree = this.interactiveObjects['tree'];
          if (tree) {
            console.log('Tree found, moving player');
            // Move player to the tree
            this.movePlayerTo(tree, () => {
              // Provide success feedback
              this.showFeedback(true);
              
              // Update instruction text
              if (!this.hasVisitedTree) {
                this.hasVisitedTree = true;
                if (this.instructionText) {
                  this.instructionText.setText("Great! Now try to interact with other objects or talk to the character.");
                }
              }
            });
          } else {
            console.warn('Tree object not found in interactiveObjects');
          }
        } else {
          // Pass to the normal command parser for other commands
          const parseCommand = this.game.registry.get('parseCommand');
          if (parseCommand) {
            const parsedCommand = parseCommand(command);
            if (parsedCommand) {
              this.handleCommand(parsedCommand);
            }
          } else {
            console.warn('parseCommand function not found in registry');
          }
        }
      };
      
      // Remove any existing listeners to avoid duplicates
      window.removeEventListener('commandSubmitted', handleCommand);
      
      // Add the new listener
      window.addEventListener('commandSubmitted', handleCommand);
      
      // Store the reference so we can remove it later if needed
      this.commandHandler = handleCommand;
    }
  }
  
  createGameText() {
    // Title with nicer styling
    this.add.text(400, 50, 'Level 1: First Contact', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { color: '#000000', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);
    
    // Instruction text with better visibility
    this.instructionText = this.add.text(400, 530, 'Try typing "go to tree" in the command box below!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 10, y: 5 },
      fixedWidth: 600,
      align: 'center'
    }).setOrigin(0.5);
  }
  
  movePlayerTo(targetSprite, onComplete = () => {}) {
    if (!targetSprite || !this.player) return;
    
    // Get target position
    const targetX = targetSprite.x;
    let targetY = targetSprite.y;
    
    // If the target has an origin at the bottom, adjust the position
    if (targetSprite.originY === 1) {
      targetY = targetY + 20;
    }
    
    // Calculate distance for duration
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      targetX, targetY
    );
    
    // Add visual indication of destination
    const destination = this.add.circle(targetX, targetY, 10, 0x00ff00, 0.5);
    destination.setDepth(100);
    
    // Calculate direction for sprite flipping
    const direction = targetX < this.player.x ? -1 : 1;
    this.player.setFlipX(direction === -1);
    
    // Play run animation
    this.player.anims.play('player_run', true);
    
    // Move the player
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: distance / 200 * 1000, // Speed: 200 pixels per second
      ease: 'Linear',
      onComplete: () => {
        // Remove destination indicator
        destination.destroy();
        
        // Switch back to idle animation
        this.player.anims.play('player_idle', true);
        
        // Call completion callback
        onComplete();
      }
    });
  }
  
  showFeedback(success) {
    if (success) {
      // Create heart animation
      const heart = this.add.image(this.player.x, this.player.y - 20, 'heart');
      if (!heart.texture.key) {
        // Create heart shape if texture doesn't exist
        const heartShape = this.add.star(this.player.x, this.player.y - 20, 5, 10, 15, 0xff0000);
        heartShape.setDepth(1000);
        
        // Animate it
        this.tweens.add({
          targets: heartShape,
          y: heartShape.y - 50,
          alpha: 0,
          scale: 2,
          duration: 1000,
          ease: 'Cubic.out',
          onComplete: () => heartShape.destroy()
        });
      } else {
        heart.setScale(0);
        heart.setDepth(1000);
        
        // Animate it
        this.tweens.add({
          targets: heart,
          scale: 2,
          y: heart.y - 50,
          duration: 1000,
          ease: 'Cubic.out',
          onComplete: () => {
            this.tweens.add({
              targets: heart,
              alpha: 0,
              duration: 300,
              onComplete: () => heart.destroy()
            });
          }
        });
      }
    }
  }
  
  onTalkTo(targetId) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === npcName) {
      this.conversationSteps++;
      
      // Update instruction text based on conversation progress
      if (this.conversationSteps === 1) {
        this.instructionText.setText(`The ${npcName} smiled back! Talk again to introduce yourself.`);
      } else if (this.conversationSteps === 2) {
        this.instructionText.setText(`Great! One more step - ask about their interests.`);
      } else if (this.conversationSteps >= this.requiredSteps) {
        this.instructionText.setText(`Congratulations! You've made your first contact!`);
        
        // Delay level completion to allow reading the message
        this.time.delayedCall(3000, () => {
          this.completeLevel();
        });
      }
    }
  }
  
  onInteractWith(targetId, verb) {
    // Handle interactions with objects
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === 'flowers' && verb === 'pick') {
      this.pickedFlowers = true;
      this.instructionText.setText(`You picked some pretty flowers. Maybe give them to the ${npcName}?`);
    } else if (targetId === npcName && verb === 'give' && this.pickedFlowers) {
      this.instructionText.setText(`The ${npcName} loved the flowers! They seem interested in talking more.`);
      this.conversationSteps = this.requiredSteps - 1; // Skip ahead
    }
  }
}

export default Level1Scene; 