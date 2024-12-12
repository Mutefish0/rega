const MAX_SLOTS_PER_GROUP = 900;

export interface SlotGroup {
  map: Record<string, number>;
  maxSlot: 0;
}

export function getOrcreateSlot(group: SlotGroup, name: string) {
  if (group.map[name] === undefined) {
    if (group.maxSlot > MAX_SLOTS_PER_GROUP) {
      throw new Error("Too many slots");
    }
    group.map[name] = group.maxSlot;
    group.maxSlot++;
  }
  return group.map[name];
}
