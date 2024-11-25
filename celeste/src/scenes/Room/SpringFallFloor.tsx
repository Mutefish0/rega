import { useState } from "react";
import Spring from "./Spring";
import FallFloor from "./FallFloor";
import { Relative } from "rega";

export default function SpringFallFloor() {
  const [broken, setBroken] = useState(false);
  const [breaking, setBreaking] = useState(false);

  return (
    <>
      {!broken && (
        <Relative translation={{ y: 8 }}>
          <Spring onShrink={() => setBreaking(true)} />
        </Relative>
      )}
      <FallFloor breaking={breaking} onBroken={() => setBroken(true)} />
    </>
  );
}
