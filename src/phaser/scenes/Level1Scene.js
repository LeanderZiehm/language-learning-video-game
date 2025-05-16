import BaseScene from './BaseScene';

class Level1Scene extends BaseScene {
  constructor() {
    super('Level1Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 3;
    this.isInDialogue = false;
    this.dialogueText = '';
    this.currentTextIndex = 0;
    this.textSpeed = 30; // ms per character
    this.inChat = false;
    this.playerInput = '';
    this.chatResponses = {
      'hello': 'Hi there! How are you today?',
      'hi': 'Hello! Nice to meet you!',
      'how are you': 'I\'m doing great, thanks for asking!',
      'what\'s your name': 'My name is Amelia. What\'s yours?',
      'name': 'My name is Amelia. What\'s yours?',
      'where are you from': 'I\'m from Madrid. I moved here a few months ago.',
      'from': 'I\'m from Madrid. I moved here a few months ago.',
      'do you speak spanish': 'Sí, hablo español! ¿Tu hablas español también?',
      'spanish': 'Sí, hablo español! ¿Tu hablas español también?',
      'i like you': 'Aw, that\'s sweet of you to say! I enjoy talking with you too.',
      'like you': 'Aw, that\'s sweet of you to say! I enjoy talking with you too.',
      'bye': 'Goodbye! Hope to see you again soon!',
      'goodbye': 'Hasta luego! It was nice talking to you!'
    };
    this.defaultResponse = "I'm not sure what to say to that. Can you try something else?";
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
    
    // Load close-up sprite
    this.load.image('sprite_close_up', 'src/assets/sprite_close_up.webp');
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
    
    // Add player character
    this.createPlayerCharacter();
    
    // Add NPC
    this.createNPC(seeksBoy);
    
    // Add text for instructions
    this.createGameText();
    
    // Create dialogue UI (initially hidden)
    this.createDialogueUI();
    
    // Set up command listener
    this.setupCommandListener();
    
    // Setup input for advancing dialogue and chat
    this.input.on('pointerdown', () => {
      if (this.isInDialogue && !this.inChat) {
        if (this.isTextComplete) {
          this.hideDialogue();
        } else {
          // If text is still typing, complete it immediately
          this.completeText();
        }
      }
    });
    
    // Setup keyboard input for dialogue and chat
    this.input.keyboard.on('keydown', (event) => {
      if (this.isInDialogue) {
        if (this.inChat) {
          // Handle chat input
          if (event.key === 'Backspace') {
            this.playerInput = this.playerInput.slice(0, -1);
            this.updateChatInputDisplay();
          } else if (event.key === 'Enter') {
            this.submitChatMessage();
          } else if (event.key.length === 1) {
            // Only add printable characters
            this.playerInput += event.key;
            this.updateChatInputDisplay();
          }
        } else if (this.isTextComplete) {
          // Handle dialogue navigation
          if (event.key === ' ' || event.key === 'Enter') {
            this.hideDialogue();
          } else if (event.key === 'c' || event.key === 'C') {
            this.showChatInput();
          }
        } else {
          // If text is still typing and any key is pressed, complete it
          this.completeText();
        }
      }
    });
    
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

  createDialogueUI() {
    // Create a container for dialogue elements
    this.dialogueContainer = this.add.container(400, 300);
    this.dialogueContainer.setDepth(1000); // Set high depth to appear above everything
    this.dialogueContainer.setVisible(false);
    
    // Add dark overlay
    this.overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
    this.overlay.setOrigin(0.5);
    this.dialogueContainer.add(this.overlay);
    
    // Add character portrait (close-up)
    this.portrait = this.add.image(0, -50, 'sprite_close_up');
    // Scale the portrait to fit nicely
    if (this.textures.exists('sprite_close_up')) {
      this.portrait.setScale(0.5);
    } else {
      // Create a placeholder portrait if image doesn't exist
      this.portrait = this.add.rectangle(0, -50, 300, 300, 0xff44aa);
      this.portrait.setOrigin(0.5);
    }
    this.dialogueContainer.add(this.portrait);
    
    // Add dialogue box
    this.dialogueBox = this.add.rectangle(0, 150, 700, 150, 0x222222, 0.9);
    this.dialogueBox.setStrokeStyle(4, 0xffffff);
    this.dialogueContainer.add(this.dialogueBox);
    
    // Add text
    this.dialogueText = this.add.text(-325, 90, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      wordWrap: { width: 650 }
    });
    this.dialogueContainer.add(this.dialogueText);
    
    // Add click to continue indicator
    this.continueIndicator = this.add.text(300, 180, '[ Click to continue ]', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    this.continueIndicator.setVisible(false);
    this.dialogueContainer.add(this.continueIndicator);
    
    // Add chat input elements (initially hidden)
    this.chatInputBox = this.add.rectangle(0, 230, 700, 40, 0x333333);
    this.chatInputBox.setStrokeStyle(2, 0xffffff);
    this.chatInputBox.setVisible(false);
    this.dialogueContainer.add(this.chatInputBox);
    
    this.chatInputText = this.add.text(-325, 222, '> ', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.chatInputText.setVisible(false);
    this.dialogueContainer.add(this.chatInputText);
    
    this.chatSubmitButton = this.add.rectangle(325, 230, 80, 30, 0x555555);
    this.chatSubmitButton.setStrokeStyle(1, 0xffffff);
    this.chatSubmitButton.setInteractive({ useHandCursor: true });
    this.chatSubmitButton.on('pointerdown', this.submitChatMessage.bind(this));
    this.chatSubmitButton.setVisible(false);
    this.dialogueContainer.add(this.chatSubmitButton);
    
    this.chatSubmitText = this.add.text(295, 222, 'Send', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    this.chatSubmitText.setVisible(false);
    this.dialogueContainer.add(this.chatSubmitText);
    
    // Add chat indicator 
    this.chatIndicator = this.add.text(0, 180, '[ Press ENTER to chat ]', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    this.chatIndicator.setOrigin(0.5);
    this.chatIndicator.setVisible(false);
    this.dialogueContainer.add(this.chatIndicator);
  }
  
  showDialogue(text) {
    // Show dialogue UI
    this.dialogueContainer.setVisible(true);
    this.isInDialogue = true;
    this.fullText = text;
    this.currentDisplayedText = '';
    this.currentTextIndex = 0;
    this.isTextComplete = false;
    this.dialogueText.setText('');
    this.continueIndicator.setVisible(false);
    this.chatIndicator.setVisible(false);
    this.hideChatInput();
    
    // Start typing effect
    this.typewriterTimer = this.time.addEvent({
      delay: this.textSpeed,
      callback: this.typeNextLetter,
      callbackScope: this,
      loop: true
    });
  }
  
  typeNextLetter() {
    if (this.currentTextIndex < this.fullText.length) {
      // Add next letter
      this.currentDisplayedText += this.fullText.charAt(this.currentTextIndex);
      this.dialogueText.setText(this.currentDisplayedText);
      this.currentTextIndex++;
    } else {
      // Text is complete
      this.typewriterTimer.remove();
      this.isTextComplete = true;
      
      if (this.inChat) {
        this.showChatInput();
      } else {
        this.continueIndicator.setVisible(true);
        this.chatIndicator.setVisible(true);
        
        // Add blinking effect to indicators
        this.tweens.add({
          targets: [this.continueIndicator, this.chatIndicator],
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }
  
  completeText() {
    // Immediately show full text
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    this.dialogueText.setText(this.fullText);
    this.isTextComplete = true;
    
    if (this.inChat) {
      this.showChatInput();
    } else {
      this.continueIndicator.setVisible(true);
      this.chatIndicator.setVisible(true);
    }
  }
  
  hideDialogue() {
    this.dialogueContainer.setVisible(false);
    this.isInDialogue = false;
    this.inChat = false;
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    
    // Stop any tweens on the indicators
    this.tweens.killTweensOf(this.continueIndicator);
    this.tweens.killTweensOf(this.chatIndicator);
    
    // Hide chat input
    this.hideChatInput();
  }
  
  showChatInput() {
    this.inChat = true;
    this.chatInputBox.setVisible(true);
    this.chatInputText.setVisible(true);
    this.chatSubmitButton.setVisible(true);
    this.chatSubmitText.setVisible(true);
    this.continueIndicator.setVisible(false);
    this.chatIndicator.setVisible(false);
    this.playerInput = '';
    this.updateChatInputDisplay();
    
    // Stop any tweens
    this.tweens.killTweensOf(this.continueIndicator);
    this.tweens.killTweensOf(this.chatIndicator);
  }
  
  hideChatInput() {
    this.chatInputBox.setVisible(false);
    this.chatInputText.setVisible(false);
    this.chatSubmitButton.setVisible(false);
    this.chatSubmitText.setVisible(false);
    this.playerInput = '';
  }
  
  updateChatInputDisplay() {
    this.chatInputText.setText('> ' + this.playerInput);
  }
  
  submitChatMessage() {
    if (this.playerInput.trim() === '') return;
    
    // Get response based on input
    const response = this.getChatResponse(this.playerInput);
    
    // Display the response
    this.showDialogue(response);
    
    // Reset chat state
    this.playerInput = '';
    this.inChat = true;
  }
  
  getChatResponse(input) {
    const lowercaseInput = input.toLowerCase().trim();
    
    // Check if we have a hardcoded response for this input
    for (const [key, value] of Object.entries(this.chatResponses)) {
      if (lowercaseInput.includes(key)) {
        return value;
      }
    }
    
    // Return default response if no match found
    return this.defaultResponse;
  }
  
  setupCommandListener() {
    // Listen for command events from the UI
    if (typeof window !== 'undefined') {
      console.log('Setting up command listener in Level1Scene');
      
      const handleCommand = (e) => {
        // Don't process commands if in dialogue mode
        if (this.isInDialogue) return;
        
        const { command } = e.detail;
        console.log('Level1Scene received command:', command);
        
        const lowerCmd = command.toLowerCase().trim();
        
        // Check specifically for "go/move to tree" variations
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
        } 
        // Check for "go/move to girl/boy" variations
        else if (lowerCmd.includes('girl') || lowerCmd.includes('boy')) {
          const profile = this.game.registry.get('profile') || {};
          const seeksBoy = profile.seeks === 'Boyfriend';
          const npcName = seeksBoy ? 'boy' : 'girl';
          
          console.log(`${npcName} command detected`);
          
          // Find the NPC object
          const npc = this.interactiveObjects[npcName];
          if (npc) {
            console.log(`${npcName} found, moving player`);
            // Move player to the NPC
            this.movePlayerTo(npc, () => {
              // Provide success feedback
              this.showFeedback(true);
              
              // If it's a "talk to" command, show dialogue
              if (lowerCmd.includes('talk')) {
                this.startDialogueWithNPC(npcName);
              }
            });
          } else {
            console.warn(`${npcName} object not found in interactiveObjects`);
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
  
  startDialogueWithNPC(npcName) {
    const profile = this.game.registry.get('profile') || {};
    const targetLanguage = profile.targetLanguage || 'Spanish';
    
    // Define dialogue options based on conversation step
    let dialogue;
    switch (this.conversationSteps) {
      case 0:
        dialogue = npcName === 'girl' 
          ? "Hi there! *waves* I haven't seen you around here before. My name is Amelia. What's your name?" 
          : "Hey! *smiles* I'm Alex. I don't think we've met before. Are you new to this park?";
        break;
      case 1:
        dialogue = npcName === 'girl'
          ? "Nice to meet you! I love spending time in this park. Do you come here often? I'm trying to learn " + targetLanguage + " actually."
          : "Cool! I've been visiting this park for years. It's a great place to relax. By the way, I'm learning " + targetLanguage + ". Do you speak it?";
        break;
      case 2:
        dialogue = npcName === 'girl'
          ? "Really? That's amazing! Maybe we could practice " + targetLanguage + " together sometime? I'd love to improve my speaking skills."
          : "That's awesome! We should definitely meet up again to practice " + targetLanguage + ". Would you like to exchange numbers?";
        break;
      default:
        dialogue = "It's been great talking to you! Let's continue our conversation next time.";
    }
    
    // Add a prompt about chatting when the dialogue first appears
    dialogue += "\n\nPress C to chat with me, or click anywhere to continue.";
    
    // Show the dialogue
    this.showDialogue(dialogue);
  }
  
  onTalkTo(targetId) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === npcName) {
      // Start dialogue with character
      this.startDialogueWithNPC(npcName);
      
      this.conversationSteps++;
      
      // Update instruction text based on conversation progress
      if (this.conversationSteps === 1) {
        this.instructionText.setText(`The ${npcName} smiled back! Talk again to introduce yourself.`);
      } else if (this.conversationSteps === 2) {
        this.instructionText.setText(`Great! One more step - ask about their interests.`);
      } else if (this.conversationSteps >= this.requiredSteps) {
        this.instructionText.setText(`Congratulations! You've made your first contact! Try chatting with ${npcName === 'girl' ? 'her' : 'him'}.`);
        
        // Delay level completion to allow reading the message and chatting
        this.time.delayedCall(10000, () => {
          // Only complete level if dialogue is not active
          if (!this.isInDialogue) {
            this.completeLevel();
          }
        });
      }
    }
  }
  
  onInteractWith(targetId, verb) {
    // Handle interactions with objects
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === npcName && verb === 'give') {
      this.instructionText.setText(`The ${npcName} seems interested in talking more.`);
      this.conversationSteps = this.requiredSteps - 1; // Skip ahead
    }
  }
}

export default Level1Scene; 