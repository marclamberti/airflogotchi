import { useEffect, useRef, useState } from "react";
import creatureNormal from "../assets/creature/normal.png";
import creatureHungry from "../assets/creature/hungry.png";

// Minecraft-style pixel landscape with grass, dirt, and clouds

const PALETTE = {
  sky: "#6AB5D8",
  cloudWhite: "#FFFFFF",
  cloudLight: "#F0F0F0",
  grassTop: "#7FC544",
  grassSide: "#5FA635",
  grassDark: "#4A8A2A",
  dirt: "#8B5A3C",
  dirtDark: "#6B4226",
  dirtLight: "#9B6A4C",
};

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) {
  const cloudPattern = [
    "   WWW   ",
    " WWWWWWW ",
    "WWWWWWWWW",
    "WWWWWWWWW",
    " WWWWWWW ",
  ];

  cloudPattern.forEach((row, rowIndex) => {
    row.split('').forEach((pixel, colIndex) => {
      if (pixel === 'W') {
        const color = (rowIndex === 0 || colIndex === 0 || colIndex === row.length - 1)
          ? PALETTE.cloudLight
          : PALETTE.cloudWhite;
        drawPixel(ctx, x + colIndex, y + rowIndex, color, blockSize);
      }
    });
  });
}

function drawGrassBlock(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) {
  // Main dirt block
  drawRect(ctx, x * blockSize, y * blockSize, blockSize, blockSize, PALETTE.dirt);

  // Top surface - bright green grass (thinner layer)
  const grassHeight = Math.floor(blockSize * 0.75);
  drawRect(ctx, x * blockSize, y * blockSize, blockSize, grassHeight, PALETTE.grassTop);

  // Add some grass texture on top
  const grassPixels = Math.floor(blockSize / 4);
  for (let i = 0; i < grassPixels; i++) {
    const px = x * blockSize + (i * 4) + (Math.random() * 2);
    const py = y * blockSize + Math.random() * (grassHeight - 2);
    if (Math.random() > 0.5) {
      drawRect(ctx, px, py, 2, 2, PALETTE.grassDark);
    }
  }

  // Side grass tint (subtle green tint on sides)
  drawRect(ctx, x * blockSize, y * blockSize + grassHeight, blockSize, 2, PALETTE.grassSide);

  // Add some dirt texture to the dirt part
  for (let i = 0; i < 4; i++) {
    const dx = x * blockSize + (Math.random() * blockSize);
    const dy = y * blockSize + grassHeight + 2 + (Math.random() * (blockSize - grassHeight - 2));
    drawRect(ctx, dx, dy, 2, 2, PALETTE.dirtDark);
  }

  // Add lighter dirt spots
  for (let i = 0; i < 2; i++) {
    const dx = x * blockSize + (Math.random() * blockSize);
    const dy = y * blockSize + grassHeight + (Math.random() * (blockSize - grassHeight));
    drawRect(ctx, dx, dy, 2, 2, PALETTE.dirtLight);
  }
}

function drawDirtBlock(ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) {
  // Main dirt color
  drawRect(ctx, x * blockSize, y * blockSize, blockSize, blockSize, PALETTE.dirt);

  // Add texture with darker and lighter spots
  const textureCount = Math.floor(blockSize / 4);
  for (let i = 0; i < textureCount; i++) {
    for (let j = 0; j < textureCount; j++) {
      const px = x * blockSize + (i * 4);
      const py = y * blockSize + (j * 4);

      if ((i + j) % 3 === 0) {
        drawRect(ctx, px, py, 3, 3, PALETTE.dirtDark);
      } else if ((i + j) % 5 === 0) {
        drawRect(ctx, px + 1, py + 1, 2, 2, PALETTE.dirtLight);
      }
    }
  }

  // Add block edges
  drawRect(ctx, x * blockSize, y * blockSize, blockSize, 1, PALETTE.dirtDark);
  drawRect(ctx, x * blockSize, y * blockSize, 1, blockSize, PALETTE.dirtDark);
  drawRect(ctx, (x + 1) * blockSize - 1, y * blockSize, 1, blockSize, PALETTE.dirtLight);
  drawRect(ctx, x * blockSize, (y + 1) * blockSize - 1, blockSize, 1, PALETTE.dirtLight);
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Clear blue sky
  drawRect(ctx, 0, 0, width, height, PALETTE.sky);
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, blockSize: number) {
  // Draw several clouds at different positions
  const cloudPositions = [
    { x: 5, y: 3 },
    { x: 20, y: 6 },
    { x: 35, y: 4 },
  ];

  cloudPositions.forEach(pos => {
    if (pos.x * blockSize < width) {
      drawCloud(ctx, pos.x, pos.y, blockSize);
    }
  });
}

function drawTerrain(ctx: CanvasRenderingContext2D, width: number, height: number, blockSize: number) {
  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);
  const groundLevel = Math.floor(blocksY * 0.7); // Ground starts at 70% down

  // Draw terrain blocks
  for (let x = 0; x < blocksX; x++) {
    // Grass layer (top layer)
    drawGrassBlock(ctx, x, groundLevel, blockSize);

    // Dirt layers below
    for (let y = groundLevel + 1; y < blocksY; y++) {
      drawDirtBlock(ctx, x, y, blockSize);
    }
  }
}

