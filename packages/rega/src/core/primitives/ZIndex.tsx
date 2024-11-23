import React, { useMemo, createContext, useContext, useEffect } from "react";

class SegmentNode {
  zIndex: number;
  public children: SegmentNode[] = [];

  range: [number, number]; // [min, max);

  public zValue: number;

  public ref: number;

  constructor(zIndex: number, range: [number, number]) {
    this.zIndex = zIndex;
    this.range = range;
    this.zValue = range[0];
    this.ref = 1;
  }

  insert(zIndex: number) {
    if (this.children.length === 0) {
      const node = new SegmentNode(zIndex, extractBlock(this.range));
      this.children.push(node);
      return node;
    }

    // @TODO use binary_search
    let prevN: SegmentNode | null = null;

    for (let i = 0; i < this.children.length; i++) {
      const n = this.children[i];
      if (zIndex === n.zIndex) {
        n.ref++;
        return n;
      } else if (zIndex < n.zIndex) {
        // insert
        const left = prevN ? prevN.range[1] : this.range[0];
        const right = n.range[0];
        const node = new SegmentNode(zIndex, extractBlock([left, right]));
        this.children.splice(i, 0, node);
        return node;
      }
      prevN = n;
    }

    const left = prevN!.range[1];
    const right = this.range[1];
    const node = new SegmentNode(zIndex, extractBlock([left, right]));
    this.children.push(node);

    return node;
  }

  // @TODO use binary_search
  removeChild(zIndex: number) {
    for (let i = 0; i < this.children.length; i++) {
      const n = this.children[i];
      if (zIndex === n.zIndex) {
        n.ref--;
        if (n.ref === 0) {
          this.children.splice(i, 1);
        }
      }
    }
  }
}

export const ZIndexContext = createContext({
  node: new SegmentNode(0, [0, 1000000]),
});

interface Props {
  zIndex: number;
  children: React.ReactNode;
}

// @TODO
// 1. binary_search
// 2. more balance
// 3. absolute zIndex / independent roots
export default function ZIndex({ zIndex, children }: Props) {
  const parentCtx = useContext(ZIndexContext);

  const ctx = useMemo(() => {
    const node = parentCtx.node
      ? parentCtx.node.insert(zIndex)
      : new SegmentNode(zIndex, [0, 1000000]);
    return {
      node,
    };
  }, [zIndex]);

  useEffect(() => {
    return () => {
      parentCtx.node.removeChild(zIndex);
    };
  }, []);

  return (
    <ZIndexContext.Provider value={ctx}>{children}</ZIndexContext.Provider>
  );
}

function extractBlock(range: [number, number]): [number, number] {
  const seg = Math.floor((range[1] - range[0]) / 3);

  if (seg < 2) {
    throw new Error("zIndex Inbalance!");
  }

  return [range[0] + seg, range[0] + seg * 2];
}
