#!/usr/bin/env python3
"""
Generate PWA icons for wakuwaku-island
Creates island-themed icons with blue sky background, yellow ground, and island design
"""

from PIL import Image, ImageDraw
import os

def create_icon(size):
    """
    Create an island-themed PWA icon of the specified size

    Args:
        size: Icon size in pixels (e.g., 192, 512)

    Returns:
        PIL Image object
    """
    # Create image with sky blue background
    img = Image.new('RGB', (size, size), color='#87CEEB')
    draw = ImageDraw.Draw(img)

    # Draw ground (yellow)
    ground_height = int(size * 0.25)
    draw.rectangle(
        [(0, size - ground_height), (size, size)],
        fill='#F4D03F'
    )

    # Draw island (curved shape) - using ellipse as approximation
    island_width = int(size * 0.6)
    island_height = int(size * 0.3)
    island_x = (size - island_width) // 2
    island_y = size - ground_height - island_height

    # Island body
    draw.ellipse(
        [(island_x, island_y), (island_x + island_width, island_y + island_height)],
        fill='#F4D03F'
    )

    # Island shadow
    shadow_offset = int(size * 0.02)
    draw.ellipse(
        [(island_x, island_y + shadow_offset), (island_x + island_width, island_y + island_height + shadow_offset)],
        outline='#D4AC0D',
        width=int(size * 0.02)
    )

    # Draw sun (if size is large enough)
    if size >= 192:
        sun_size = int(size * 0.12)
        sun_x = int(size * 0.15)
        sun_y = int(size * 0.12)
        draw.ellipse(
            [(sun_x, sun_y), (sun_x + sun_size, sun_y + sun_size)],
            fill='#FFD700'
        )

    # Draw simple clouds (if size is large enough)
    if size >= 192:
        cloud_color = '#FFFFFF'
        cloud_opacity = 200

        # Cloud 1
        cloud1_x = int(size * 0.1)
        cloud1_y = int(size * 0.05)
        cloud1_size = int(size * 0.08)
        draw.ellipse(
            [(cloud1_x, cloud1_y), (cloud1_x + cloud1_size, cloud1_y + cloud1_size)],
            fill=cloud_color
        )
        draw.ellipse(
            [(cloud1_x + cloud1_size // 2, cloud1_y - cloud1_size // 3),
             (cloud1_x + cloud1_size * 1.5, cloud1_y + cloud1_size // 2)],
            fill=cloud_color
        )

    return img

def main():
    """Generate and save PWA icons"""
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Generate icons
    sizes = [192, 512]

    for size in sizes:
        print(f"Generating {size}x{size} icon...")
        img = create_icon(size)
        output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
        img.save(output_path, 'PNG')
        print(f"✓ Saved to {output_path}")

    print("\n✓ All icons generated successfully!")

if __name__ == '__main__':
    main()
