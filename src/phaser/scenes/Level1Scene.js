import BaseScene from './BaseScene';

class Level1Scene extends BaseScene {
  constructor() {
    super('Level1Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 3;
  }

  preload() {
    this.loadAssets();
    
    // No need to load level-specific assets since we're using placeholders
  }

  create() {
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Background
    this.add.image(400, 300, 'park_bg').setScale(4);
    
    // Environment objects - ensure tree is prominently positioned
    const tree = this.physics.add.image(300, 250, 'tree').setScale(2).setImmovable(true);
    const bench = this.physics.add.image(600, 400, 'bench').setScale(2).setImmovable(true);
    const flowers = this.physics.add.image(500, 200, 'flowers').setScale(1.5).setImmovable(true);
    
    // Make objects interactive with clear naming
    this.makeInteractive(tree, 'tree');
    this.makeInteractive(bench, 'bench');
    this.makeInteractive(flowers, 'flowers');
    
    // Add NPC based on player preference
    const npcSprite = seeksBoy ? 'npc_boy' : 'npc_girl';
    this.npc = this.physics.add.sprite(400, 350, npcSprite).setScale(2);
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Add player character in a clear starting position
    this.player = this.createPlayer(100, 350);
    
    // Add collision
    this.physics.add.collider(this.player, [bench, tree, flowers, this.npc]);
    
    // Add text for instructions
    this.add.text(400, 50, 'Level 1: First Contact', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    this.instructionText = this.add.text(400, 530, 'Try typing "go to tree" in the command box below!', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
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
  
  update() {
    // Update logic goes here
  }
}

export default Level1Scene; 