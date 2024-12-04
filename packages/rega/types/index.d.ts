import type { YogaElementProps } from "../src/core/components/YogaFlex/system";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      yoga: YogaElementProps & { children?: React.ReactNode };
      rend: {};
    }
  }
}

export {};
