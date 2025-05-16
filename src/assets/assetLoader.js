/**
 * Asset loader for LoveLingo Quest
 * Manages loading and accessing game assets
 */

// Import placeholder generator as fallback
import { loadPlaceholderAssets } from './placeholder';

// Character sprite paths
const characterSprites = {
  player: {
    idle: 'assets/Modern tiles_Free/Characters_free/Adam_idle_16x16.png',
    run: 'assets/Modern tiles_Free/Characters_free/Adam_run_16x16.png',
    idleAnim: 'assets/Modern tiles_Free/Characters_free/Adam_idle_anim_16x16.png',
    full: 'assets/Modern tiles_Free/Characters_free/Adam_16x16.png'
  },
  npc_girl: {
    idle: 'assets/Modern tiles_Free/Characters_free/Amelia_idle_16x16.png',
    run: 'assets/Modern tiles_Free/Characters_free/Amelia_run_16x16.png',
    idleAnim: 'assets/Modern tiles_Free/Characters_free/Amelia_idle_anim_16x16.png',
    full: 'assets/Modern tiles_Free/Characters_free/Amelia_16x16.png'
  },
  npc_boy: {
    idle: 'assets/Modern tiles_Free/Characters_free/Alex_idle_16x16.png',
    run: 'assets/Modern tiles_Free/Characters_free/Alex_run_16x16.png',
    idleAnim: 'assets/Modern tiles_Free/Characters_free/Alex_idle_anim_16x16.png',
    full: 'assets/Modern tiles_Free/Characters_free/Alex_16x16.png'
  }
};

// Environment sprite paths
const environmentSprites = {
  // Tilesets
  interiors: 'assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png',
  roomBuilder: 'assets/Modern tiles_Free/Interiors_free/16x16/Room_Builder_free_16x16.png',
  
  // Harvest Summer assets
  harvestTrees: 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/Vegetation/Trees 3.png',
  harvestObjects: 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/Vegetation/Some Objects.png',
  
  // Individual objects extracted from tilesets
  tree: { 
    // This is now a direct image instead of a crop
    source: 'assets/Harvest Sumer Free Ver. Pack/Harvest Sumer Free Ver. Pack/Vegetation/Trees 3.png',
    frame: 0  // Will use the first tree frame
  },
  bench: { 
    x: 208, y: 224, width: 48, height: 16, 
    source: 'assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png'
  },
  flowers: { 
    x: 448, y: 336, width: 16, height: 16, 
    source: 'assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png'
  },
  heart: { 
    x: 371, y: 129, width: 7, height: 7, 
    source: 'assets/Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png'
  }
};

// Background images (to be created from tilemap)
const backgroundSprites = {
  park_bg: { color: '#c6ebc9' },
  cafe_bg: { color: '#ffecb8' },
  restaurant_bg: { color: '#e1c8d5' },
  home_bg: { color: '#d1e8e4' }
};

/**
 * Loads all character sprites into Phaser
 * @param {Phaser.Scene} scene - The scene to load the sprites into
 */
export function loadCharacterSprites(scene) {
  // Flag to track if any assets failed to load
  let loadFailed = false;
  
  // Enable CORs for asset loading
  scene.load.crossOrigin = 'anonymous';
  
  // Fix pixelArt rendering for all textures
  scene.textures.smoothProperty = false;
  scene.textures.setFilter(Phaser.Textures.FilterMode.NEAREST);
  
  // Set up error handler
  scene.load.on('loaderror', (fileObj) => {
    console.warn('Asset failed to load:', fileObj.src);
    loadFailed = true;
  });
  
  // Load character sprites
  Object.entries(characterSprites).forEach(([key, sprites]) => {
    // Load all variants
    Object.entries(sprites).forEach(([variant, path]) => {
      scene.load.spritesheet(`${key}_${variant}`, path, { 
        frameWidth: 16, 
        frameHeight: 32 
      });
    });
  });
  
  // If any assets fail to load, use placeholders
  scene.load.on('complete', () => {
    if (loadFailed) {
      console.warn('Some assets failed to load, using placeholders instead');
      loadPlaceholderAssets(scene);
    } else {
      console.log('Character sprites loaded successfully');
      createCharacterAnimations(scene);
    }
  });
  
  // Start the load
  scene.load.start();
}

/**
 * Loads environment assets into Phaser
 * @param {Phaser.Scene} scene - The scene to load the assets into
 */