function drawCreature(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, blockSize: number) {
  // Calculate ground level (same as terrain calculation)
  const blocksY = Math.floor(height / blockSize);
  const groundLevel = Math.floor(blocksY * 0.7);

  // Scale the creature to be about 2 blocks tall (fits better with the landscape)
  const creatureHeight = blockSize * 8;
  const aspectRatio = image.width / image.height;
  const creatureWidth = creatureHeight * aspectRatio;

  // Calculate creature position
  // Center horizontally
  const creatureX = Math.floor(width / 2) - Math.floor(creatureWidth / 2);

  // Position on top of grass (ground level in pixels minus scaled height)
  const groundPixelY = groundLevel * blockSize;
  const creatureY = groundPixelY - creatureHeight + 5; // Slight adjustment to sit nicely on grass

  // Draw the scaled creature
  ctx.drawImage(image, creatureX, creatureY, creatureWidth, creatureHeight);
}

function drawHungerBar(ctx: CanvasRenderingContext2D, currentHunger: number = 0, maxHunger: number = 10) {
  const barX = 20;
  const barY = 40;
  const barWidth = 150;
  const barHeight = 20;
  const borderWidth = 2;

  // Draw "Hunger 0/10" text above the bar
  ctx.font = "16px monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  const hungerText = `Hunger ${currentHunger}/${maxHunger}`;
  ctx.strokeText(hungerText, barX, barY - 10);
  ctx.fillText(hungerText, barX, barY - 10);

  // Draw bar border (dark outline)
  ctx.fillStyle = "#000000";
  ctx.fillRect(barX - borderWidth, barY - borderWidth, barWidth + borderWidth * 2, barHeight + borderWidth * 2);

  // Draw bar background (empty bar)
  ctx.fillStyle = "#333333";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw hunger fill (green to red gradient based on hunger level)
  if (currentHunger > 0) {
    const fillWidth = (currentHunger / maxHunger) * barWidth;

    // Color based on hunger level (green when full, red when hungry)
    const hungerRatio = currentHunger / maxHunger;
    let fillColor;
    if (hungerRatio > 0.6) {
      fillColor = "#4CAF50"; // Green
    } else if (hungerRatio > 0.3) {
      fillColor = "#FFC107"; // Yellow
    } else {
      fillColor = "#F44336"; // Red
    }

    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Add highlight effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(barX, barY, fillWidth, barHeight / 3);
  }

  // Draw pixel notches for each hunger point
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  for (let i = 1; i < maxHunger; i++) {
    const notchX = barX + (i * barWidth / maxHunger);
    ctx.beginPath();
    ctx.moveTo(notchX, barY);
    ctx.lineTo(notchX, barY + barHeight);
    ctx.stroke();
  }
}

export const PixelLandscape = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const creatureNormalImageRef = useRef<HTMLImageElement | null>(null);
  const creatureHungryImageRef = useRef<HTMLImageElement | null>(null);
  const imagesLoadedRef = useRef<{ normal: boolean; hungry: boolean }>({ normal: false, hungry: false });

  // Initialize hunger from localStorage or default to 0
  const [hunger, setHunger] = useState<number>(() => {
    const stored = localStorage.getItem("hungriness");
    if (stored !== null) {
      return parseInt(stored, 10);
    }
    // Set initial value to 0 in localStorage
    localStorage.setItem("hungriness", "0");
    return 0;
  });

  // Sync hunger changes to localStorage and trigger re-render
  useEffect(() => {
    localStorage.setItem("hungriness", hunger.toString());
    // Trigger canvas re-render when hunger changes
    const canvas = canvasRef.current;
    if (canvas) {
      const event = new Event('resize');
      window.dispatchEvent(event);
    }
  }, [hunger]);

  // Load creature images once
  useEffect(() => {
    // Load normal creature image
    const normalImg = new Image();
    normalImg.src = creatureNormal;
    normalImg.onload = () => {
      creatureNormalImageRef.current = normalImg;
      imagesLoadedRef.current.normal = true;
      // Trigger a re-render when image is loaded
      const canvas = canvasRef.current;
      if (canvas) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };

    // Load hungry creature image
    const hungryImg = new Image();
    hungryImg.src = creatureHungry;
    hungryImg.onload = () => {
      creatureHungryImageRef.current = hungryImg;
      imagesLoadedRef.current.hungry = true;
      // Trigger a re-render when image is loaded
      const canvas = canvasRef.current;
      if (canvas) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const blockSize = 32; // Increased size for better visibility and square appearance

    function render() {
      const parent = canvas.parentElement!;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Disable antialiasing for crisp pixels
      ctx!.imageSmoothingEnabled = false;

      // Clear canvas
      ctx!.clearRect(0, 0, width, height);

      // Draw scene
      drawSky(ctx!, width, height);
      drawClouds(ctx!, width, blockSize);
      drawTerrain(ctx!, width, height, blockSize);

      // Draw creature - use hungry image if hunger <= 3, otherwise normal
      const isHungry = hunger <= 3;
      const creatureImage = isHungry ? creatureHungryImageRef.current : creatureNormalImageRef.current;
      const imageLoaded = isHungry ? imagesLoadedRef.current.hungry : imagesLoadedRef.current.normal;

      if (imageLoaded && creatureImage) {
        drawCreature(ctx!, creatureImage, width, height, blockSize);
      }

      // Draw hunger bar UI overlay
      drawHungerBar(ctx!, hunger, 10);
    }

    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        imageRendering: "pixelated" as any,
      }}
    />
  );
};

export default PixelLandscape;