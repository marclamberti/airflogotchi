import { useEffect, useRef, useState } from "react";
import creatureNormal from "../assets/creature/normal.png";
import creatureHungry from "../assets/creature/hungry.png";
import creatureSleep from "../assets/creature/sleep.png";
import creatureDead from "../assets/creature/dead.png";

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

// API function to fetch successful DAG runs from Airflow
async function fetchSuccessfulDagRuns(): Promise<number> {
  try {
    // Calculate timestamp for 1 minute ago
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();

    // Build API URL with query parameters (using relative URL for Vite proxy)
    const apiUrl = new URL('/api/v2/dags/~/dagRuns', window.location.origin);
    apiUrl.searchParams.append('limit', '50');
    apiUrl.searchParams.append('offset', '0');
    apiUrl.searchParams.append('start_date_gte', oneMinuteAgo);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Count successful DAG runs
    const successfulRuns = data.dag_runs?.filter((run: any) => run.state === 'success').length || 0;

    return successfulRuns;
  } catch (error) {
    console.error('Error fetching DAG runs:', error);
    return 0; // Return 0 on error to avoid breaking the component
  }
}

// API function to check if there were any successful DAG runs in the past hour
async function fetchSuccessfulDagRunsLastHour(): Promise<boolean> {
  try {
    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Build API URL with query parameters (using relative URL for Vite proxy)
    const apiUrl = new URL('/api/v2/dags/~/dagRuns', window.location.origin);
    apiUrl.searchParams.append('limit', '50');
    apiUrl.searchParams.append('offset', '0');
    apiUrl.searchParams.append('start_date_gte', oneHourAgo);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if any successful DAG runs exist
    const hasSuccessfulRuns = data.dag_runs?.some((run: any) => run.state === 'success') || false;

    return hasSuccessfulRuns;
  } catch (error) {
    console.error('Error fetching DAG runs for sleep check:', error);
    return true; // Return true on error to avoid showing sleep state incorrectly
  }
}

// API function to check if there were any successful DAG runs in the past 24 hours
async function fetchSuccessfulDagRunsLast24Hours(): Promise<boolean> {
  try {
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Build API URL with query parameters (using relative URL for Vite proxy)
    const apiUrl = new URL('/api/v2/dags/~/dagRuns', window.location.origin);
    apiUrl.searchParams.append('limit', '100');
    apiUrl.searchParams.append('offset', '0');
    apiUrl.searchParams.append('start_date_gte', twentyFourHoursAgo);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if any successful DAG runs exist
    const hasSuccessfulRuns = data.dag_runs?.some((run: any) => run.state === 'success') || false;

    return hasSuccessfulRuns;
  } catch (error) {
    console.error('Error fetching DAG runs for daily heart check:', error);
    return true; // Return true on error to avoid removing hearts incorrectly
  }
}

function drawPixelHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, filled: boolean) {
  // Pixel art heart pattern (8x7 grid)
  const heartPattern = [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  const pixelSize = size / 8;

  for (let row = 0; row < heartPattern.length; row++) {
    const rowData = heartPattern[row];
    if (!rowData) continue;

    for (let col = 0; col < rowData.length; col++) {
      if (rowData[col] === 1) {
        if (filled) {
          // Filled heart - red
          ctx.fillStyle = "#FF0000";
        } else {
          // Empty heart - white outline with dark interior
          ctx.fillStyle = "#FFFFFF";
        }
        ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);

        // Add black outline to each pixel for definition
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function drawHungerBar(ctx: CanvasRenderingContext2D, currentHunger: number = 0, maxHunger: number = 10, currentHearts: number = 5) {
  const barX = 20;
  const barY = 70; // Moved down to make room for hearts
  const barWidth = 150;
  const barHeight = 20;
  const borderWidth = 2;

  // Draw five pixel hearts above the hunger bar (based on long-term health, not hunger)
  const heartSize = 16;
  const heartSpacing = 20;
  const heartsY = 20;
  const maxHearts = 5;

  for (let i = 0; i < maxHearts; i++) {
    const heartX = barX + i * heartSpacing;
    const filled = i < currentHearts; // Fill hearts from left to right based on current hearts
    drawPixelHeart(ctx, heartX, heartsY, heartSize, filled);
  }

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

function drawResetButton(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
  const buttonWidth = 80;
  const buttonHeight = 30;
  const buttonX = canvasWidth - buttonWidth - 20;
  const buttonY = canvasHeight - buttonHeight - 20;
  const borderWidth = 2;

  // Draw button border (dark outline)
  ctx.fillStyle = "#000000";
  ctx.fillRect(buttonX - borderWidth, buttonY - borderWidth, buttonWidth + borderWidth * 2, buttonHeight + borderWidth * 2);

  // Draw button background
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  // Draw highlight effect (retro style)
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight / 3);

  // Draw button text
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  const text = "RESET";
  const textMetrics = ctx.measureText(text);
  const textX = buttonX + (buttonWidth - textMetrics.width) / 2;
  const textY = buttonY + buttonHeight / 2 + 5;
  ctx.strokeText(text, textX, textY);
  ctx.fillText(text, textX, textY);
}

export const PixelLandscape = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const creatureNormalImageRef = useRef<HTMLImageElement | null>(null);
  const creatureHungryImageRef = useRef<HTMLImageElement | null>(null);
  const creatureSleepImageRef = useRef<HTMLImageElement | null>(null);
  const creatureDeadImageRef = useRef<HTMLImageElement | null>(null);
  const imagesLoadedRef = useRef<{ normal: boolean; hungry: boolean; sleep: boolean; dead: boolean }>({ normal: false, hungry: false, sleep: false, dead: false });

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

  // Track if creature should be sleeping (no successful runs in past hour)
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  // Initialize hearts from localStorage or default to 5
  const [hearts, setHearts] = useState<number>(() => {
    const stored = localStorage.getItem("hearts");
    if (stored !== null) {
      return parseInt(stored, 10);
    }
    localStorage.setItem("hearts", "5");
    return 5;
  });

  // Initialize lastDailyCheck from localStorage or default to current time
  const [lastDailyCheck, setLastDailyCheck] = useState<number>(() => {
    const stored = localStorage.getItem("lastDailyCheck");
    if (stored !== null) {
      return parseInt(stored, 10);
    }
    const now = Date.now();
    localStorage.setItem("lastDailyCheck", now.toString());
    return now;
  });

  // Track if creature is dead (no hearts left)
  const [isDead, setIsDead] = useState<boolean>(() => {
    const stored = localStorage.getItem("isDead");
    if (stored !== null) {
      return stored === "true";
    }
    // Check hearts as fallback
    const storedHearts = localStorage.getItem("hearts");
    const isDeadState = storedHearts !== null && parseInt(storedHearts, 10) === 0;
    localStorage.setItem("isDead", isDeadState.toString());
    return isDeadState;
  });

  // Fetch successful DAG runs and update hunger on mount and periodically
  useEffect(() => {
    const updateHungerFromAPI = async () => {
      // If dead, don't update anything - creature can't eat or change state
      if (isDead) {
        return;
      }

      const successfulRuns = await fetchSuccessfulDagRuns();
      const hasRunsInLastHour = await fetchSuccessfulDagRunsLastHour();

      // Update sleep state based on whether there were any runs in the past hour
      setIsSleeping(!hasRunsInLastHour);

      // Check if 24 hours have passed since last daily check
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const timeSinceLastCheck = now - lastDailyCheck;

      if (timeSinceLastCheck >= twentyFourHours) {
        // 24 hours have passed, check for successful runs in past 24 hours
        const hasRunsInLast24Hours = await fetchSuccessfulDagRunsLast24Hours();

        if (!hasRunsInLast24Hours && hearts > 0) {
          // No successful runs in past 24 hours, lose a heart
          const newHearts = hearts - 1;
          setHearts(newHearts);
          localStorage.setItem("hearts", newHearts.toString());

          if (newHearts === 0) {
            setIsDead(true);
          }
        }

        // Update last daily check timestamp
        setLastDailyCheck(now);
        localStorage.setItem("lastDailyCheck", now.toString());
      }

      if (successfulRuns === 0) {
        // No successful runs, decrease hunger by 1 (but not below 0)
        setHunger(prev => Math.max(0, prev - 1));
      } else {
        // Set hunger to the number of successful runs
        setHunger(successfulRuns);
      }
    };

    // Initial fetch on mount
    updateHungerFromAPI();

    // Set up polling every 1 minute (60000ms)
    const intervalId = setInterval(updateHungerFromAPI, 1 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [lastDailyCheck, hearts, isDead]);

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

  // Sync isDead state to localStorage
  useEffect(() => {
    localStorage.setItem("isDead", isDead.toString());
  }, [isDead]);

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

    // Load sleep creature image
    const sleepImg = new Image();
    sleepImg.src = creatureSleep;
    sleepImg.onload = () => {
      creatureSleepImageRef.current = sleepImg;
      imagesLoadedRef.current.sleep = true;
      // Trigger a re-render when image is loaded
      const canvas = canvasRef.current;
      if (canvas) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };

    // Load dead creature image
    const deadImg = new Image();
    deadImg.src = creatureDead;
    deadImg.onload = () => {
      creatureDeadImageRef.current = deadImg;
      imagesLoadedRef.current.dead = true;
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

      // Draw creature - priority: dead > hungry > sleep > normal
      const isHungry = hunger <= 3;
      let creatureImage;
      let imageLoaded;

      if (isDead) {
        // Dead state takes highest priority
        creatureImage = creatureDeadImageRef.current;
        imageLoaded = imagesLoadedRef.current.dead;
      } else if (isHungry) {
        // Hungry state takes priority over sleep and normal
        creatureImage = creatureHungryImageRef.current;
        imageLoaded = imagesLoadedRef.current.hungry;
      } else if (isSleeping) {
        // Sleep state if not hungry and no runs in past hour
        creatureImage = creatureSleepImageRef.current;
        imageLoaded = imagesLoadedRef.current.sleep;
      } else {
        // Normal state
        creatureImage = creatureNormalImageRef.current;
        imageLoaded = imagesLoadedRef.current.normal;
      }

      if (imageLoaded && creatureImage) {
        drawCreature(ctx!, creatureImage, width, height, blockSize);
      }

      // Draw hunger bar UI overlay with hearts
      drawHungerBar(ctx!, hunger, 10, hearts);

      // Draw reset button
      drawResetButton(ctx!, width, height);
    }

    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hunger, isSleeping, hearts, isDead]);

  // Handle canvas click for reset button
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // Reset button bounds (bottom right corner)
    const buttonWidth = 80;
    const buttonHeight = 30;
    const buttonX = canvas.width - buttonWidth - 20;
    const buttonY = canvas.height - buttonHeight - 20;

    // Check if click is within button bounds
    if (
      clickX >= buttonX &&
      clickX <= buttonX + buttonWidth &&
      clickY >= buttonY &&
      clickY <= buttonY + buttonHeight
    ) {
      // Reset game state
      localStorage.removeItem("hungriness");
      localStorage.removeItem("hearts");
      localStorage.removeItem("lastDailyCheck");
      localStorage.removeItem("isDead");
      window.location.reload();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        imageRendering: "pixelated" as any,
        cursor: "pointer",
      }}
    />
  );
};

export default PixelLandscape;