export function loadEnvironmentAssets(scene) {
  // Flag to track if any assets failed to load
  let loadFailed = false;
  
  // Enable CORs for asset loading
  scene.load.crossOrigin = 'anonymous';
  
  // Fix pixelArt rendering for all textures
  scene.textures.smoothProperty = false;
  scene.textures.setFilter(Phaser.Textures.FilterMode.NEAREST);
  
  // Set up error handler
  scene.load.on('loaderror', (fileObj) => {
    console.warn('Asset failed to load:', fileObj.src);
    loadFailed = true;
  });
  
  try {
    // Load full tilesets
    scene.load.image('interiors', environmentSprites.interiors);
    scene.load.image('roomBuilder', environmentSprites.roomBuilder);
    
    // Load Harvest Summer assets
    scene.load.spritesheet('harvestTrees', environmentSprites.harvestTrees, {
      frameWidth: 32,
      frameHeight: 48  // Adjusted from 64 to 48 to match the actual dimensions
    });
    
    scene.load.spritesheet('harvestObjects', environmentSprites.harvestObjects, {
      frameWidth: 16,
      frameHeight: 16
    });
    
    // Create background colors
    Object.entries(backgroundSprites).forEach(([key, bg]) => {
      createBackgroundImage(scene, key, bg.color);
    });
    
    // Attempt to create individual object sprites
    scene.load.on('complete', () => {
      if (!loadFailed) {
        try {
          // For the tree, we'll use the spritesheet directly
          // Other objects still use extracted sprites
          createObjectSprite(scene, 'bench', environmentSprites.bench);
          createObjectSprite(scene, 'flowers', environmentSprites.flowers);
          createObjectSprite(scene, 'heart', environmentSprites.heart);
          console.log('Environment assets loaded successfully');
        } catch (error) {
          console.warn('Error creating object sprites:', error);
          loadPlaceholderAssets(scene);
        }
      } else {
        console.warn('Some environment assets failed to load, using placeholders instead');
        loadPlaceholderAssets(scene);
      }
    });
    
    // Start the load
    scene.load.start();
  } catch (error) {
    console.warn('Error loading environment assets:', error);
    loadPlaceholderAssets(scene);
  }
}

/**
 * Creates a background image with the specified color
 */
function createBackgroundImage(scene, key, color) {
  // Create a solid color background
  const bgTexture = scene.textures.createCanvas(key, 800, 600);
  const context = bgTexture.getContext();
  context.fillStyle = color;
  context.fillRect(0, 0, 800, 600);
  
  // Add some grid lines for visual interest
  context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  context.lineWidth = 1;
  
  // Horizontal lines
  for (let y = 0; y < 600; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(800, y);
    context.stroke();
  }
  
  // Vertical lines
  for (let x = 0; x < 800; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 600);
    context.stroke();
  }
  
  bgTexture.refresh();
}

/**
 * Creates an object sprite from a section of a tileset
 */
function createObjectSprite(scene, key, spriteData) {
  try {
    const { x, y, width, height, source } = spriteData;
    
    // Check if source texture exists
    if (!scene.textures.exists('interiors')) {
      throw new Error('Source texture not loaded');
    }
    
    // Create a new texture for the object
    const texture = scene.textures.createCanvas(key, width, height);
    const context = texture.getContext();
    
    // Draw the specific region from the tileset
    const sourceTexture = scene.textures.get('interiors');
    const sourceImage = sourceTexture.getSourceImage();
    
    context.drawImage(
      sourceImage,
      x, y, width, height,
      0, 0, width, height
    );
    
    texture.refresh();
  } catch (error) {
    console.warn(`Failed to create object sprite ${key}:`, error);
    // Fall back to placeholder for this sprite
  }
}

/**
 * Creates character animations
 * @param {Phaser.Scene} scene - The scene to create animations in
 */
export function createCharacterAnimations(scene) {
  try {
    // Player animations
    if (scene.textures.exists('player_idleAnim')) {
      scene.anims.create({
        key: 'player_idle',
        frames: scene.anims.generateFrameNumbers('player_idleAnim', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    if (scene.textures.exists('player_run')) {
      scene.anims.create({
        key: 'player_run',
        frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // NPC girl animations
    if (scene.textures.exists('npc_girl_idleAnim')) {
      scene.anims.create({
        key: 'npc_girl_idle',
        frames: scene.anims.generateFrameNumbers('npc_girl_idleAnim', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    // NPC boy animations
    if (scene.textures.exists('npc_boy_idleAnim')) {
      scene.anims.create({
        key: 'npc_boy_idle',
        frames: scene.anims.generateFrameNumbers('npc_boy_idleAnim', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    console.log('Character animations created');
  } catch (error) {
    console.warn('Error creating animations:', error);
  }
} 