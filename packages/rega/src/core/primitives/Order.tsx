import React, { useMemo } from "react";
import OrderContext from "./OrderContext";

interface Props {
  order: number;
  children: React.ReactNode;
}

export default function Order({ order, children }: Props) {
  const ctx = useMemo(() => {
    return {
      order: order,
    };
  }, [order]);

  return <OrderContext.Provider value={ctx}>{children}</OrderContext.Provider>;
}
