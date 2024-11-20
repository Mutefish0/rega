import React, { useMemo } from "react";
import OrderContext from "./OrderContext";

interface Props {
  order: number;
  children: React.ReactNode;
}

// @TODO implement relative orders
// order tree !
export default function Order({ order, children }: Props) {
  const ctx = useMemo(() => {
    return {
      order: order,
    };
  }, [order]);

  return <OrderContext.Provider value={ctx}>{children}</OrderContext.Provider>;
}

class SegmentNode {
  range: [number, number];
  children: SegmentNode[] = [];

  constructor(range: [number, number]) {
    this.range = range;
  }

  // insert - find middle
}
