import React, { useContext, useCallback, useMemo } from "react";
import Relative from "../../../primitives/Relative";
import BaseText, { TextChildren } from "./BaseText";
import SpriteMSDF from "../../SpriteMSDF";
import BlockContext from "../BlockContext";
import { TextStyle } from "./index";
import MSDFBMFont from "../../../font/MSDFBMFont";

interface SpriteTextProps {
  font: MSDFBMFont;
  children: TextChildren;
  style: TextStyle;
}

export default function MSDFBMText({ font, children, style }: SpriteTextProps) {
  const { color = "white" } = style;

  const blockContext = useContext(BlockContext);

  const scale = style.fontSize / font.fontSize;

  const lineHeight = font.lineHeight * scale;

  let lineSpacing = 0;
  if (style.lineHeight) {
    lineSpacing = (style.lineHeight - lineHeight) / 2;
  }

  const ha = useCallback(
    (code: number) => {
      const glyph = font.getGlyph(code);
      return glyph ? glyph.xadvance * scale : 0;
    },
    [scale]
  );

  const mergedStyle = useMemo(
    () => ({ lineHeight, ...style }),
    [style, lineHeight]
  );

  // geometry size
  // ha, style.lineHeight,
  return (
    <BaseText
      verticalLayoutMethod="top"
      ha={ha}
      style={mergedStyle}
      renderItem={(code) => {
        const glyph = font.getGlyph(code);

        if (!glyph) {
          return null;
        }

        const atlas = font.pages[glyph.page];

        if (!atlas) {
          return null;
        }

        const { x, y, width, height, xoffset, yoffset } = glyph;

        return (
          <Relative
            translation={{
              x: xoffset * scale,
              y: -(yoffset + font.yCorrect) * scale - lineSpacing,
            }}
          >
            <SpriteMSDF
              color={color}
              key={code}
              anchor="top-left"
              clip={[x, y, width, height]}
              atlasTextureId={atlas}
              pxRange={font.pxRange}
              size={[width * scale, height * scale]}
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
