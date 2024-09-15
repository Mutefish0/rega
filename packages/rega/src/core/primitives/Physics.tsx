import React, { ReactNode, useEffect, useMemo, useContext } from "react";
import PhysicsContext, {
  createContextValues,
  PhysicsFrameCallback,
  CollisionItem,
} from "./PhysicsContext";
import useFixedFrame from "../hooks/useFixedFrame";
import rapier, {
  EventQueue,
  ColliderDesc,
  Collider,
  RigidBodyDesc,
  RigidBody,
  SolverFlags,
  Vector,
} from "@dimforge/rapier2d";
import { f64unpackf } from "../tools/data";

interface Props {
  upVector?: Vector;
  children: ReactNode;
  gravity?: Vector;
  minDistance?: number;
  minVelocity?: number;
}

export default React.memo(function Physics({
  children,
  gravity = { x: 0, y: -9.81 },
  upVector = { x: 0, y: 1 },
  minDistance = 0.0001,
  minVelocity = 0.000001,
}: Props) {
  const eventQueue = useMemo(() => new EventQueue(false), []);
  const world = useMemo(() => new rapier.World(gravity), []);

  const colMap = useMemo(
    () => new Map<number, Array<{ handle: number; started: boolean }>>(),
    []
  );

  const ctx = useMemo(() => {
    function createCollider(desc: ColliderDesc, rigidBody?: RigidBody) {
      const collider = world.createCollider(desc, rigidBody);
      return collider;
    }
    function removeCollider(collider: Collider) {
      world.removeCollider(collider, false);
    }
    function getCollider(handle: number) {
      return world.getCollider(handle);
    }
    function createRigidBody(desc: RigidBodyDesc) {
      return world.createRigidBody(desc);
    }
    function removeRigidBody(body: RigidBody) {
      world.removeRigidBody(body);
    }

    function createCharacterController(offset: number) {
      return world.createCharacterController(offset);
    }

    function removeCharacterController(
      controller: rapier.KinematicCharacterController
    ) {
      world.removeCharacterController(controller);
    }

    function getUserData(handle: number) {
      return ctx.eventMap.get(handle)?.getUserData?.();
    }

    return createContextValues({
      upVector,
      createCollider,
      removeCollider,
      getCollider,
      createRigidBody,
      removeRigidBody,
      createCharacterController,
      removeCharacterController,
      minDistance,
      minVelocity,
      getUserData,
      debugRender: () => world.debugRender(),
    });
  }, []);

  useFixedFrame(
    (deltaTime, time) => {
      ctx.beforeFrameCallbacks.forEach((cb) => cb(deltaTime, time, ctx.step));
      ctx.rightBeforeFrameCallbacks.forEach((cb) =>
        cb(deltaTime, time, ctx.step)
      );
      world.timestep = deltaTime / 1000;
      world.step(eventQueue, {
        filterContactPair: () => {
          return SolverFlags.COMPUTE_IMPULSE;
        },
        modifySolverContacts: (h1, h2, v, w, m) => {
          const handler = ctx.eventMap.get(h2)?.modifySolverContacts;

          if (handler) {
            // norm
            const [nx, ny] = f64unpackf(v);
            const [px, py] = f64unpackf(w);
            return handler([nx, ny], [px, py]);
          }

          return true;
        },
        filterIntersectionPair: () => true,
      });
      colMap.clear();
      eventQueue.drainCollisionEvents((handle1, handle2, started) => {
        if (!colMap.has(handle1)) {
          colMap.set(handle1, []);
        }
        colMap.get(handle1)?.push({ handle: handle2, started });
        if (!colMap.has(handle2)) {
          colMap.set(handle2, []);
        }
        colMap.get(handle2)?.push({ handle: handle1, started });
      });
      if (colMap.size > 0) {
        colMap.forEach((colliders, mainHandle) => {
          const c1 = world.getCollider(mainHandle);

          ctx.eventMap.get(mainHandle)?.onCollisionChange?.(
            colliders.map(({ handle, started }) => {
              const c2 = world.getCollider(handle);

              const item: CollisionItem<any> = {
                type: started ? "enter" : "leave",
                userData: ctx.eventMap.get(handle)?.getUserData?.(),
                sendMessage: (msg) => {
                  ctx.colliderLisetenerMap.get(handle)?.(msg);
                },
              };
              c1 &&
                c2 &&
                world.contactPair(c1, c2, (m) => {
                  const localNormal1 = m.localNormal1();
                  const localNormal2 = m.localNormal2();
                  const normal = m.normal();

                  const localContactPoints1 = [];
                  const localContactPoints2 = [];

                  const l = m.numContacts();

                  for (let i = 0; i < l; i++) {
                    const p1 = m.localContactPoint1(i);
                    const p2 = m.localContactPoint2(i);
                    p1 && localContactPoints1.push(p1);
                    p2 && localContactPoints2.push(p2);
                  }

                  const solverContacts: Vector[] = [];
                  const n = m.numSolverContacts();
                  for (let i = 0; i < n; i++) {
                    solverContacts.push(m.solverContactPoint(i)!);
                  }

                  item.contactData = {
                    normal,
                    localNormal1,
                    localNormal2,
                    localContactPoints1,
                    localContactPoints2,
                    solverContacts,
                  };
                });

              return item;
            })
          );
        });
      }
      ctx.step++;
      ctx.time = time;
      ctx.rightAfterFrameCallbacks.forEach((cb) =>
        cb(deltaTime, time, ctx.step)
      );
      ctx.afterFrameCallbacks.forEach((cb) => cb(deltaTime, time, ctx.step));
    },
    [ctx],
    ctx.timeStep
  );

  useEffect(() => {
    return () => {
      world.free();
      eventQueue.free();
      colMap.clear();
      ctx.eventMap.clear();
    };
  }, []);

  return (
    <PhysicsContext.Provider value={ctx}>{children}</PhysicsContext.Provider>
  );
});

export function useBeforePhysicsFrame(
  cb: PhysicsFrameCallback,
  deps: any[] = []
) {
  const ctx = useContext(PhysicsContext);
  useEffect(() => {
    ctx.beforeFrameCallbacks.add(cb);
    return () => {
      ctx.beforeFrameCallbacks.delete(cb);
    };
  }, deps);
}

export function useAfterPhysicsFrame(
  cb: PhysicsFrameCallback,
  deps: any[] = []
) {
  const ctx = useContext(PhysicsContext);
  useEffect(() => {
    ctx.afterFrameCallbacks.add(cb);
    return () => {
      ctx.afterFrameCallbacks.delete(cb);
    };
  }, deps);
}

export function useRightBeforePhysicsFrame(
  cb: PhysicsFrameCallback,
  deps: any[] = []
) {
  const ctx = useContext(PhysicsContext);
  useEffect(() => {
    ctx.rightBeforeFrameCallbacks.add(cb);
    return () => {
      ctx.rightBeforeFrameCallbacks.delete(cb);
    };
  }, deps);
}

export function useRightAfterPhysicsFrame(
  cb: PhysicsFrameCallback,
  deps: any[] = []
) {
  const ctx = useContext(PhysicsContext);
  useEffect(() => {
    ctx.rightAfterFrameCallbacks.add(cb);
    return () => {
      ctx.rightAfterFrameCallbacks.delete(cb);
    };
  }, deps);
}
