export type Traversable<T> = {
  children: Traversable<T>[];
} & T;

// 广度优先遍历
export function traverseTreeBFS<T extends any>(
  instance: Traversable<T>,
  cb: (instance: T) => void
) {
  const queue: Traversable<T>[] = [instance];
  while (queue.length > 0) {
    const current = queue.shift()!;
    cb(current);
    queue.push(...current.children);
  }
}

// 后序遍历
export function traverseTreePostDFS<T extends any>(
  instance: Traversable<T>,
  cb: (instance: T) => void
) {
  for (const child of instance.children) {
    traverseTreePostDFS(child, cb);
  }
  cb(instance);
}

// 先序遍历
export function traverseTreePreDFS<T extends any>(
  instance: Traversable<T>,
  cb: (instance: T) => boolean | void
) {
  if (!cb(instance)) {
    if (instance.children) {
      for (const child of instance.children) {
        traverseTreePostDFS(child, cb);
      }
    }
  }
}
