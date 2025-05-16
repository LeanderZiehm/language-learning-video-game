import BaseScene from './BaseScene';

class Level1Scene extends BaseScene {
  constructor() {
    super('Level1Scene');
    this.conversationSteps = 0;
    this.requiredSteps = 3;
  }

  preload() {
    this.loadAssets();
  }

  create() {
    // Get player preferences from registry
    const profile = this.game.registry.get('profile') || {};
    const seeksBoy = profile.seeks === 'Boyfriend';
    
    // Background
    this.add.image(400, 300, 'park_bg');
    
    // Create a basic outdoor environment
    this.createParkEnvironment();
    
    // Environment objects - ensure tree is prominently positioned
    // Use the tree sprite from Harvest Summer pack
    const tree = this.add.sprite(400, 200, 'harvestTrees', 0);
    tree.setOrigin(0.5, 1); // Adjust origin to bottom center for better positioning
    tree.setScale(2.5); // Scale up for better visibility
    
    // Add physics body to make it interactive
    this.physics.world.enable(tree);
    const treeBody = tree.body;
    treeBody.setImmovable(true);
    treeBody.setSize(16, 6); // Narrow collision at the trunk
    treeBody.setOffset(8, 42); // Position at the bottom of the tree
    
    const bench = this.physics.add.image(600, 400, 'bench');
    bench.setImmovable(true);
    
    const flowers = this.physics.add.image(500, 200, 'flowers');
    flowers.setImmovable(true);
    
    // Make objects interactive with clear naming
    this.makeInteractive(tree, 'tree');
    this.makeInteractive(bench, 'bench');
    this.makeInteractive(flowers, 'flowers');
    
    // Add NPC based on player preference
    const npcSprite = seeksBoy ? 'npc_boy_idle' : 'npc_girl_idle';
    this.npc = this.physics.add.sprite(600, 250, npcSprite);
    this.npc.setScale(1.5);
    this.makeInteractive(this.npc, seeksBoy ? 'boy' : 'girl');
    
    // Play NPC idle animation
    this.npc.anims.play(seeksBoy ? 'npc_boy_idle' : 'npc_girl_idle', true);
    
    // Add player character in a clear starting position
    this.player = this.createPlayer(100, 350);
    
    // Add collision
    this.physics.add.collider(this.player, [bench, tree, flowers, this.npc]);
    
    // Add text for instructions with better styling
    this.createGameText();
    
    // Set up command listener for "go to tree" command
    this.setupCommandListener();
  }
  
  setupCommandListener() {
    // Listen for command events from the UI
    if (typeof window !== 'undefined') {
      window.addEventListener('commandSubmitted', (e) => {
        const { command } = e.detail;
        
        // Check specifically for "go to tree" variations
        const lowerCmd = command.toLowerCase().trim();
        if (lowerCmd === 'go to tree' || lowerCmd === 'go tree' || 
            lowerCmd === 'go to the tree' || lowerCmd === 'go to a tree') {
          // Find the tree object
          const tree = this.interactiveObjects['tree'];
          if (tree) {
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
          }
        } else {
          // Pass to the normal command parser for other commands
          const parsedCommand = this.game.registry.get('parseCommand')(command);
          if (parsedCommand) {
            this.handleCommand(parsedCommand);
          }
        }
      });
    }
  }
  
  createParkEnvironment() {
    // Add grass and decorative elements using the tileset
    const groundPositions = [];
    
    // Create a grid of ground positions across the bottom
    for (let x = 0; x <= 800; x += 50) {
      groundPositions.push({ x, y: 480 });
    }
    
    // Add some decorative ground tiles
    groundPositions.forEach(pos => {
      // Use the harvest objects for grass/ground
      const grass = this.add.image(pos.x, pos.y, 'harvestObjects', 0);
      grass.setScale(2);
    });
    
    // Add some small bush decorations
    const bushPositions = [
      { x: 200, y: 450 }, { x: 350, y: 450 }, { x: 500, y: 450 }, 
      { x: 650, y: 450 }
    ];
    
    bushPositions.forEach(pos => {
      const bush = this.add.image(pos.x, pos.y, 'harvestObjects', 5);
      bush.setScale(2);
    });
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
    // Any continuous updates would go here
  }
}

export default Level1Scene; 