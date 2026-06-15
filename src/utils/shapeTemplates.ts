export type ShapeType = 
  | 'heart'
  | 'star'
  | 'circle'
  | 'square'
  | 'diamond'
  | 'triangle'
  | 'cloud'
  | 'flower'
  | 'apple'
  | 'moon';

export interface ShapeTemplate {
  id: ShapeType;
  name: string;
  icon: string;
}

export const SHAPE_TEMPLATES: ShapeTemplate[] = [
  { id: 'heart', name: '爱心', icon: '❤️' },
  { id: 'star', name: '星星', icon: '⭐' },
  { id: 'circle', name: '圆形', icon: '⭕' },
  { id: 'square', name: '方形', icon: '⬛' },
  { id: 'diamond', name: '菱形', icon: '💎' },
  { id: 'triangle', name: '三角形', icon: '🔺' },
  { id: 'cloud', name: '云朵', icon: '☁️' },
  { id: 'flower', name: '花朵', icon: '🌸' },
  { id: 'apple', name: '苹果', icon: '🍎' },
  { id: 'moon', name: '月亮', icon: '🌙' },
];

function isInsideShape(x: number, y: number, shape: ShapeType): boolean {
  const nx = (x - 0.5) * 2;
  const ny = (y - 0.5) * 2;

  switch (shape) {
    case 'circle':
      return nx * nx + ny * ny <= 1;

    case 'square':
      return Math.abs(nx) <= 0.95 && Math.abs(ny) <= 0.95;

    case 'diamond':
      return Math.abs(nx) + Math.abs(ny) <= 1;

    case 'triangle': {
      const tx = nx;
      const ty = -ny;
      if (ty < -0.8 || ty > 0.8) return false;
      const halfWidth = (0.8 - ty) * 0.9;
      return Math.abs(tx) <= halfWidth;
    }

    case 'heart': {
      const hx = nx * 1.2;
      const hy = -ny * 1.2 - 0.2;
      const leftHeart = (hx + 0.4) * (hx + 0.4) + (hy - 0.3) * (hy - 0.3) <= 0.3;
      const rightHeart = (hx - 0.4) * (hx - 0.4) + (hy - 0.3) * (hy - 0.3) <= 0.3;
      const bottom = hy <= 0.3 && Math.abs(hx) <= (0.3 - hy) * 1.3;
      return (leftHeart || rightHeart || bottom) && hy >= -0.9;
    }

    case 'star': {
      const angle = Math.atan2(ny, nx);
      const radius = Math.sqrt(nx * nx + ny * ny);
      const normalizedAngle = ((angle % (Math.PI * 2 / 5)) + Math.PI * 2 / 5) % (Math.PI * 2 / 5);
      const rOuter = 0.9;
      const rInner = 0.4;
      const t = normalizedAngle / (Math.PI * 2 / 5);
      const starRadius = t < 0.5
        ? rInner + (rOuter - rInner) * (t * 2)
        : rOuter - (rOuter - rInner) * ((t - 0.5) * 2);
      return radius <= starRadius;
    }

    case 'cloud': {
      const cx = nx;
      const cy = ny;
      const blob1 = (cx + 0.3) * (cx + 0.3) + (cy + 0.1) * (cy + 0.1) <= 0.35;
      const blob2 = (cx - 0.3) * (cx - 0.3) + (cy + 0.1) * (cy + 0.1) <= 0.35;
      const blob3 = cx * cx + (cy - 0.2) * (cy - 0.2) <= 0.4;
      const bottom = cy >= -0.6 && cy <= -0.2 && Math.abs(cx) <= 0.6;
      return (blob1 || blob2 || blob3 || bottom) && cy <= 0.5 && cy >= -0.6;
    }

    case 'flower': {
      const petals = 6;
      const angle = Math.atan2(ny, nx);
      const radius = Math.sqrt(nx * nx + ny * ny);
      const petalFactor = 0.7 + 0.3 * Math.cos(petals * angle);
      const flowerRadius = 0.75 * petalFactor;
      const center = radius <= 0.25;
      return radius <= flowerRadius || center;
    }

    case 'apple': {
      const ax = nx * 1.1;
      const ay = ny * 1.1 + 0.05;
      const body = ax * ax / 0.5 + (ay + 0.1) * (ay + 0.1) / 0.7 <= 1;
      const stem = ay >= 0.6 && Math.abs(ax) <= 0.08 && ay <= 0.85;
      const leaf = ay >= 0.65 && ax >= 0 && ax <= 0.35 && (ay - 0.65) * (ay - 0.65) + (ax - 0.2) * (ax - 0.2) <= 0.05;
      return body || stem || leaf;
    }

    case 'moon': {
      const outerRadius = 0.85;
      const innerRadius = 0.65;
      const offsetX = 0.25;
      const outer = nx * nx + ny * ny <= outerRadius * outerRadius;
      const inner = (nx - offsetX) * (nx - offsetX) + ny * ny <= innerRadius * innerRadius;
      return outer && !inner;
    }

    default:
      return false;
  }
}

export interface MaskCell {
  x: number;
  y: number;
  inside: boolean;
  region: 'core' | 'edge' | 'outer';
  distanceToEdge: number;
}

export function generateShapeMask(
  shape: ShapeType,
  gridSize: number,
  cellSize: number
): MaskCell[][] {
  const mask: MaskCell[][] = [];

  for (let row = 0; row < gridSize; row++) {
    const rowCells: MaskCell[] = [];
    for (let col = 0; col < gridSize; col++) {
      const cellCenterX = (col + 0.5) / gridSize;
      const cellCenterY = (row + 0.5) / gridSize;
      const inside = isInsideShape(cellCenterX, cellCenterY, shape);

      let minDist = Infinity;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const sampleX = (col + dc + 0.5) / gridSize;
          const sampleY = (row + dr + 0.5) / gridSize;
          if (sampleX >= 0 && sampleX <= 1 && sampleY >= 0 && sampleY <= 1) {
            const sampleInside = isInsideShape(sampleX, sampleY, shape);
            if (sampleInside !== inside) {
              const dist = Math.sqrt(dr * dr + dc * dc);
              minDist = Math.min(minDist, dist);
            }
          }
        }
      }

      let region: 'core' | 'edge' | 'outer' = 'outer';
      if (inside) {
        region = minDist > 1.5 ? 'core' : 'edge';
      }

      rowCells.push({
        x: col * cellSize,
        y: row * cellSize,
        inside,
        region,
        distanceToEdge: minDist,
      });
    }
    mask.push(rowCells);
  }

  return mask;
}

export function getShapeBoundingBox(shape: ShapeType, gridSize: number): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = gridSize;
  let maxX = 0;
  let minY = gridSize;
  let maxY = 0;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cellCenterX = (col + 0.5) / gridSize;
      const cellCenterY = (row + 0.5) / gridSize;
      if (isInsideShape(cellCenterX, cellCenterY, shape)) {
        minX = Math.min(minX, col);
        maxX = Math.max(maxX, col);
        minY = Math.min(minY, row);
        maxY = Math.max(maxY, row);
      }
    }
  }

  return { minX, maxX, minY, maxY };
}
