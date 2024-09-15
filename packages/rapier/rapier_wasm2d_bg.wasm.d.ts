/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function version(a: number): void;
export function __wbg_rawkinematiccharactercontroller_free(a: number): void;
export function rawkinematiccharactercontroller_new(a: number): number;
export function rawkinematiccharactercontroller_setUp(a: number, b: number): void;
export function rawkinematiccharactercontroller_normalNudgeFactor(a: number): number;
export function rawkinematiccharactercontroller_setNormalNudgeFactor(a: number, b: number): void;
export function rawkinematiccharactercontroller_setOffset(a: number, b: number): void;
export function rawkinematiccharactercontroller_slideEnabled(a: number): number;
export function rawkinematiccharactercontroller_setSlideEnabled(a: number, b: number): void;
export function rawkinematiccharactercontroller_autostepMaxHeight(a: number, b: number): void;
export function rawkinematiccharactercontroller_autostepMinWidth(a: number, b: number): void;
export function rawkinematiccharactercontroller_autostepIncludesDynamicBodies(a: number): number;
export function rawkinematiccharactercontroller_autostepEnabled(a: number): number;
export function rawkinematiccharactercontroller_enableAutostep(a: number, b: number, c: number, d: number): void;
export function rawkinematiccharactercontroller_disableAutostep(a: number): void;
export function rawkinematiccharactercontroller_minSlopeSlideAngle(a: number): number;
export function rawkinematiccharactercontroller_setMinSlopeSlideAngle(a: number, b: number): void;
export function rawkinematiccharactercontroller_snapToGroundDistance(a: number, b: number): void;
export function rawkinematiccharactercontroller_enableSnapToGround(a: number, b: number): void;
export function rawkinematiccharactercontroller_disableSnapToGround(a: number): void;
export function rawkinematiccharactercontroller_snapToGroundEnabled(a: number): number;
export function rawkinematiccharactercontroller_computeColliderMovement(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number): void;
export function rawkinematiccharactercontroller_computedMovement(a: number): number;
export function rawkinematiccharactercontroller_computedGrounded(a: number): number;
export function rawkinematiccharactercontroller_numComputedCollisions(a: number): number;
export function rawkinematiccharactercontroller_computedCollision(a: number, b: number, c: number): number;
export function __wbg_rawcharactercollision_free(a: number): void;
export function rawcharactercollision_new(): number;
export function rawcharactercollision_handle(a: number): number;
export function rawcharactercollision_translationDeltaApplied(a: number): number;
export function rawcharactercollision_translationDeltaRemaining(a: number): number;
export function rawcharactercollision_toi(a: number): number;
export function rawcharactercollision_worldWitness1(a: number): number;
export function rawcharactercollision_worldWitness2(a: number): number;
export function rawcharactercollision_worldNormal1(a: number): number;
export function rawcharactercollision_worldNormal2(a: number): number;
export function __wbg_rawccdsolver_free(a: number): void;
export function rawccdsolver_new(): number;
export function rawimpulsejointset_jointType(a: number, b: number): number;
export function rawimpulsejointset_jointBodyHandle1(a: number, b: number): number;
export function rawimpulsejointset_jointBodyHandle2(a: number, b: number): number;
export function rawimpulsejointset_jointFrameX1(a: number, b: number): number;
export function rawimpulsejointset_jointFrameX2(a: number, b: number): number;
export function rawimpulsejointset_jointAnchor1(a: number, b: number): number;
export function rawimpulsejointset_jointAnchor2(a: number, b: number): number;
export function rawimpulsejointset_jointSetAnchor1(a: number, b: number, c: number): void;
export function rawimpulsejointset_jointSetAnchor2(a: number, b: number, c: number): void;
export function rawimpulsejointset_jointContactsEnabled(a: number, b: number): number;
export function rawimpulsejointset_jointSetContactsEnabled(a: number, b: number, c: number): void;
export function rawimpulsejointset_jointLimitsEnabled(a: number, b: number, c: number): number;
export function rawimpulsejointset_jointLimitsMin(a: number, b: number, c: number): number;
export function rawimpulsejointset_jointLimitsMax(a: number, b: number, c: number): number;
export function rawimpulsejointset_jointSetLimits(a: number, b: number, c: number, d: number, e: number): void;
export function rawimpulsejointset_jointConfigureMotorModel(a: number, b: number, c: number, d: number): void;
export function rawimpulsejointset_jointConfigureMotorVelocity(a: number, b: number, c: number, d: number, e: number): void;
export function rawimpulsejointset_jointConfigureMotorPosition(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function rawimpulsejointset_jointConfigureMotor(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function __wbg_rawimpulsejointset_free(a: number): void;
export function rawimpulsejointset_new(): number;
export function rawimpulsejointset_createJoint(a: number, b: number, c: number, d: number, e: number): number;
export function rawimpulsejointset_remove(a: number, b: number, c: number): void;
export function rawimpulsejointset_len(a: number): number;
export function rawimpulsejointset_contains(a: number, b: number): number;
export function rawimpulsejointset_forEachJointHandle(a: number, b: number): void;
export function rawimpulsejointset_forEachJointAttachedToRigidBody(a: number, b: number, c: number): void;
export function __wbg_rawintegrationparameters_free(a: number): void;
export function rawintegrationparameters_new(): number;
export function rawintegrationparameters_dt(a: number): number;
export function rawintegrationparameters_contact_erp(a: number): number;
export function rawintegrationparameters_normalizedPredictionDistance(a: number): number;
export function rawintegrationparameters_numSolverIterations(a: number): number;
export function rawintegrationparameters_numAdditionalFrictionIterations(a: number): number;
export function rawintegrationparameters_numInternalPgsIterations(a: number): number;
export function rawintegrationparameters_maxCcdSubsteps(a: number): number;
export function rawintegrationparameters_set_dt(a: number, b: number): void;
export function rawintegrationparameters_set_contact_natural_frequency(a: number, b: number): void;
export function rawintegrationparameters_set_normalizedAllowedLinearError(a: number, b: number): void;
export function rawintegrationparameters_set_normalizedPredictionDistance(a: number, b: number): void;
export function rawintegrationparameters_set_numSolverIterations(a: number, b: number): void;
export function rawintegrationparameters_set_numAdditionalFrictionIterations(a: number, b: number): void;
export function rawintegrationparameters_set_numInternalPgsIterations(a: number, b: number): void;
export function rawintegrationparameters_set_minIslandSize(a: number, b: number): void;
export function rawintegrationparameters_set_maxCcdSubsteps(a: number, b: number): void;
export function rawintegrationparameters_set_lengthUnit(a: number, b: number): void;
export function rawintegrationparameters_switchToStandardPgsSolver(a: number): void;
export function rawintegrationparameters_switchToSmallStepsPgsSolver(a: number): void;
export function rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart(a: number): void;
export function __wbg_rawislandmanager_free(a: number): void;
export function rawislandmanager_new(): number;
export function rawislandmanager_forEachActiveRigidBodyHandle(a: number, b: number): void;
export function __wbg_rawgenericjoint_free(a: number): void;
export function rawgenericjoint_spring(a: number, b: number, c: number, d: number, e: number): number;
export function rawgenericjoint_rope(a: number, b: number, c: number): number;
export function rawgenericjoint_prismatic(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawgenericjoint_fixed(a: number, b: number, c: number, d: number): number;
export function rawgenericjoint_revolute(a: number, b: number): number;
export function rawmultibodyjointset_jointType(a: number, b: number): number;
export function rawmultibodyjointset_jointFrameX1(a: number, b: number): number;
export function rawmultibodyjointset_jointFrameX2(a: number, b: number): number;
export function rawmultibodyjointset_jointAnchor1(a: number, b: number): number;
export function rawmultibodyjointset_jointAnchor2(a: number, b: number): number;
export function rawmultibodyjointset_jointContactsEnabled(a: number, b: number): number;
export function rawmultibodyjointset_jointSetContactsEnabled(a: number, b: number, c: number): void;
export function rawmultibodyjointset_jointLimitsEnabled(a: number, b: number, c: number): number;
export function rawmultibodyjointset_jointLimitsMin(a: number, b: number, c: number): number;
export function rawmultibodyjointset_jointLimitsMax(a: number, b: number, c: number): number;
export function __wbg_rawmultibodyjointset_free(a: number): void;
export function rawmultibodyjointset_new(): number;
export function rawmultibodyjointset_createJoint(a: number, b: number, c: number, d: number, e: number): number;
export function rawmultibodyjointset_remove(a: number, b: number, c: number): void;
export function rawmultibodyjointset_contains(a: number, b: number): number;
export function rawmultibodyjointset_forEachJointHandle(a: number, b: number): void;
export function rawmultibodyjointset_forEachJointAttachedToRigidBody(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbTranslation(a: number, b: number): number;
export function rawrigidbodyset_rbRotation(a: number, b: number): number;
export function rawrigidbodyset_rbSleep(a: number, b: number): void;
export function rawrigidbodyset_rbIsSleeping(a: number, b: number): number;
export function rawrigidbodyset_rbIsMoving(a: number, b: number): number;
export function rawrigidbodyset_rbNextTranslation(a: number, b: number): number;
export function rawrigidbodyset_rbNextRotation(a: number, b: number): number;
export function rawrigidbodyset_rbSetTranslation(a: number, b: number, c: number, d: number, e: number): void;
export function rawrigidbodyset_rbSetRotation(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetLinvel(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetAngvel(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetNextKinematicTranslation(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetNextKinematicRotation(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbRecomputeMassPropertiesFromColliders(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbSetAdditionalMass(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetAdditionalMassProperties(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function rawrigidbodyset_rbLinvel(a: number, b: number): number;
export function rawrigidbodyset_rbAngvel(a: number, b: number): number;
export function rawrigidbodyset_rbLockTranslations(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbSetEnabledTranslations(a: number, b: number, c: number, d: number, e: number): void;
export function rawrigidbodyset_rbLockRotations(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbDominanceGroup(a: number, b: number): number;
export function rawrigidbodyset_rbSetDominanceGroup(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbEnableCcd(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbSetSoftCcdPrediction(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbMass(a: number, b: number): number;
export function rawrigidbodyset_rbInvMass(a: number, b: number): number;
export function rawrigidbodyset_rbEffectiveInvMass(a: number, b: number): number;
export function rawrigidbodyset_rbLocalCom(a: number, b: number): number;
export function rawrigidbodyset_rbWorldCom(a: number, b: number): number;
export function rawrigidbodyset_rbInvPrincipalInertiaSqrt(a: number, b: number): number;
export function rawrigidbodyset_rbPrincipalInertia(a: number, b: number): number;
export function rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt(a: number, b: number): number;
export function rawrigidbodyset_rbEffectiveAngularInertia(a: number, b: number): number;
export function rawrigidbodyset_rbWakeUp(a: number, b: number): void;
export function rawrigidbodyset_rbIsCcdEnabled(a: number, b: number): number;
export function rawrigidbodyset_rbSoftCcdPrediction(a: number, b: number): number;
export function rawrigidbodyset_rbNumColliders(a: number, b: number): number;
export function rawrigidbodyset_rbCollider(a: number, b: number, c: number): number;
export function rawrigidbodyset_rbBodyType(a: number, b: number): number;
export function rawrigidbodyset_rbSetBodyType(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbIsFixed(a: number, b: number): number;
export function rawrigidbodyset_rbIsKinematic(a: number, b: number): number;
export function rawrigidbodyset_rbIsDynamic(a: number, b: number): number;
export function rawrigidbodyset_rbLinearDamping(a: number, b: number): number;
export function rawrigidbodyset_rbAngularDamping(a: number, b: number): number;
export function rawrigidbodyset_rbSetLinearDamping(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbSetAngularDamping(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbSetEnabled(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbIsEnabled(a: number, b: number): number;
export function rawrigidbodyset_rbGravityScale(a: number, b: number): number;
export function rawrigidbodyset_rbSetGravityScale(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbResetForces(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbResetTorques(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbAddForce(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbApplyImpulse(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbAddTorque(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbApplyTorqueImpulse(a: number, b: number, c: number, d: number): void;
export function rawrigidbodyset_rbAddForceAtPoint(a: number, b: number, c: number, d: number, e: number): void;
export function rawrigidbodyset_rbApplyImpulseAtPoint(a: number, b: number, c: number, d: number, e: number): void;
export function rawrigidbodyset_rbAdditionalSolverIterations(a: number, b: number): number;
export function rawrigidbodyset_rbSetAdditionalSolverIterations(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbUserData(a: number, b: number): number;
export function rawrigidbodyset_rbSetUserData(a: number, b: number, c: number): void;
export function rawrigidbodyset_rbUserForce(a: number, b: number): number;
export function rawrigidbodyset_rbUserTorque(a: number, b: number): number;
export function __wbg_rawrigidbodyset_free(a: number): void;
export function rawrigidbodyset_new(): number;
export function rawrigidbodyset_createRigidBody(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number): number;
export function rawrigidbodyset_remove(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function rawrigidbodyset_contains(a: number, b: number): number;
export function rawrigidbodyset_forEachRigidBodyHandle(a: number, b: number): void;
export function rawrigidbodyset_propagateModifiedBodyPositionsToColliders(a: number, b: number): void;
export function __wbg_rawbroadphase_free(a: number): void;
export function rawbroadphase_new(): number;
export function rawcolliderset_coTranslation(a: number, b: number): number;
export function rawcolliderset_coRotation(a: number, b: number): number;
export function rawcolliderset_coSetTranslation(a: number, b: number, c: number, d: number): void;
export function rawcolliderset_coSetTranslationWrtParent(a: number, b: number, c: number, d: number): void;
export function rawcolliderset_coSetRotation(a: number, b: number, c: number): void;
export function rawcolliderset_coSetRotationWrtParent(a: number, b: number, c: number): void;
export function rawcolliderset_coIsSensor(a: number, b: number): number;
export function rawcolliderset_coShapeType(a: number, b: number): number;
export function rawcolliderset_coHalfspaceNormal(a: number, b: number): number;
export function rawcolliderset_coHalfExtents(a: number, b: number): number;
export function rawcolliderset_coSetHalfExtents(a: number, b: number, c: number): void;
export function rawcolliderset_coRadius(a: number, b: number, c: number): void;
export function rawcolliderset_coSetRadius(a: number, b: number, c: number): void;
export function rawcolliderset_coHalfHeight(a: number, b: number, c: number): void;
export function rawcolliderset_coSetHalfHeight(a: number, b: number, c: number): void;
export function rawcolliderset_coRoundRadius(a: number, b: number, c: number): void;
export function rawcolliderset_coSetRoundRadius(a: number, b: number, c: number): void;
export function rawcolliderset_coVertices(a: number, b: number, c: number): void;
export function rawcolliderset_coIndices(a: number, b: number, c: number): void;
export function rawcolliderset_coTriMeshFlags(a: number, b: number, c: number): void;
export function rawcolliderset_coHeightfieldHeights(a: number, b: number, c: number): void;
export function rawcolliderset_coHeightfieldScale(a: number, b: number): number;
export function rawcolliderset_coParent(a: number, b: number, c: number): void;
export function rawcolliderset_coSetEnabled(a: number, b: number, c: number): void;
export function rawcolliderset_coIsEnabled(a: number, b: number): number;
export function rawcolliderset_coSetContactSkin(a: number, b: number, c: number): void;
export function rawcolliderset_coContactSkin(a: number, b: number): number;
export function rawcolliderset_coFriction(a: number, b: number): number;
export function rawcolliderset_coRestitution(a: number, b: number): number;
export function rawcolliderset_coDensity(a: number, b: number): number;
export function rawcolliderset_coMass(a: number, b: number): number;
export function rawcolliderset_coVolume(a: number, b: number): number;
export function rawcolliderset_coCollisionGroups(a: number, b: number): number;
export function rawcolliderset_coSolverGroups(a: number, b: number): number;
export function rawcolliderset_coActiveHooks(a: number, b: number): number;
export function rawcolliderset_coActiveCollisionTypes(a: number, b: number): number;
export function rawcolliderset_coActiveEvents(a: number, b: number): number;
export function rawcolliderset_coContactForceEventThreshold(a: number, b: number): number;
export function rawcolliderset_coContainsPoint(a: number, b: number, c: number): number;
export function rawcolliderset_coCastShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number): number;
export function rawcolliderset_coCastCollider(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number): number;
export function rawcolliderset_coIntersectsShape(a: number, b: number, c: number, d: number, e: number): number;
export function rawcolliderset_coContactShape(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawcolliderset_coContactCollider(a: number, b: number, c: number, d: number): number;
export function rawcolliderset_coProjectPoint(a: number, b: number, c: number, d: number): number;
export function rawcolliderset_coIntersectsRay(a: number, b: number, c: number, d: number, e: number): number;
export function rawcolliderset_coCastRay(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawcolliderset_coCastRayAndGetNormal(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawcolliderset_coSetSensor(a: number, b: number, c: number): void;
export function rawcolliderset_coSetRestitution(a: number, b: number, c: number): void;
export function rawcolliderset_coSetFriction(a: number, b: number, c: number): void;
export function rawcolliderset_coFrictionCombineRule(a: number, b: number): number;
export function rawcolliderset_coSetFrictionCombineRule(a: number, b: number, c: number): void;
export function rawcolliderset_coRestitutionCombineRule(a: number, b: number): number;
export function rawcolliderset_coSetRestitutionCombineRule(a: number, b: number, c: number): void;
export function rawcolliderset_coSetCollisionGroups(a: number, b: number, c: number): void;
export function rawcolliderset_coSetSolverGroups(a: number, b: number, c: number): void;
export function rawcolliderset_coSetActiveHooks(a: number, b: number, c: number): void;
export function rawcolliderset_coSetActiveEvents(a: number, b: number, c: number): void;
export function rawcolliderset_coSetActiveCollisionTypes(a: number, b: number, c: number): void;
export function rawcolliderset_coSetShape(a: number, b: number, c: number): void;
export function rawcolliderset_coSetContactForceEventThreshold(a: number, b: number, c: number): void;
export function rawcolliderset_coSetDensity(a: number, b: number, c: number): void;
export function rawcolliderset_coSetMass(a: number, b: number, c: number): void;
export function rawcolliderset_coSetMassProperties(a: number, b: number, c: number, d: number, e: number): void;
export function __wbg_rawcolliderset_free(a: number): void;
export function rawcolliderset_new(): number;
export function rawcolliderset_len(a: number): number;
export function rawcolliderset_contains(a: number, b: number): number;
export function rawcolliderset_createCollider(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number): void;
export function rawcolliderset_remove(a: number, b: number, c: number, d: number, e: number): void;
export function rawcolliderset_forEachColliderHandle(a: number, b: number): void;
export function __wbg_rawshapecontact_free(a: number): void;
export function __wbg_rawnarrowphase_free(a: number): void;
export function rawnarrowphase_new(): number;
export function rawnarrowphase_contact_pairs_with(a: number, b: number, c: number): void;
export function rawnarrowphase_contact_pair(a: number, b: number, c: number): number;
export function rawnarrowphase_intersection_pairs_with(a: number, b: number, c: number): void;
export function rawnarrowphase_intersection_pair(a: number, b: number, c: number): number;
export function __wbg_rawcontactmanifold_free(a: number): void;
export function rawcontactpair_collider1(a: number): number;
export function rawcontactpair_collider2(a: number): number;
export function rawcontactpair_numContactManifolds(a: number): number;
export function rawcontactpair_contactManifold(a: number, b: number): number;
export function rawcontactmanifold_normal(a: number): number;
export function rawcontactmanifold_local_n1(a: number): number;
export function rawcontactmanifold_local_n2(a: number): number;
export function rawcontactmanifold_subshape1(a: number): number;
export function rawcontactmanifold_subshape2(a: number): number;
export function rawcontactmanifold_num_contacts(a: number): number;
export function rawcontactmanifold_contact_local_p1(a: number, b: number): number;
export function rawcontactmanifold_contact_local_p2(a: number, b: number): number;
export function rawcontactmanifold_contact_dist(a: number, b: number): number;
export function rawcontactmanifold_contact_fid1(a: number, b: number): number;
export function rawcontactmanifold_contact_fid2(a: number, b: number): number;
export function rawcontactmanifold_contact_impulse(a: number, b: number): number;
export function rawcontactmanifold_contact_tangent_impulse(a: number, b: number): number;
export function rawcontactmanifold_num_solver_contacts(a: number): number;
export function rawcontactmanifold_solver_contact_point(a: number, b: number): number;
export function rawcontactmanifold_solver_contact_dist(a: number, b: number): number;
export function rawcontactmanifold_solver_contact_friction(a: number, b: number): number;
export function rawcontactmanifold_solver_contact_restitution(a: number, b: number): number;
export function rawcontactmanifold_solver_contact_tangent_velocity(a: number, b: number): number;
export function __wbg_rawpointprojection_free(a: number): void;
export function rawpointprojection_point(a: number): number;
export function rawpointprojection_isInside(a: number): number;
export function __wbg_rawpointcolliderprojection_free(a: number): void;
export function rawpointcolliderprojection_colliderHandle(a: number): number;
export function rawpointcolliderprojection_point(a: number): number;
export function rawpointcolliderprojection_isInside(a: number): number;
export function rawpointcolliderprojection_featureType(a: number): number;
export function rawpointcolliderprojection_featureId(a: number, b: number): void;
export function __wbg_rawrayintersection_free(a: number): void;
export function __wbg_rawshape_free(a: number): void;
export function rawshape_cuboid(a: number, b: number): number;
export function rawshape_roundCuboid(a: number, b: number, c: number): number;
export function rawshape_ball(a: number): number;
export function rawshape_halfspace(a: number): number;
export function rawshape_capsule(a: number, b: number): number;
export function rawshape_polyline(a: number, b: number, c: number, d: number): number;
export function rawshape_trimesh(a: number, b: number, c: number, d: number, e: number): number;
export function rawshape_heightfield(a: number, b: number, c: number): number;
export function rawshape_segment(a: number, b: number): number;
export function rawshape_triangle(a: number, b: number, c: number): number;
export function rawshape_roundTriangle(a: number, b: number, c: number, d: number): number;
export function rawshape_convexHull(a: number, b: number): number;
export function rawshape_convexDecomposition(a: number, b: number, c: number, d: number): number;
export function rawshape_compound(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawshape_roundConvexHull(a: number, b: number, c: number): number;
export function rawshape_convexPolyline(a: number, b: number): number;
export function rawshape_roundConvexPolyline(a: number, b: number, c: number): number;
export function rawshape_castShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number): number;
export function rawshape_intersectsShape(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawshape_contactShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function rawshape_containsPoint(a: number, b: number, c: number, d: number): number;
export function rawshape_projectPoint(a: number, b: number, c: number, d: number, e: number): number;
export function rawshape_intersectsRay(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rawshape_castRay(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function rawshape_castRayAndGetNormal(a: number, b: number, c: number, d: number, e: number, f: number, g: number): number;
export function rawshapecasthit_witness1(a: number): number;
export function __wbg_rawcollidershapecasthit_free(a: number): void;
export function rawcollidershapecasthit_colliderHandle(a: number): number;
export function rawcollidershapecasthit_time_of_impact(a: number): number;
export function rawcollidershapecasthit_witness1(a: number): number;
export function rawcollidershapecasthit_witness2(a: number): number;
export function rawcollidershapecasthit_normal1(a: number): number;
export function rawcollidershapecasthit_normal2(a: number): number;
export function __wbg_rawrotation_free(a: number): void;
export function rawrotation_identity(): number;
export function rawrotation_fromAngle(a: number): number;
export function rawrotation_re(a: number): number;
export function rawrotation_angle(a: number): number;
export function __wbg_rawvector_free(a: number): void;
export function rawvector_zero(): number;
export function rawvector_new(a: number, b: number): number;
export function rawvector_set_x(a: number, b: number): void;
export function rawvector_xy(a: number): number;
export function rawvector_yx(a: number): number;
export function __wbg_rawdebugrenderpipeline_free(a: number): void;
export function rawdebugrenderpipeline_new(): number;
export function rawdebugrenderpipeline_vertices(a: number): number;
export function rawdebugrenderpipeline_colors(a: number): number;
export function rawdebugrenderpipeline_render(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function __wbg_raweventqueue_free(a: number): void;
export function __wbg_rawcontactforceevent_free(a: number): void;
export function rawcontactforceevent_collider2(a: number): number;
export function rawcontactforceevent_total_force(a: number): number;
export function rawcontactforceevent_total_force_magnitude(a: number): number;
export function rawcontactforceevent_max_force_magnitude(a: number): number;
export function raweventqueue_new(a: number): number;
export function raweventqueue_drainCollisionEvents(a: number, b: number): void;
export function raweventqueue_drainContactForceEvents(a: number, b: number): void;
export function raweventqueue_clear(a: number): void;
export function __wbg_rawphysicspipeline_free(a: number): void;
export function rawphysicspipeline_new(): number;
export function rawphysicspipeline_step(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number): void;
export function rawphysicspipeline_stepWithEvents(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number): void;
export function rawquerypipeline_new(): number;
export function rawquerypipeline_update(a: number, b: number): void;
export function rawquerypipeline_castRay(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number): number;
export function rawquerypipeline_castRayAndGetNormal(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number): number;
export function rawquerypipeline_intersectionsWithRay(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number): void;
export function rawquerypipeline_intersectionWithShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number): void;
export function rawquerypipeline_projectPoint(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number): number;
export function rawquerypipeline_projectPointAndGetFeature(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number): number;
export function rawquerypipeline_intersectionsWithPoint(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number): void;
export function rawquerypipeline_castShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number): number;
export function rawquerypipeline_intersectionsWithShape(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number): void;
export function rawquerypipeline_collidersWithAabbIntersectingAabb(a: number, b: number, c: number, d: number): void;
export function __wbg_rawdeserializedworld_free(a: number): void;
export function rawdeserializedworld_takeGravity(a: number): number;
export function rawdeserializedworld_takeIntegrationParameters(a: number): number;
export function rawdeserializedworld_takeIslandManager(a: number): number;
export function rawdeserializedworld_takeBroadPhase(a: number): number;
export function rawdeserializedworld_takeNarrowPhase(a: number): number;
export function rawdeserializedworld_takeBodies(a: number): number;
export function rawdeserializedworld_takeColliders(a: number): number;
export function rawdeserializedworld_takeImpulseJoints(a: number): number;
export function rawdeserializedworld_takeMultibodyJoints(a: number): number;
export function rawserializationpipeline_new(): number;
export function rawserializationpipeline_serializeAll(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number): number;
export function rawserializationpipeline_deserializeAll(a: number, b: number): number;
export function rawkinematiccharactercontroller_offset(a: number): number;
export function rawkinematiccharactercontroller_maxSlopeClimbAngle(a: number): number;
export function rawintegrationparameters_minIslandSize(a: number): number;
export function rawrigidbodyset_len(a: number): number;
export function rawshapecontact_distance(a: number): number;
export function rawrayintersection_featureType(a: number): number;
export function rawraycolliderintersection_colliderHandle(a: number): number;
export function rawrayintersection_time_of_impact(a: number): number;
export function rawraycolliderintersection_featureType(a: number): number;
export function rawraycolliderintersection_time_of_impact(a: number): number;
export function rawraycolliderhit_colliderHandle(a: number): number;
export function rawraycolliderhit_timeOfImpact(a: number): number;
export function rawrotation_im(a: number): number;
export function rawshapecasthit_time_of_impact(a: number): number;
export function rawvector_x(a: number): number;
export function rawvector_y(a: number): number;
export function rawcontactforceevent_collider1(a: number): number;
export function rawintegrationparameters_lengthUnit(a: number): number;
export function rawintegrationparameters_normalizedAllowedLinearError(a: number): number;
export function rawcolliderset_isHandleValid(a: number, b: number): number;
export function rawshapecontact_normal2(a: number): number;
export function rawshapecontact_point1(a: number): number;
export function rawshapecontact_point2(a: number): number;
export function rawrayintersection_normal(a: number): number;
export function rawshapecasthit_witness2(a: number): number;
export function rawraycolliderintersection_normal(a: number): number;
export function rawshapecasthit_normal1(a: number): number;
export function rawshapecasthit_normal2(a: number): number;
export function rawkinematiccharactercontroller_up(a: number): number;
export function rawshapecontact_normal1(a: number): number;
export function rawcontactforceevent_max_force_direction(a: number): number;
export function rawkinematiccharactercontroller_setMaxSlopeClimbAngle(a: number, b: number): void;
export function rawvector_set_y(a: number, b: number): void;
export function __wbg_rawcontactpair_free(a: number): void;
export function __wbg_rawraycolliderintersection_free(a: number): void;
export function __wbg_rawraycolliderhit_free(a: number): void;
export function __wbg_rawshapecasthit_free(a: number): void;
export function __wbg_rawserializationpipeline_free(a: number): void;
export function rawrayintersection_featureId(a: number, b: number): void;
export function rawraycolliderintersection_featureId(a: number, b: number): void;
export function __wbg_rawquerypipeline_free(a: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_exn_store(a: number): void;
