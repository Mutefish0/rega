import React, { useMemo } from "react";
import { PipelineLayer } from "../render/pass";
import BindingLayer from "./BindingLayer";

interface Props {
  children: React.ReactNode;
  items: Array<{ layer: PipelineLayer }>;
}

export default function EffectScope({ children, items }: Props) {
  const bindingsLayout = useMemo(
    () =>
      items
        .map((item) => item.layer.layout)
        .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
    []
  );

  return (
    <BindingLayer bindingsLayout={bindingsLayout}>{children}</BindingLayer>
  );
}
