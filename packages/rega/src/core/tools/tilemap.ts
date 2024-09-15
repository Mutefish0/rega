import { uniqBy } from "lodash";

type Coord2D = [number, number, ...any[]];

// label - curent label
function moveByLabel([x, y]: Coord2D, label: number): Coord2D {
  if (label === 0) {
    return [x, y + 1, 1];
  } else if (label === 1) {
    return [x + 1, y, 2];
  } else if (label === 2) {
    return [x, y - 1, 3];
  } else if (label === 3) {
    return [x - 1, y, 0];
  } else {
    throw new Error(`Invalid label: ${label}`);
  }
}

export class NeighborMaskBoard {
  private board: Record<string, number> = {};
  // island + mask
  // island > 0 valid island
  private borders: Array<[number, number]> = [];
  private vertics: Array<Array<[number, number, number]>> = [];

  // mask - 8bit neighbor mask
  // 8bit island index
  constructor(
    coords: Coord2D[],
    debugDrawLine?: (p1: Coord2D, p2: Coord2D) => void
  ) {
    // build board masks
    for (let i = 0; i < coords.length; i++) {
      this.setMask(coords[i], 1);
    }
    for (let i = 0; i < coords.length; i++) {
      const [x, y] = coords[i];
      const dirs: Array<[number, number]> = [
        [x - 1, y + 1], // top-left
        [x, y + 1], // top
        [x + 1, y + 1], // top-right
        [x - 1, y], // left
        [x + 1, y], // right
        [x - 1, y - 1], // bottom-left
        [x, y - 1], // bottom
        [x + 1, y - 1], // bottom-right
      ];
      let ret = 0;

      for (let i = 0; i < 8; i++) {
        ret |= this.get(dirs[i]).mask ? 1 << i : 0;
      }

      if (ret < 255) {
        this.borders.push([x, y]);
      }
      this.setMask([x, y], ret);
    }

    // build verticsMap
    const verticsMapDest: Record<string, Set<number>> = {};
    const verticsMapSource: Record<string, Set<number>> = {};

    for (const [x, y] of this.borders) {
      const vertics = this.calcDestVertics([x, y]);
      const sourceVertics = this.calcSourceVertics([x, y]);
      for (const [_x, _y, z] of vertics) {
        const ptr = `${_x}:${_y}`;
        verticsMapDest[ptr] = verticsMapDest[ptr] || new Set();
        verticsMapDest[ptr].add(z);
      }
      for (const [_x, _y, z] of sourceVertics) {
        const ptr = `${_x}:${_y}`;
        verticsMapSource[ptr] = verticsMapSource[ptr] || new Set();
        verticsMapSource[ptr].add(z);
      }
    }

    function findNextPoint(p: Coord2D) {
      const souceLabels = verticsMapSource[`${p[0]}:${p[1]}`];
      for (const sl of souceLabels) {
        const _p = moveByLabel(p, sl);
        const destLabels = verticsMapDest[`${_p[0]}:${_p[1]}`];
        if (destLabels && destLabels.has(_p[2])) {
          return _p;
        }
      }
      return null;
    }

    const startPoints: Record<string, boolean> = {};
    let maxSteps = Object.keys(verticsMapDest).length + 1;

    // find all start point
    for (const key in verticsMapSource) {
      if (verticsMapSource[key].size === 1) {
        startPoints[key] = true;
      }
    }

    while (Object.keys(startPoints).length > 0) {
      const key = Object.keys(startPoints)[0];
      const [x, y] = key.split(":").map(Number);

      let pointer;

      pointer = [x, y, Array.from(verticsMapSource[key])[0]] as Coord2D;

      const vertics: Array<Coord2D> = [pointer];

      let steps = maxSteps;

      while (steps > 0) {
        pointer = findNextPoint(pointer);

        if (!pointer) {
          throw new Error("Invalid path");
        }

        vertics.push(pointer);

        //debugDrawLine?.(vertics[vertics.length - 2], pointer);

        if (pointer[0] === vertics[0][0] && pointer[1] === vertics[0][1]) {
          break;
        }

        steps--;
      }

      // remove start point and resolved vertics
      for (const [x, y] of vertics) {
        delete startPoints[`${x}:${y}`];
      }

      const simplifyVertics: Array<[number, number, number]> = [];
      let lastZ = -1;
      let temp: [number, number, number] | undefined = undefined;
      for (let i = 0; i < vertics.length; i++) {
        const [x, y, z] = vertics[i];
        if (lastZ !== z) {
          if (temp) {
            simplifyVertics.push(temp);
          }
          temp = [x, y, z];
          lastZ = z;
        } else {
          temp = [x, y, z];
        }
      }

      if (temp) {
        simplifyVertics.push(temp);
      }

      this.vertics.push(simplifyVertics);
    }
  }

