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
    this.conversationId = null; // Store the conversation ID from the API
    this.isWaitingForResponse = false; // Flag to track if we're waiting for API response
    // Keep fallback responses in case API fails
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
    this.apiBaseUrl = 'https://groq.leanderziehm.com';
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
    this.load.image('sprite_close_up', 'src/assets/girl_closeup.png');
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
    
    // Set up chat message listener
    this.setupChatListener();
    
    // Setup input for advancing dialogue
    this.input.on('pointerdown', () => {
      if (this.isInDialogue && !this.inChat) {
        if (this.isTextComplete) {
          this.startChatMode();
        } else {
          // If text is still typing, complete it immediately
          this.completeText();
        }
      }
    });
    
    // Setup keyboard input for dialogue
    this.input.keyboard.on('keydown', (event) => {
      if (this.isInDialogue && !this.inChat) {
        if (this.isTextComplete) {
          // Automatically go to chat mode when the dialogue is complete
          this.startChatMode();
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
      this.portrait.setScale(0.8);
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
    this.continueIndicator = this.add.text(300, 180, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    this.continueIndicator.setVisible(false);
    this.dialogueContainer.add(this.continueIndicator);
    
    // Add loading indicator (three dots)
    this.loadingIndicator = this.add.text(0, 180, '...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    this.loadingIndicator.setOrigin(0.5);
    this.loadingIndicator.setVisible(false);
    this.dialogueContainer.add(this.loadingIndicator);
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
    
    // Notify HUD that dialogue has started if not already in chat mode
    if (!this.inChat) {
      window.dispatchEvent(new CustomEvent('dialogueStarted'));
    } else {
      // If we're already in chat mode, notify HUD
      window.dispatchEvent(new CustomEvent('chatModeStarted'));
    }
    
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
      
      if (!this.inChat) {
        this.continueIndicator.setVisible(true);
        
        // Add blinking effect to indicators
        this.tweens.add({
          targets: this.continueIndicator,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
        
        // Automatically go to chat mode after a brief delay (1.5 seconds)
        this.time.delayedCall(1500, () => {
          if (this.isInDialogue && !this.inChat) {
            this.startChatMode();
          }
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
    
    if (!this.inChat) {
      this.continueIndicator.setVisible(true);
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
    
    // Notify HUD that dialogue has ended
    window.dispatchEvent(new CustomEvent('dialogueEnded'));
  }
  
  startChatMode() {
    // Enter chat mode
    this.inChat = true;
    this.continueIndicator.setVisible(false);
    
    // Create a new conversation if we don't have one yet
    if (!this.conversationId) {
      this.createNewConversation()
        .then(() => {
          // Initialize the conversation with a system prompt
          return this.initializeConversation();
        })
        .then(() => {
          // Show initial chat message
          const initialChatMessage = "I'm all ears! What would you like to talk about?";
          this.showDialogue(initialChatMessage);
        })
        .catch(error => {
          console.error('Failed to create or initialize conversation:', error);
          // Fallback to local chat if API fails
          const initialChatMessage = "I'm all ears! What would you like to talk about?";
          this.showDialogue(initialChatMessage);
        });
    } else {
      // If we already have a conversation, just show the initial message
      const initialChatMessage = "I'm all ears! What would you like to talk about?";
      this.showDialogue(initialChatMessage);
    }
    
    // Stop any tweens
    this.tweens.killTweensOf(this.continueIndicator);
    
    // Notify HUD that chat mode has started
    window.dispatchEvent(new CustomEvent('chatModeStarted'));
  }
  
  // Initialize the conversation with a system prompt
  async initializeConversation() {
    // Get user profile for context
    const profile = this.game.registry.get('profile') || {};
    const playerName = profile.name || 'Player';
    const targetLanguage = profile.targetLanguage || 'Spanish';
    const seeksBoy = profile.seeks === 'Boyfriend';
    const characterName = seeksBoy ? 'Alex' : 'Amelia';
    
    // Create a system prompt to initialize the conversation
    const systemPrompt = `This is a role-play conversation in a language learning game.

CONTEXT:
- You are ${characterName}, a friendly ${seeksBoy ? 'guy' : 'girl'} the player just met in a park
- You are a native ${targetLanguage} speaker
- The player is learning ${targetLanguage}
- Your goal is to help them practice in a natural conversation

RULES:
1. Stay in character as ${characterName} at all times
2. Keep responses conversational and short (1-3 sentences)
3. Occasionally use simple ${targetLanguage} words or phrases, but translate them
4. Be friendly, helpful, and encouraging
5. Talk about your fictional life, hobbies, and interests
6. Ask questions to keep the conversation going
7. NEVER mention that you're an AI, language model, or assistant

YOUR BACKGROUND:
- You're from ${targetLanguage === 'Spanish' ? 'Madrid, Spain' : 'a country where ' + targetLanguage + ' is spoken'}
- You love meeting new people and helping language learners
- You have everyday hobbies like ${seeksBoy ? 'playing guitar, soccer, and hiking' : 'painting, reading, and yoga'}
- You moved to this town recently and enjoy exploring it

When the player sends their first message, respond naturally as ${characterName} would in a casual park conversation.`;

    // Send the system prompt to initialize the conversation context
    try {
      if (!this.conversationId) {
        await this.createNewConversation();
      }
      
      const response = await fetch(`${this.apiBaseUrl}/conversations/${this.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: systemPrompt,
          model: "llama3-70b-8192"
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      // We don't need to do anything with this response as it's just setting up context
      console.log('Conversation initialized with system prompt');
      return true;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  }
  
  // Create a new conversation with the API
  async createNewConversation() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/conversations`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      this.conversationId = data.id;
      console.log('New conversation created with ID:', this.conversationId);
      return this.conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  // Send a message to the API and get a response
  async sendMessageToAPI(message) {
    if (!this.conversationId) {
      try {
        await this.createNewConversation();
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return null;
      }
    }
    
    // Get user profile information for context
    const profile = this.game.registry.get('profile') || {};
    const playerName = profile.name || 'Player';
    const targetLanguage = profile.targetLanguage || 'Spanish';
    const seeksBoy = profile.seeks === 'Boyfriend';
    const characterName = seeksBoy ? 'Alex' : 'Amelia';
    
    // Create system context to guide the AI response
    const contextPrompt = `You are ${characterName}, a friendly local in a language learning game. 
The player (${playerName}) is learning ${targetLanguage}. 
Respond conversationally as if you're chatting in a park.
Keep responses short (1-3 sentences).
Occasionally use simple ${targetLanguage} words or phrases, but translate them to English.
Your personality: Friendly, helpful, patient with language learners.
You're from ${targetLanguage === 'Spanish' ? 'Madrid, Spain' : 'a country where ' + targetLanguage + ' is spoken'}.`;
    
    // Combine user message with context
    const fullMessage = `${contextPrompt}\n\nUser message: ${message}`;
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/conversations/${this.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: fullMessage,
          model: "llama3-70b-8192" // Using the specified model
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
  
  // Get conversation history from the API
  async getConversationHistory() {
    if (!this.conversationId) return [];
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/conversations/${this.conversationId}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }
  
  // Delete the current conversation
  async deleteConversation() {
    if (!this.conversationId) return;
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/conversations/${this.conversationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      console.log('Conversation deleted successfully');
      this.conversationId = null;
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }
  
  // Show loading indicator
  showLoadingIndicator() {
    if (!this.loadingIndicator) return;
    
    this.loadingIndicator.setVisible(true);
    this.loadingIndicator.setText('.');
    
    // Create a loading animation by cycling through different numbers of dots
    let dots = 0;
    this.loadingTimer = this.time.addEvent({
      delay: 500,
      callback: () => {
        dots = (dots + 1) % 4;
        let text = '.'.repeat(dots);
        if (dots === 0) text = '.';
        this.loadingIndicator.setText(text);
      },
      callbackScope: this,
      loop: true
    });
  }
  
  // Hide loading indicator
  hideLoadingIndicator() {
    if (!this.loadingIndicator) return;
    
    this.loadingIndicator.setVisible(false);
    if (this.loadingTimer) {
      this.loadingTimer.remove();
      this.loadingTimer = null;
    }
  }
  
  setupChatListener() {
    if (typeof window !== 'undefined') {
      console.log('Setting up chat listener in Level1Scene');
      
      const handleChatMessage = (e) => {
        if (!this.isInDialogue || !this.inChat) return;
        if (this.isWaitingForResponse) return; // Prevent sending multiple messages while waiting
        
        const { message } = e.detail;
        console.log('Chat message received:', message);
        
        // Set waiting flag
        this.isWaitingForResponse = true;
        
        // Clear current dialogue text and show loading indicator
        this.dialogueText.setText('');
        this.showLoadingIndicator();
        
        // Get response from API
        this.sendMessageToAPI(message)
          .then(response => {
            this.isWaitingForResponse = false;
            this.hideLoadingIndicator();
            
            if (response) {
              // Show the API response
              this.showDialogue(response);
            } else {
              // Fallback to local response if API fails
              const fallbackResponse = this.getFallbackResponse(message);
              this.showDialogue(fallbackResponse);
            }
          })
          .catch(error => {
            console.error('Error in chat response:', error);
            this.isWaitingForResponse = false;
            this.hideLoadingIndicator();
            
            // Use fallback response
            const fallbackResponse = this.getFallbackResponse(message);
            this.showDialogue(fallbackResponse);
          });
      };
      
      // Remove any existing listener to avoid duplicates
      window.removeEventListener('chatMessageSent', handleChatMessage);
      
      // Add the new listener
      window.addEventListener('chatMessageSent', handleChatMessage);
      
      // Store the reference
      this.chatMessageHandler = handleChatMessage;
    }
  }
  
  // Use the original method as a fallback
  getFallbackResponse(input) {
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
  
  // This is now just a fallback - main implementation is in setupChatListener
  getChatResponse(input) {
    return this.getFallbackResponse(input);
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
              this.showFeedback(true,'star');
                console.log("calling this")
              
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
              console.log("calling this evntho it shouldn")
              this.showFeedback(true);
              
              // If it's a "talk to" command, show dialogue
              if (lowerCmd.includes('talk')) {
                //hide the buttons on top
                document.getElementById('floating-panel').style.display = 'none';
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
    // this.add.text(400, 50, 'Level 1: First Contact', {
    //   fontSize: '28px',
    //   fontFamily: 'Georgia, serif',
    //   color: '#ffffff',
    //   stroke: '#000000',
    //   strokeThickness: 4,
    //   shadow: { color: '#000000', blur: 10, stroke: true, fill: true }
    // }).setOrigin(0.5);
    
    // Instruction text with better visibility and higher quality font
    this.instructionText = this.add.text(400, 530, 'Try speaking "go to the tree"', {
      fontSize: '22px',
      fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 16, y: 10 },
      fixedWidth: 700,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { color: '#000000', blur: 8, stroke: true, fill: true },
       resolution: 2 
    }).setOrigin(0.5).setResolution(2);
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
  
showFeedback(success, type = 'heart') {

  console.log('Showing feedback:', success, type);
  if (!success) return;

  let shape;

  if (type === 'star') {
    // Yellow star using polygon points
    shape = this.add.graphics();
    shape.fillStyle(0xffff00, 1); // yellow

    shape.beginPath();
    const spikes = 5;
    const outerRadius = 12;
    const innerRadius = 5;
    const centerX = 0;
    const centerY = 0;

    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    shape.moveTo(centerX, centerY - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let x = centerX + Math.cos(rot) * outerRadius;
      let y = centerY + Math.sin(rot) * outerRadius;
      shape.lineTo(x, y);
      rot += step;

      x = centerX + Math.cos(rot) * innerRadius;
      y = centerY + Math.sin(rot) * innerRadius;
      shape.lineTo(x, y);
      rot += step;
    }

    shape.lineTo(centerX, centerY - outerRadius);
    shape.closePath();
    shape.fillPath();

  } else {
    // Red heart using circles + triangle
    shape = this.add.graphics();
    shape.fillStyle(0xff0000, 1); // red

    const size = 10;

    // Left circle
    shape.fillCircle(-size / 2, 0, size);

    // Right circle
    shape.fillCircle(size / 2, 0, size);

    // Bottom triangle
    shape.beginPath();
    shape.moveTo(-size * 1.5, 0);
    shape.lineTo(0, size * 2);
    shape.lineTo(size * 1.5, 0);
    shape.closePath();
    shape.fillPath();
  }

  // Create container so we can animate whole thing
  const feedback = this.add.container(this.player.x, this.player.y - 20, [shape]);
  feedback.setDepth(1000);

  // Animate it
  this.tweens.add({
    targets: feedback,
    y: feedback.y - 50,
    alpha: 0,
    scale: 2,
    duration: 1000,
    ease: 'Cubic.out',
    onComplete: () => feedback.destroy()
  });
}


  
  startDialogueWithNPC(npcName) {
    const profile = this.game.registry.get('profile') || {};
    const targetLanguage = profile.targetLanguage || 'German';
    
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
        dialogue = "It's been great talking to you! Let's continue our conversation now.";
    }
    
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
  
  // Clean up the conversation when leaving the scene
  shutdown() {
    // Clean up conversation with API
    if (this.conversationId) {
      this.deleteConversation()
        .catch(error => console.error('Error cleaning up conversation:', error));
    }
    
    // Clean up timers
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
    
    if (this.loadingTimer) {
      this.loadingTimer.remove();
      this.loadingTimer = null;
    }
    
    // Stop all tweens
    this.tweens.killAll();
    
    // Hide any UI elements
    if (this.dialogueContainer) {
      this.dialogueContainer.setVisible(false);
    }
    
    // Reset flags
    this.isInDialogue = false;
    this.inChat = false;
    this.isWaitingForResponse = false;
    
    // Remove event listeners
    if (typeof window !== 'undefined') {
      if (this.chatMessageHandler) {
        window.removeEventListener('chatMessageSent', this.chatMessageHandler);
      }
      if (this.commandHandler) {
        window.removeEventListener('commandSubmitted', this.commandHandler);
      }
    }
    
    // Call parent shutdown if it exists
    if (super.shutdown) {
      super.shutdown();
    }
  }
}

export default Level1Scene;