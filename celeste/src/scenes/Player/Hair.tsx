import React, { useMemo, useState } from "react";
import { Box2D, Absolute, useTransform, useAfterPhysicsFrame } from "rega";

interface BoxProps {
  r: { x: number; y: number };
  color: string;
}

function Box1({ r, color }: BoxProps) {
  return (
    <>
      <Absolute translation={{ ...r }}>
        <Box2D size={[3, 1]} color={color} />
        <Box2D size={[1, 3]} color={color} />
      </Absolute>
    </>
  );
}

function Box2({ r, color }: BoxProps) {
  return (
    <>
      <Absolute translation={{ ...r }}>
        <Box2D size={[5, 3]} color={color} />
        <Box2D size={[3, 5]} color={color} />
      </Absolute>
    </>
  );
}

interface Props {
  color: string;
}

export default function Hair({ color }: Props) {
  const t = useTransform();

  const data = useMemo(() => {
    const x = t.transform.translation.x;
    const y = t.transform.translation.y;
    return [
      { x, y, size: 2 },
      { x, y, size: 2 },
      { x, y, size: 1 },
      { x, y, size: 1 },
    ];
  }, []);

  const [list, setList] = useState(data);

  function update(deltaTime: number) {
    let progress = deltaTime / 30; // 5ms

    let lastX = t.transform.translation.x;
    let lastY = t.transform.translation.y;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      row.x += (lastX - row.x) * progress;
      row.y += (lastY - 0.5 - row.y) * progress;
      lastX = row.x;
      lastY = row.y;
      progress *= 0.9;
    }
    setList([...data]);
  }

  useAfterPhysicsFrame((deltaTime) => {
    update(deltaTime);
  }, []);

  return (
    <>
      {list.map((row, i) => {
        if (row.size === 1) {
          return <Box1 key={i} r={row} color={color} />;
        } else {
          return <Box2 key={i} r={row} color={color} />;
        }
      })}
    </>
  );
}