  get([x, y]: Coord2D) {
    const flags = this.board[`${x}:${y}`];
    const mask = flags & 0xff;
    const island = (flags >> 8) & 0xff;
    return {
      mask,
      island,
    };
  }

  getBorders() {
    return this.borders;
  }

  getNeighbors([x, y]: Coord2D, type: "eight" | "four" = "eight") {
    const { mask } = this.get([x, y]);
    const neighbors =
      type === "four"
        ? [
            [x, y + 1, 1], // top
            [x - 1, y, 3], // left
            [x + 1, y, 4], // right
            [x, y - 1, 6], // bottom
          ]
        : [
            [x - 1, y + 1, 0], // top-left
            [x, y + 1, 1], // top
            [x + 1, y + 1, 2], // top-right
            [x - 1, y, 3], // left
            [x + 1, y, 4], // right
            [x - 1, y - 1, 5], // bottom-left
            [x, y - 1, 6], // bottom
            [x + 1, y - 1, 7], // bottom-right
          ];
    return neighbors.filter(([, , i]) => mask & (1 << i)) as Array<
      [number, number]
    >;
  }

  private setMask([x, y]: Coord2D, mask: number) {
    const v = this.board[`${x}:${y}`];
    this.board[`${x}:${y}`] = ((v >> 8) << 8) + (mask & 0xff);
  }

  private setIsland([x, y]: Coord2D, island: number) {
    const v = this.board[`${x}:${y}`];
    this.board[`${x}:${y}`] = (island << 8) + (v & 0xff);
  }

  isBorder([x, y]: Coord2D) {
    const { mask } = this.get([x, y]);
    return mask && mask < 255;
  }

  /**
   * transition from those vertics
   * [x, y, label]
   * label: clock-wise   0 - bottom-left 1 - top-left 2 - top-right 3 - bottom-right
   */
  private calcSourceVertics([x, y]: Coord2D) {
    const { mask } = this.get([x, y]);
    const hasLeft = mask & (1 << 3);
    const hasRight = mask & (1 << 4);
    const hasTop = mask & (1 << 1);
    const hasBottom = mask & (1 << 6);

    const vertics: Array<[number, number, number]> = [];

    if (!hasLeft) {
      vertics.push([x, y, 0]);
    }
    if (!hasTop) {
      vertics.push([x, y + 1, 1]);
    }
    if (!hasRight) {
      vertics.push([x + 1, y + 1, 2]);
    }
    if (!hasBottom) {
      vertics.push([x + 1, y, 3]);
    }

    return vertics;
  }

  /**
   * transition to those vertics
   * [x, y, label]
   * label: clock-wise   0 - bottom-left 1 - top-left 2 - top-right 3 - bottom-right
   */
  private calcDestVertics([x, y]: Coord2D) {
    const { mask } = this.get([x, y]);
    const hasLeft = mask & (1 << 3);
    const hasRight = mask & (1 << 4);
    const hasTop = mask & (1 << 1);
    const hasBottom = mask & (1 << 6);
    const vertics: Array<[number, number, number]> = [];

    //left
    if (!hasLeft) {
      vertics.push([x, y + 1, 1]);
      //vertics.push([x, y, 0]);
      if (!hasBottom) {
        vertics.push([x, y, 0]);
      }
    }

    // right
    if (!hasRight) {
      vertics.push([x + 1, y, 3]);
      //vertics.push([x + 1, y + 1, 2]);
      if (!hasTop) {
        vertics.push([x + 1, y + 1, 2]);
      }
    }

    // top
    if (!hasTop) {
      vertics.push([x + 1, y + 1, 2]);
      if (!hasLeft) {
        vertics.push([x, y + 1, 1]);
      }
    }

    // bottom
    if (!hasBottom) {
      vertics.push([x, y, 0]);
      if (!hasRight) {
        vertics.push([x + 1, y, 3]);
      }
    }

    return uniqBy(vertics, ([x, y, z]) => `${x}:${y}:${z}`);
  }

  getVertics() {
    return this.vertics;
  }
}
