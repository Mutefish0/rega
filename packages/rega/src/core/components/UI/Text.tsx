import SpriteText, { SpriteTextProps } from "./SpriteText";

export type { TextStyle } from "./SpriteText";

export default function Text(props: SpriteTextProps) {
  return <SpriteText {...props} />;
}
