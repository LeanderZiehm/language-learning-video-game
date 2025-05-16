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

// Create a heart image
function createHeartImageData(color = '#FF0000', size = 32) {
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
  // Characters
  'player': '#3498db',
  'npc_girl': '#ff69b4',
  'npc_boy': '#9b59b6',
  
  // Level 1 - Park
  'park_bg': '#7fdbff',
  'bench': '#8b4513',
  'tree': '#2ecc71',
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
  Object.entries(placeholderAssets).forEach(([key, color]) => {
    if (key === 'heart') {
      const dataUrl = createHeartImageData(color);
      scene.textures.addBase64(key, dataUrl);
    } else {
      const dataUrl = createPlaceholderImageData(color);
      scene.textures.addBase64(key, dataUrl);
    }
  });
  
  console.log('Placeholder assets loaded');
} 