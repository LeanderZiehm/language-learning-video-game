import BaseScene from './BaseScene';

class Level2Scene extends BaseScene {
  constructor() {
    super('Level2Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 4;
    this.askedForDate = false;
  }

  preload() {
    this.loadAssets();
    
    // Load level-specific assets
    this.load.image('cafe_bg', '/src/assets/cafe_bg.png');
    this.load.image('table', '/src/assets/table.png');
    this.load.image('chair', '/src/assets/chair.png');
    this.load.image('coffee', '/src/assets/coffee.png');
    this.load.image('cake', '/src/assets/cake.png');
  }

  create() {
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Background
    this.add.image(400, 300, 'cafe_bg').setScale(4);
    
    // Environment objects
    const table = this.physics.add.image(400, 350, 'table').setScale(2).setImmovable(true);
    this.makeInteractive(table, 'table');
    
    const chair1 = this.physics.add.image(350, 430, 'chair').setScale(1.5).setImmovable(true);
    this.makeInteractive(chair1, 'chair');
    
    const chair2 = this.physics.add.image(450, 430, 'chair').setScale(1.5).setImmovable(true);
    
    const coffee = this.physics.add.image(350, 320, 'coffee').setScale(1.5).setImmovable(true);
    this.makeInteractive(coffee, 'coffee');
    
    const cake = this.physics.add.image(450, 320, 'cake').setScale(1.5).setImmovable(true);
    this.makeInteractive(cake, 'cake');
    
    // Add NPC based on player preference
    const npcSprite = seeksBoy ? 'npc_boy' : 'npc_girl';
    this.npc = this.physics.add.sprite(500, 500, npcSprite).setScale(2);
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Add player character
    this.player = this.createPlayer(200, 500);
    
    // Add collision
    this.physics.add.collider(this.player, [table, chair1, chair2, coffee, cake, this.npc]);
    
    // Add text for instructions
    this.add.text(400, 50, 'Level 2: Small Talk & The Date Question', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    this.instructionText = this.add.text(400, 550, 'Time for small talk! Talk to the ' + (seeksBoy ? 'boy' : 'girl') + ' again.', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Add dialog bubble for NPC responses
    this.dialogBubble = this.createDialogBubble(400, 200);
    this.dialogBubble.setVisible(false);
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
        this.showDialog("Hey there! Nice to see you again!");
        this.instructionText.setText(`Great start! Ask about their hobbies.`);
      } else if (this.conversationSteps === 2) {
        this.showDialog("I enjoy hiking and photography. What about you?");
        this.instructionText.setText(`Good conversation! Now compliment them.`);
      } else if (this.conversationSteps === 3) {
        this.showDialog("Thank you! That's so kind of you to say.");
        this.instructionText.setText(`Now's your chance! Ask them on a date.`);
      } else if (this.conversationSteps >= this.requiredSteps && !this.askedForDate) {
        this.askedForDate = true;
        this.showDialog("I'd love to go on a date with you!");
        this.instructionText.setText(`Success! They agreed to a date!`);
        
        // Delay level completion to allow reading the message
        this.time.delayedCall(4000, () => {
          this.completeLevel();
        });
      }
    }
  }
  
  onInteractWith(targetId, verb) {
    // Handle interactions with objects
    if (targetId === 'coffee' && verb === 'take') {
      this.showDialog("That coffee looks delicious!");
    } else if (targetId === 'cake' && verb === 'take') {
      this.showDialog("That cake looks amazing!");
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

export default Level2Scene; 