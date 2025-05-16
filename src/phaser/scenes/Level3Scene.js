import BaseScene from './BaseScene';

class Level3Scene extends BaseScene {
  constructor() {
    super('Level3Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 5;
    this.relationshipRequested = false;
  }

  preload() {
    this.loadAssets();
    
    // Load level-specific assets
    this.load.image('restaurant_bg', '/src/assets/restaurant_bg.png');
    this.load.image('fancy_table', '/src/assets/fancy_table.png');
    this.load.image('chair', '/src/assets/chair.png');
    this.load.image('wine', '/src/assets/wine.png');
    this.load.image('food', '/src/assets/food.png');
    this.load.image('candle', '/src/assets/candle.png');
    this.load.image('gift', '/src/assets/gift.png');
  }

  create() {
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Background
    this.add.image(400, 300, 'restaurant_bg').setScale(4);
    
    // Environment objects
    const table = this.physics.add.image(400, 350, 'fancy_table').setScale(2).setImmovable(true);
    this.makeInteractive(table, 'table');
    
    const chair1 = this.physics.add.image(350, 430, 'chair').setScale(1.5).setImmovable(true);
    this.makeInteractive(chair1, 'chair');
    
    const chair2 = this.physics.add.image(450, 430, 'chair').setScale(1.5).setImmovable(true);
    
    const wine = this.physics.add.image(370, 320, 'wine').setScale(1.5).setImmovable(true);
    this.makeInteractive(wine, 'wine');
    
    const food = this.physics.add.image(430, 320, 'food').setScale(1.5).setImmovable(true);
    this.makeInteractive(food, 'food');
    
    const candle = this.physics.add.image(400, 300, 'candle').setScale(1).setImmovable(true);
    this.makeInteractive(candle, 'candle');
    
    const gift = this.physics.add.image(600, 500, 'gift').setScale(1.5).setImmovable(true);
    this.makeInteractive(gift, 'gift');
    
    // Add NPC based on player preference
    const npcSprite = seeksBoy ? 'npc_boy' : 'npc_girl';
    this.npc = this.physics.add.sprite(450, 500, npcSprite).setScale(2);
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Add player character
    this.player = this.createPlayer(300, 500);
    
    // Add collision
    this.physics.add.collider(this.player, [table, chair1, chair2, wine, food, candle, gift, this.npc]);
    
    // Add text for instructions
    this.add.text(400, 50, 'Level 3: The Date & Relationship Question', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    this.instructionText = this.add.text(400, 550, 'Your date has arrived! Make it special and ask to be in a relationship.', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Add dialog bubble for NPC responses
    this.dialogBubble = this.createDialogBubble(400, 200);
    this.dialogBubble.setVisible(false);
    
    // Add romantic ambience with tweens
    this.createRomanticAmbience();
  }
  
  createDialogBubble(x, y) {
    const bubbleWidth = 300;
    const bubbleHeight = 100;
    const bubblePadding = 10;
    
    // Draw bubble shape
    const bubble = this.add.graphics({ x, y });
    bubble.fillStyle(0xffffff, 0.9);
    bubble.fillRoundedRect(-bubbleWidth/2, -bubbleHeight/2, bubbleWidth, bubbleHeight, 16);
    
    // Add tail to bubble
    bubble.fillTriangle(
      -20, bubbleHeight/2 - 20,
      20, bubbleHeight/2 - 20,
      0, bubbleHeight/2 + 20
    );
    
    // Add text inside bubble
    const content = this.add.text(x, y, '', {
      fontSize: '16px',
      fill: '#000000',
      align: 'center',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 }
    }).setOrigin(0.5);
    
    // Group bubble and text
    const container = this.add.container(0, 0, [bubble, content]);
    container.content = content;
    
    return container;
  }
  
  createRomanticAmbience() {
    // Add some floating hearts in the background
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const heart = this.add.image(x, y, 'heart').setScale(0.5).setAlpha(0.3);
      
      // Add floating animation
      this.tweens.add({
        targets: heart,
        y: heart.y - 50,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Sine.easeInOut',
        yoyo: false,
        repeat: -1
      });
    }
    
    // Candle light flicker effect
    if (this.candle) {
      this.tweens.add({
        targets: this.candle,
        alpha: 0.7,
        duration: 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  }

  showDialog(text, duration = 3000) {
    this.dialogBubble.setVisible(true);
    this.dialogBubble.content.setText(text);
    
    // Auto-hide dialog after duration
    this.time.delayedCall(duration, () => {
      this.dialogBubble.setVisible(false);
    });
  }
  
  onTalkTo(targetId) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    if (targetId === npcName) {
      this.conversationSteps++;
      
      // Update instruction text and dialog based on conversation progress
      if (this.conversationSteps === 1) {
        this.showDialog("This restaurant is so nice! Thanks for inviting me.");
        this.instructionText.setText(`Great start! Compliment them on how they look.`);
      } else if (this.conversationSteps === 2) {
        this.showDialog("Thank you! You look amazing too.");
        this.instructionText.setText(`Now talk about your interests.`);
      } else if (this.conversationSteps === 3) {
        this.showDialog("We have so much in common!");
        this.instructionText.setText(`The date is going well! Talk about future plans.`);
      } else if (this.conversationSteps === 4) {
        this.showDialog("I'd love to do those things with you.");
        this.instructionText.setText(`Perfect time to ask for a relationship!`);
      } else if (this.conversationSteps >= this.requiredSteps && !this.relationshipRequested) {
        this.relationshipRequested = true;
        this.showDialog("Yes! I'd love to be in a relationship with you!");
        this.instructionText.setText(`Congratulations! They said yes!`);
        
        // Delay level completion to allow reading the message
        this.time.delayedCall(4000, () => {
          this.completeLevel();
        });
      }
    }
  }
  
  onInteractWith(targetId, verb) {
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    const npcName = seeksBoy ? 'boy' : 'girl';
    
    // Handle interactions with objects
    if (targetId === 'wine' && verb === 'give') {
      this.showDialog("Thank you for the wine!");
      this.conversationSteps = Math.min(this.conversationSteps + 1, this.requiredSteps - 1);
    } else if (targetId === 'food' && verb === 'take') {
      this.showDialog("This food looks delicious!");
    } else if (targetId === 'gift' && verb === 'give') {
      this.showDialog("A gift? For me? That's so thoughtful!");
      this.conversationSteps = Math.min(this.conversationSteps + 1, this.requiredSteps - 1);
    }
  }
  
  update() {
    // Update dialog bubble position to follow NPC
    if (this.dialogBubble && this.npc) {
      this.dialogBubble.x = this.npc.x;
      this.dialogBubble.y = this.npc.y - 100;
    }
  }
}

export default Level3Scene; 