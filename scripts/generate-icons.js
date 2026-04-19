#!/usr/bin/env node

/**
 * Generate PWA icons for wakuwaku-island
 * Creates island-themed icons with blue sky, yellow ground, and emoji elements
 * Uses sharp for efficient image processing
 *
 * Run with: node scripts/generate-icons.js
 * Or add to package.json: "generate-icons": "node scripts/generate-icons.js"
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'public', 'icons');

/**
 * Create SVG for island icon
 * Sky blue background, yellow ground, and island shape
 */
function createIconSvg(size) {
  const groundHeight = Math.floor(size * 0.25);
  const islandWidth = Math.floor(size * 0.5);
  const islandHeight = Math.floor(size * 0.2);
  const islandX = (size - islandWidth) / 2;
  const islandY = size - groundHeight - islandHeight;

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Sky background -->
      <rect width="${size}" height="${size}" fill="#87CEEB"/>

      <!-- Ground -->
      <rect y="${size - groundHeight}" width="${size}" height="${groundHeight}" fill="#F4D03F"/>

      <!-- Island -->
      <ellipse cx="${size / 2}" cy="${islandY + islandHeight / 2}" rx="${islandWidth / 2}" ry="${islandHeight / 2}" fill="#F4D03F"/>

      <!-- Sun -->
      <circle cx="${Math.floor(size * 0.2)}" cy="${Math.floor(size * 0.15)}" r="${Math.floor(size * 0.08)}" fill="#FFD700"/>

      <!-- Cloud 1 -->
      <circle cx="${Math.floor(size * 0.15)}" cy="${Math.floor(size * 0.08)}" r="${Math.floor(size * 0.05)}" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="${Math.floor(size * 0.22)}" cy="${Math.floor(size * 0.10)}" r="${Math.floor(size * 0.04)}" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="${Math.floor(size * 0.08)}" cy="${Math.floor(size * 0.10)}" r="${Math.floor(size * 0.04)}" fill="#FFFFFF" opacity="0.9"/>

      <!-- Cloud 2 -->
      <circle cx="${Math.floor(size * 0.85)}" cy="${Math.floor(size * 0.12)}" r="${Math.floor(size * 0.05)}" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="${Math.floor(size * 0.92)}" cy="${Math.floor(size * 0.14)}" r="${Math.floor(size * 0.04)}" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="${Math.floor(size * 0.78)}" cy="${Math.floor(size * 0.14)}" r="${Math.floor(size * 0.04)}" fill="#FFFFFF" opacity="0.85"/>

      <!-- Emoji elements (if size allows) -->
      ${size >= 192 ? `
        <text x="${Math.floor(size * 0.25)}" y="${Math.floor(size * 0.65)}" font-size="${Math.floor(size * 0.2)}" text-anchor="middle">🏝️</text>
        <text x="${Math.floor(size * 0.75)}" y="${Math.floor(size * 0.65)}" font-size="${Math.floor(size * 0.15)}" text-anchor="middle">🐰</text>
      ` : ''}
    </svg>
  `;
}

/**
 * Create SVG for OpenGraph image (1200x630px for social sharing)
 */
function createOgImageSvg() {
  const width = 1200;
  const height = 630;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Sky gradient background -->
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E0F6FF;stop-opacity:1" />
        </linearGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#skyGradient)"/>

      <!-- Ground -->
      <rect y="${Math.floor(height * 0.65)}" width="${width}" height="${Math.floor(height * 0.35)}" fill="#F4D03F"/>

      <!-- Large island -->
      <ellipse cx="${width / 2}" cy="${Math.floor(height * 0.65)}" rx="${Math.floor(width * 0.35)}" ry="${Math.floor(height * 0.15)}" fill="#F4D03F"/>

      <!-- Sun -->
      <circle cx="${Math.floor(width * 0.15)}" cy="${Math.floor(height * 0.12)}" r="${Math.floor(width * 0.06)}" fill="#FFD700"/>

      <!-- Clouds -->
      <circle cx="${Math.floor(width * 0.2)}" cy="${Math.floor(height * 0.1)}" r="${Math.floor(width * 0.05)}" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="${Math.floor(width * 0.3)}" cy="${Math.floor(height * 0.12)}" r="${Math.floor(width * 0.04)}" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="${Math.floor(width * 0.1)}" cy="${Math.floor(height * 0.12)}" r="${Math.floor(width * 0.04)}" fill="#FFFFFF" opacity="0.9"/>

      <circle cx="${Math.floor(width * 0.85)}" cy="${Math.floor(height * 0.15)}" r="${Math.floor(width * 0.05)}" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="${Math.floor(width * 0.95)}" cy="${Math.floor(height * 0.18)}" r="${Math.floor(width * 0.04)}" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="${Math.floor(width * 0.75)}" cy="${Math.floor(height * 0.18)}" r="${Math.floor(width * 0.04)}" fill="#FFFFFF" opacity="0.85"/>

      <!-- Title text -->
      <text x="${width / 2}" y="${Math.floor(height * 0.35)}" font-size="72" font-weight="900" text-anchor="middle" fill="#FF6B35" font-family="sans-serif">わくわくアイランド</text>

      <!-- Subtitle -->
      <text x="${width / 2}" y="${Math.floor(height * 0.45)}" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" opacity="0.95">楽しいゲームがいっぱい！</text>

      <!-- Emoji decorations on island -->
      <text x="${Math.floor(width * 0.25)}" y="${Math.floor(height * 0.70)}" font-size="80" text-anchor="middle">🏝️</text>
      <text x="${Math.floor(width * 0.5)}" y="${Math.floor(height * 0.68)}" font-size="70" text-anchor="middle">🐱</text>
      <text x="${Math.floor(width * 0.75)}" y="${Math.floor(height * 0.71)}" font-size="65" text-anchor="middle">🐰</text>
      <text x="${Math.floor(width * 0.35)}" y="${Math.floor(height * 0.75)}" font-size="60" text-anchor="middle">🎮</text>
      <text x="${Math.floor(width * 0.65)}" y="${Math.floor(height * 0.73)}" font-size="60" text-anchor="middle">✨</text>
    </svg>
  `;
}

async function generateIcon(size) {
  const svg = createIconSvg(size);
  const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function generateOgImage() {
  const svg = createOgImageSvg();
  const publicDir = path.join(outputDir, '..');
  const outputPath = path.join(publicDir, 'og-image.png');

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function main() {
  try {
    console.log('🎨 Generating PWA icons and social images for wakuwaku-island...\n');

    // Create output directory
    await mkdir(outputDir, { recursive: true });
    console.log(`📁 Output directory: ${outputDir}\n`);

    // Generate app icons
    const sizes = [192, 512];

    for (const size of sizes) {
      console.log(`⏳ Generating ${size}x${size} app icon...`);
      const filePath = await generateIcon(size);
      console.log(`✓ Saved: icon-${size}x${size}.png\n`);
    }

    // Generate OGP image
    console.log(`⏳ Generating OGP social image (1200x630)...`);
    const ogPath = await generateOgImage();
    console.log(`✓ Saved: og-image.png\n`);

    console.log('🎉 All images generated successfully!');
    console.log('✨ Icons are ready for your PWA manifest and home screen.');
    console.log('📱 Social image ready for Twitter, Facebook, Discord, etc.');

  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

main();
