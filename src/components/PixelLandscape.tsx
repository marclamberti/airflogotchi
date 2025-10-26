import { useEffect, useRef } from "react";

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

function drawClouds(ctx: CanvasRenderingContext2D, width: number, height: number, blockSize: number) {
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

export const PixelLandscape = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      ctx.imageSmoothingEnabled = false;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw scene
      drawSky(ctx, width, height);
      drawClouds(ctx, width, height, blockSize);
      drawTerrain(ctx, width, height, blockSize);
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
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,
      }}
    />
  );
};

export default PixelLandscape;