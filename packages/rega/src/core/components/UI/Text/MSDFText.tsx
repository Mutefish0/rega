import React, { useContext, useMemo, useCallback } from "react";
import Relative from "../../../primitives/Relative";
import BaseText, { ceil, TextChildren } from "./BaseText";
import SpriteMSDF from "../../SpriteMSDF";
import BlockContext from "../BlockContext";
import { TextStyle } from "./index";
import MSDFFont from "../../../font/MSDFFont";

interface SpriteTextProps {
  font: MSDFFont;
  children: TextChildren;
  style: TextStyle;
}

export default function MSDFText({ font, children, style }: SpriteTextProps) {
  const { color = "white", fontSize } = style;

  const blockContext = useContext(BlockContext);

  const lineHeight = font.lineHeight * fontSize;

  let lineSpacing = 0;

  if (style.lineHeight) {
    lineSpacing = (style.lineHeight - lineHeight) / 2;
  }

  const ha = useCallback(
    (code: number) => {
      const glyph = font.getGlyph(code);
      return glyph ? glyph.advance * fontSize : 0;
    },
    [fontSize]
  );

  const mergedStyle = useMemo(
    () => ({ lineHeight, ...style }),
    [style, lineHeight]
  );

  // geometry size
  // ha, style.lineHeight
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

        const { planeBounds, atlasBounds } = glyph;

        if (!planeBounds || !atlasBounds) {
          return null;
        }

        const { left, right, top, bottom } = planeBounds;

        const width = (right - left) * fontSize;
        const height = (top - bottom) * fontSize;

        return (
          <Relative
            translation={{
              x: left * fontSize,
              y: -lineSpacing - (font.ascender - top) * fontSize,
            }}
          >
            <SpriteMSDF
              color={color}
              key={code}
              anchor="top-left"
              clip={[
                atlasBounds.left,
                font.atlasYOrigin === "bottom"
                  ? font.atlasHeight - atlasBounds.top
                  : atlasBounds.top,
                atlasBounds.right - atlasBounds.left,
                font.atlasYOrigin === "bottom"
                  ? atlasBounds.top - atlasBounds.bottom
                  : atlasBounds.bottom - atlasBounds.top,
              ]}
              atlasTextureId={font.atlasTextureId}
              pxRange={font.pxRange}
              size={[width, height]}
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
