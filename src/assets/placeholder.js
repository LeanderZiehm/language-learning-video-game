/**
 * This file creates placeholder images for development
 * In a real game, these would be replaced with actual pixel art assets
 */

// Create a simple image data URL for development
function createPlaceholderImageData(color = '#FF69B4', size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  
  // Grid pattern
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let i = 8; i < size; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }
  
  return canvas.toDataURL();
}

// Create a tree image
function createTreeImageData(color = '#2ecc71', size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * 1.5; // Match the actual tree dimensions (32x48)
  const ctx = canvas.getContext('2d');
  
  // Tree trunk
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(size * 0.4, size * 0.8, size * 0.2, size * 0.7);
  
  // Tree foliage (triangle)
  ctx.fillStyle = color;
  
  // First layer (bottom)
  ctx.beginPath();
  ctx.moveTo(size * 0.2, size * 0.8);
  ctx.lineTo(size * 0.8, size * 0.8);
  ctx.lineTo(size * 0.5, size * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // Second layer (middle)
  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.5);
  ctx.lineTo(size * 0.75, size * 0.5);
  ctx.lineTo(size * 0.5, size * 0.3);
  ctx.closePath();
  ctx.fill();
  
  // Third layer (top)
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.3);
  ctx.lineTo(size * 0.7, size * 0.3);
  ctx.lineTo(size * 0.5, size * 0.1);
  ctx.closePath();
  ctx.fill();
  
  // Add some texture
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = 1 + Math.random() * 2;
    ctx.fillRect(x, y, s, s);
  }
  
  return canvas.toDataURL();
}

// Create a heart image
function createHeartImageData(color = '#FF0000', size = 32) {
  console.log('Creating heart image data');
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  
  // Draw heart shape
  ctx.beginPath();
  ctx.moveTo(size / 2, size / 5);
  
  // Left bump
  ctx.bezierCurveTo(
    size / 8, 0,
    0, size / 3,
    size / 2, size
  );
  
  // Right bump
  ctx.bezierCurveTo(
    size, size / 3,
    7 * size / 8, 0,
    size / 2, size / 5
  );
  
  ctx.fill();
  
  return canvas.toDataURL();
}

// Map of asset names to colors for placeholders
const placeholderAssets = {
  // Characters - using createPlaceholderImageData
  'player_idle': '#3498db',
  'player_idleAnim': '#3498db',
  'player_run': '#3498db',
  'npc_girl_idle': '#ff69b4',
  'npc_girl_idleAnim': '#ff69b4',
  'npc_boy_idle': '#9b59b6',
  'npc_boy_idleAnim': '#9b59b6',
  
  // Tilesets
  'harvestTrees': 'tree', // Special handling for trees
  'harvestObjects': '#34495e',
  
  // Level 1 - Park
  'park_bg': '#7fdbff',
  'bench': '#8b4513',
  'flowers': '#e84393',
  
  // Level 2 - Cafe
  'cafe_bg': '#ecf0f1',
  'table': '#95a5a6',
  'chair': '#7f8c8d',
  'coffee': '#3c2f2f',
  'cake': '#fdcb6e',
  
  // Level 3 - Restaurant
  'restaurant_bg': '#2c3e50',
  'fancy_table': '#34495e',
  'wine': '#8e44ad',
  'food': '#f39c12',
  'candle': '#f1c40f',
  'gift': '#e74c3c',
  
  // Level 4 - Home
  'home_bg': '#dfe6e9',
  'couch': '#6c5ce7',
  'tv': '#0984e3',
  'plant': '#00b894',
  'bookshelf': '#d63031',
  
  // Special
  'heart': '#e74c3c'
};

// Function to preload all placeholder assets in Phaser
export function loadPlaceholderAssets(scene) {
  Object.entries(placeholderAssets).forEach(([key, value]) => {
    if (key === 'heart') {
      const dataUrl = createHeartImageData(value);
      scene.textures.addBase64(key, dataUrl);
    } else if (key === 'harvestTrees' || key === 'tree') {
      // Create a tree spritesheet
      const dataUrl = createTreeImageData('#2ecc71', 32);
      scene.textures.addBase64('tree', dataUrl);
      scene.textures.addBase64('harvestTrees', dataUrl);
    } else {
      const dataUrl = createPlaceholderImageData(value);
      scene.textures.addBase64(key, dataUrl);
    }
  });
  
  // Create frame-based animation data
  if (scene.anims && !scene.anims.exists('player_idle')) {
    // Player idle animation
    scene.anims.create({
      key: 'player_idle',
      frames: [
        { key: 'player_idle' }
      ],
      frameRate: 5,
      repeat: -1
    });
    
    // Player run animation
    scene.anims.create({
      key: 'player_run',
      frames: [
        { key: 'player_run' }
      ],
      frameRate: 10,
      repeat: -1
    });
    
    // NPC animations
    scene.anims.create({
      key: 'npc_girl_idle',
      frames: [
        { key: 'npc_girl_idle' }
      ],
      frameRate: 5,
      repeat: -1
    });
    
    scene.anims.create({
      key: 'npc_boy_idle',
      frames: [
        { key: 'npc_boy_idle' }
      ],
      frameRate: 5,
      repeat: -1
    });
  }
  
  console.log('Placeholder assets loaded');
} 