const MAX_SLOTS_PER_GROUP = 900;

const slotMap = {
  target: {
    map: {} as Record<string, number>,
    maxSlot: 0,
  },

  object: {
    map: {} as Record<string, number>,
    maxSlot: 0,
  },

  frame: {
    map: {} as Record<string, number>,
    maxSlot: 0,
  },

  global: {
    map: {} as Record<string, number>,
    maxSlot: 0,
  },
};

function getSlot(
  group: "object" | "target" | "frame" | "global",
  name: string
) {
  const slot = slotMap[group].map[name];
  if (typeof slot === "undefined") {
    throw new Error(`Slot ${name} not found in group ${group}`);
  }
  return slot;
}

function createSlot(
  group: "object" | "target" | "frame" | "global",
  name: string
) {
  const g = slotMap[group];
  if (g.map[name] === undefined) {
    if (g.maxSlot > MAX_SLOTS_PER_GROUP) {
      throw new Error("Too many slots");
    }
    g.map[name] = g.maxSlot;
    g.maxSlot++;
  }
  return g.map[name];
}
