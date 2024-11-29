import React, { useContext, useMemo, useCallback } from "react";
import BaseText, { ceil } from "./BaseText";
import Sprite2D from "../../Sprite2D";
import BlockContext from "../BlockContext";
import { TextStyle } from "./index";

import BMPFont from "../../../font/BMPFont";

interface SpriteTextProps {
  font: BMPFont;
  children: string | number | Array<string | number>;
  style: TextStyle;
}

export default function SpriteText2({
  font,
  children,
  style,
}: SpriteTextProps) {
  const { color = "white", fontSize } = style;

  const blockContext = useContext(BlockContext);

  const charWidth = useMemo(() => {
    let w = fontSize * font.aspectRatio;
    return ceil(w);
  }, [font.aspectRatio, fontSize]);

  const ha = useCallback(() => charWidth, [charWidth]);

  return (
    <BaseText
      verticalLayoutMethod="top"
      ha={ha}
      style={style}
      renderItem={(code) => {
        const clip = font.getClip(code);

        if (!clip) {
          return null;
        }

        return (
          <Sprite2D
            key={code}
            anchor="top-left"
            textureId={font.textureId}
            clip={clip}
            size={[charWidth, fontSize]}
            padding={0.1}
            color={color}
            alphaTextureId={font.textureId}
            opacity={blockContext.opacity}
          />
        );
      }}
    >
      {children}
    </BaseText>
  );
}
