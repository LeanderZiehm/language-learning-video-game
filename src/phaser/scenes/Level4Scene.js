import BaseScene from './BaseScene';

class Level4Scene extends BaseScene {
  constructor() {
    super('Level4Scene');
    this.chatMessages = [];
    this.maxMessages = 5; // Maximum number of visible messages
    this.isSubscribed = false;
  }

  preload() {
    this.loadAssets();
    
    // Load level-specific assets
    this.load.image('home_bg', '/src/assets/home_bg.png');
    this.load.image('couch', '/src/assets/couch.png');
    this.load.image('tv', '/src/assets/tv.png');
    this.load.image('plant', '/src/assets/plant.png');
    this.load.image('bookshelf', '/src/assets/bookshelf.png');
  }

  create() {
    // Check if user is subscribed
    // this.isSubscribed = localStorage.getItem('subscribed') === 'true';
    
    // if (!this.isSubscribed) {
    //   // Redirect back to Level 3 if not subscribed
    //   this.scene.start('Level3Scene');
    //   return;
    // }
    
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Background
    this.add.image(400, 300, 'home_bg').setScale(4);
    
    // Environment objects
    const couch = this.physics.add.image(500, 400, 'couch').setScale(2).setImmovable(true);
    this.makeInteractive(couch, 'couch');
    
    const tv = this.physics.add.image(600, 200, 'tv').setScale(1.5).setImmovable(true);
    this.makeInteractive(tv, 'tv');
    
    const plant = this.physics.add.image(200, 200, 'plant').setScale(1.5).setImmovable(true);
    this.makeInteractive(plant, 'plant');
    
    const bookshelf = this.physics.add.image(200, 400, 'bookshelf').setScale(1.5).setImmovable(true);
    this.makeInteractive(bookshelf, 'bookshelf');
    
    // Add NPC based on player preference
    const npcSprite = seeksBoy ? 'npc_boy' : 'npc_girl';
    this.npc = this.physics.add.sprite(550, 350, npcSprite).setScale(2);
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Add player character
    this.player = this.createPlayer(400, 350);
    
    // Add collision
    this.physics.add.collider(this.player, [couch, tv, plant, bookshelf, this.npc]);
    
    // Add text for instructions
    this.add.text(400, 50, 'Level 4: Infinite Chat with Your Partner', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Create chat interface
    this.createChatInterface();
    
    // Add initial chat message
    const partnerName = seeksBoy ? 'boyfriend' : 'girlfriend';
    this.addChatMessage('partner', `Welcome to our home! I'm so happy to be your ${partnerName}. What would you like to talk about?`);
  }

  createChatInterface() {
    // Chat background
    const chatBg = this.add.rectangle(400, 500, 700, 180, 0x000000, 0.7);
    chatBg.setOrigin(0.5, 0.5);
    
    // Chat messages container
    this.messagesContainer = this.add.container(400, 500);
    
    // AI partner label
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const partnerLabel = this.add.text(50, 420, seeksBoy ? 'Boyfriend:' : 'Girlfriend:', {
      fontSize: '16px',
      fill: '#ff69b4',
      fontStyle: 'bold'
    });
    
    // Add initial welcome message explaining the infinite chat
    this.instructionText = this.add.text(400, 550, 'This is an infinite chat mode! Talk to your partner about anything.', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  addChatMessage(sender, text) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    const isPlayer = sender === 'player';
    const messageY = 460 + this.chatMessages.length * 30;
    
    const senderLabel = isPlayer ? 'You: ' : (seeksBoy ? 'Boyfriend: ' : 'Girlfriend: ');
    const messageColor = isPlayer ? '#ffffff' : '#ff69b4';
    
    const message = this.add.text(100, messageY, senderLabel + text, {
      fontSize: '14px',
      fill: messageColor,
      wordWrap: { width: 600 }
    });
    
    this.chatMessages.push(message);
    this.messagesContainer.add(message);
    
    // Remove oldest message if we exceed the max
    if (this.chatMessages.length > this.maxMessages) {
      const oldestMessage = this.chatMessages.shift();
      this.messagesContainer.remove(oldestMessage);
      oldestMessage.destroy();
      
      // Move remaining messages up
      this.chatMessages.forEach((msg, index) => {
        msg.y = 460 + index * 30;
      });
    }
    
    // Create heart animation for partner messages
    if (!isPlayer) {
      this.createHeartAnimation(this.npc.x, this.npc.y);
    }
  }

  handleCommand(parsedCommand) {
    if (!parsedCommand) return;
    
    const { verb, targetId } = parsedCommand;
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    // For Level 4, we treat every command as chat input
    this.addChatMessage('player', `${verb} ${targetId}`);
    
    // Handle different scenarios in the infinite chat
    this.processAIResponse(`${verb} ${targetId}`);
  }
  
  processAIResponse(userMessage) {
    // In a real implementation, this would call OpenAI API
    // For now, we'll simulate responses based on keywords
    
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const partnerType = seeksBoy ? 'boyfriend' : 'girlfriend';
    
    let response = '';
    
    // Simple rule-based responses as a stub for the AI
    if (userMessage.includes('love you')) {
      response = `I love you too! You're the best ${partnerType === 'boyfriend' ? 'girlfriend' : 'boyfriend'} ever!`;
    } else if (userMessage.includes('talk') && userMessage.includes(seeksBoy ? 'boy' : 'girl')) {
      response = "What would you like to talk about? I'm all ears!";
    } else if (userMessage.includes('go') && userMessage.includes('tv')) {
      response = "Sure, let's watch a movie together! What genre do you prefer?";
    } else if (userMessage.includes('give') && userMessage.includes(seeksBoy ? 'boy' : 'girl')) {
      response = "Thank you for the gift! You're so thoughtful.";
    } else if (userMessage.includes('ask') && userMessage.includes('marry')) {
      response = "Oh my! That's so sudden... but YES, I would love to marry you someday!";
      // Extra hearts for proposal
      for (let i = 0; i < 10; i++) {
        this.time.delayedCall(i * 200, () => {
          this.createHeartAnimation(
            Phaser.Math.Between(200, 600),
            Phaser.Math.Between(100, 300)
          );
        });
      }
    } else {
      // Default responses
      const defaultResponses = [
        "That sounds interesting! Tell me more.",
        "I'm so happy we're together now.",
        "What else would you like to do today?",
        "You're so amazing, I'm lucky to have you.",
        "I've been thinking about you all day!"
      ];
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Add slight delay before partner responds
    this.time.delayedCall(1000, () => {
      this.addChatMessage('partner', response);
    });
  }
  
  onTalkTo(targetId) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === npcName) {
      this.addChatMessage('player', `Hey, let's talk!`);
      
      this.time.delayedCall(1000, () => {
        this.addChatMessage('partner', "I'd love to chat with you! What's on your mind?");
      });
    }
  }
  
  onInteractWith(targetId, verb) {
    // Handle interaction with objects in the home scene
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Add player's action to chat
    this.addChatMessage('player', `${verb} ${targetId}`);
    
    // Partner response based on interaction
    let response = '';
    
    if (targetId === 'tv' && (verb === 'watch' || verb === 'turn')) {
      response = "Let's watch something together! How about a romantic comedy?";
    } else if (targetId === 'couch' && (verb === 'sit' || verb === 'go')) {
      response = "The couch is so comfy. Come sit next to me!";
    } else if (targetId === 'bookshelf' && (verb === 'look' || verb === 'go')) {
      response = "I love reading too! We have quite the collection, don't we?";
    } else if (targetId === 'plant' && (verb === 'water' || verb === 'look')) {
      response = "Thanks for taking care of our plant! You're so considerate.";
    } else {
      response = "I like watching you interact with things in our home. It's cute!";
    }
    
    this.time.delayedCall(1000, () => {
      this.addChatMessage('partner', response);
    });
  }
  
  update() {
    // Empty update as we don't need continuous updates for this scene
  }
}

export default Level4Scene; 