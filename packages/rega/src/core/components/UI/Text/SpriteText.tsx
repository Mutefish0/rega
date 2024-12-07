import React, { useContext, useMemo, useCallback } from "react";
import BaseText, { ceil, TextChildren } from "./BaseText";
import Sprite2D from "../../Sprite2D";
import Relative from "../../../primitives/Relative";
import BlockContext from "../BlockContext";
import { TextStyle } from "./index";

import BMPFont from "../../../font/BMPFont";

interface SpriteTextProps {
  font: BMPFont;
  children: TextChildren;
  style: TextStyle;
}

export default function SpriteText({ font, children, style }: SpriteTextProps) {
  const { color = "white", fontSize } = style;

  const blockContext = useContext(BlockContext);

  let lineSpacing = 0;

  if (style.lineHeight) {
    lineSpacing = (style.lineHeight - fontSize) / 2;
  }

  const charWidth = useMemo(() => {
    let w = fontSize * font.aspectRatio;
    return ceil(w);
  }, [font.aspectRatio, fontSize]);

  const ha = useCallback(() => charWidth, [charWidth]);

  return (
    <BaseText
      ha={ha}
      style={style}
      renderItem={(code) => {
        const clip = font.getClip(code);

        if (!clip) {
          return null;
        }

        return (
          <Relative translation={{ y: -lineSpacing }}>
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
          </Relative>
        );
      }}
    >
      {children}
    </BaseText>
  );
}
