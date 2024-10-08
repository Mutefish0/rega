import { VectorOps, RotationOps } from "../math";
import { RawGenericJoint, RawJointAxis, RawJointType, } from "../raw";
/**
 * An enum grouping all possible types of joints:
 *
 * - `Revolute`: A revolute joint that removes all degrees of freedom between the affected
 *               bodies except for the rotation along one axis.
 * - `Fixed`: A fixed joint that removes all relative degrees of freedom between the affected bodies.
 * - `Prismatic`: A prismatic joint that removes all degrees of freedom between the affected
 *                bodies except for the translation along one axis.
 * - `Spherical`: (3D only) A spherical joint that removes all relative linear degrees of freedom between the affected bodies.
 * - `Generic`: (3D only) A joint with customizable degrees of freedom, allowing any of the 6 axes to be locked.
 */
export var JointType;
(function (JointType) {
    JointType[JointType["Revolute"] = 0] = "Revolute";
    JointType[JointType["Fixed"] = 1] = "Fixed";
    JointType[JointType["Prismatic"] = 2] = "Prismatic";
    JointType[JointType["Rope"] = 3] = "Rope";
    JointType[JointType["Spring"] = 4] = "Spring";
})(JointType || (JointType = {}));
export var MotorModel;
(function (MotorModel) {
    MotorModel[MotorModel["AccelerationBased"] = 0] = "AccelerationBased";
    MotorModel[MotorModel["ForceBased"] = 1] = "ForceBased";
})(MotorModel || (MotorModel = {}));
/**
 * An enum representing the possible joint axes of a generic joint.
 * They can be ORed together, like:
 * JointAxesMask.LinX || JointAxesMask.LinY
 * to get a joint that is only free in the X and Y translational (positional) axes.
 *
 * Possible free axes are:
 *
 * - `X`: X translation axis
 * - `Y`: Y translation axis
 * - `Z`: Z translation axis
 * - `AngX`: X angular rotation axis
 * - `AngY`: Y angular rotations axis
 * - `AngZ`: Z angular rotation axis
 */
export var JointAxesMask;
(function (JointAxesMask) {
    JointAxesMask[JointAxesMask["LinX"] = 1] = "LinX";
    JointAxesMask[JointAxesMask["LinY"] = 2] = "LinY";
    JointAxesMask[JointAxesMask["LinZ"] = 4] = "LinZ";
    JointAxesMask[JointAxesMask["AngX"] = 8] = "AngX";
    JointAxesMask[JointAxesMask["AngY"] = 16] = "AngY";
    JointAxesMask[JointAxesMask["AngZ"] = 32] = "AngZ";
})(JointAxesMask || (JointAxesMask = {}));
export class ImpulseJoint {
    constructor(rawSet, bodySet, handle) {
        this.rawSet = rawSet;
        this.bodySet = bodySet;
        this.handle = handle;
    }
    static newTyped(rawSet, bodySet, handle) {
        switch (rawSet.jointType(handle)) {
            case RawJointType.Revolute:
                return new RevoluteImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Prismatic:
                return new PrismaticImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Fixed:
                return new FixedImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Spring:
                return new SpringImpulseJoint(rawSet, bodySet, handle);
            case RawJointType.Rope:
                return new RopeImpulseJoint(rawSet, bodySet, handle);
            default:
                return new ImpulseJoint(rawSet, bodySet, handle);
        }
    }
    /** @internal */
    finalizeDeserialization(bodySet) {
        this.bodySet = bodySet;
    }
    /**
     * Checks if this joint is still valid (i.e. that it has
     * not been deleted from the joint set yet).
     */
    isValid() {
        return this.rawSet.contains(this.handle);
    }
    /**
     * The first rigid-body this joint it attached to.
     */
    body1() {
        return this.bodySet.get(this.rawSet.jointBodyHandle1(this.handle));
    }
    /**
     * The second rigid-body this joint is attached to.
     */
    body2() {
        return this.bodySet.get(this.rawSet.jointBodyHandle2(this.handle));
    }
    /**
     * The type of this joint given as a string.
     */
    type() {
        return this.rawSet.jointType(this.handle);
    }
    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the application point on the
     * local frame of the first rigid-body it is attached to.
     */
    anchor1() {
        return VectorOps.fromRaw(this.rawSet.jointAnchor1(this.handle));
    }
    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the application point on the
     * local frame of the second rigid-body it is attached to.
     */
    anchor2() {
        return VectorOps.fromRaw(this.rawSet.jointAnchor2(this.handle));
    }
    /**
     * Sets the position of the first anchor of this joint.
     *
     * The first anchor gives the position of the application point on the
     * local frame of the first rigid-body it is attached to.
     */
    setAnchor1(newPos) {
        const rawPoint = VectorOps.intoRaw(newPos);
        this.rawSet.jointSetAnchor1(this.handle, rawPoint);
        rawPoint.free();
    }
    /**
     * Sets the position of the second anchor of this joint.
     *
     * The second anchor gives the position of the application point on the
     * local frame of the second rigid-body it is attached to.
     */
    setAnchor2(newPos) {
        const rawPoint = VectorOps.intoRaw(newPos);
        this.rawSet.jointSetAnchor2(this.handle, rawPoint);
        rawPoint.free();
    }
    /**
     * Controls whether contacts are computed between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    setContactsEnabled(enabled) {
        this.rawSet.jointSetContactsEnabled(this.handle, enabled);
    }
    /**
     * Indicates if contacts are enabled between colliders attached
     * to the rigid-bodies linked by this joint.
     */
    contactsEnabled() {
        return this.rawSet.jointContactsEnabled(this.handle);
    }
}
export class UnitImpulseJoint extends ImpulseJoint {
    /**
     * Are the limits enabled for this joint?
     */
    limitsEnabled() {
        return this.rawSet.jointLimitsEnabled(this.handle, this.rawAxis());
    }
    /**
     * The min limit of this joint.
     */
    limitsMin() {
        return this.rawSet.jointLimitsMin(this.handle, this.rawAxis());
    }
    /**
     * The max limit of this joint.
     */
    limitsMax() {
        return this.rawSet.jointLimitsMax(this.handle, this.rawAxis());
    }
    /**
     * Sets the limits of this joint.
     *
     * @param min - The minimum bound of this joint’s free coordinate.
     * @param max - The maximum bound of this joint’s free coordinate.
     */
    setLimits(min, max) {
        this.rawSet.jointSetLimits(this.handle, this.rawAxis(), min, max);
    }
    configureMotorModel(model) {
        this.rawSet.jointConfigureMotorModel(this.handle, this.rawAxis(), model);
    }
    configureMotorVelocity(targetVel, factor) {
        this.rawSet.jointConfigureMotorVelocity(this.handle, this.rawAxis(), targetVel, factor);
    }
    configureMotorPosition(targetPos, stiffness, damping) {
        this.rawSet.jointConfigureMotorPosition(this.handle, this.rawAxis(), targetPos, stiffness, damping);
    }
    configureMotor(targetPos, targetVel, stiffness, damping) {
        this.rawSet.jointConfigureMotor(this.handle, this.rawAxis(), targetPos, targetVel, stiffness, damping);
    }
}
export class FixedImpulseJoint extends ImpulseJoint {
}
export class RopeImpulseJoint extends ImpulseJoint {
}
export class SpringImpulseJoint extends ImpulseJoint {
}
export class PrismaticImpulseJoint extends UnitImpulseJoint {
    rawAxis() {
        return RawJointAxis.LinX;
    }
}
export class RevoluteImpulseJoint extends UnitImpulseJoint {
    rawAxis() {
        return RawJointAxis.AngX;
    }
}
export class JointData {
    constructor() { }
    /**
     * Creates a new joint descriptor that builds a Fixed joint.
     *
     * A fixed joint removes all the degrees of freedom between the affected bodies, ensuring their
     * anchor and local frames coincide in world-space.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame1 - The reference orientation of the joint wrt. the first rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame2 - The reference orientation of the joint wrt. the second rigid-body.
     */
    static fixed(anchor1, frame1, anchor2, frame2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.frame1 = frame1;
        res.frame2 = frame2;
        res.jointType = JointType.Fixed;
        return res;
    }
    static spring(rest_length, stiffness, damping, anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.length = rest_length;
        res.stiffness = stiffness;
        res.damping = damping;
        res.jointType = JointType.Spring;
        return res;
    }
    static rope(length, anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.length = length;
        res.jointType = JointType.Rope;
        return res;
    }
    // #if DIM2
    /**
     * Create a new joint descriptor that builds revolute joints.
     *
     * A revolute joint allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    static revolute(anchor1, anchor2) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Revolute;
        return res;
    }
    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis - Axis of the joint, expressed in the local-space of the rigid-bodies it is attached to.
     */
    static prismatic(anchor1, anchor2, axis) {
        let res = new JointData();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis = axis;
        res.jointType = JointType.Prismatic;
        return res;
    }
    // #endif
    intoRaw() {
        let rawA1 = VectorOps.intoRaw(this.anchor1);
        let rawA2 = VectorOps.intoRaw(this.anchor2);
        let rawAx;
        let result;
        let limitsEnabled = false;
        let limitsMin = 0.0;
        let limitsMax = 0.0;
        switch (this.jointType) {
            case JointType.Fixed:
                let rawFra1 = RotationOps.intoRaw(this.frame1);
                let rawFra2 = RotationOps.intoRaw(this.frame2);
                result = RawGenericJoint.fixed(rawA1, rawFra1, rawA2, rawFra2);
                rawFra1.free();
                rawFra2.free();
                break;
            case JointType.Spring:
                result = RawGenericJoint.spring(this.length, this.stiffness, this.damping, rawA1, rawA2);
                break;
            case JointType.Rope:
                result = RawGenericJoint.rope(this.length, rawA1, rawA2);
                break;
            case JointType.Prismatic:
                rawAx = VectorOps.intoRaw(this.axis);
                if (!!this.limitsEnabled) {
                    limitsEnabled = true;
                    limitsMin = this.limits[0];
                    limitsMax = this.limits[1];
                }
                // #if DIM2
                result = RawGenericJoint.prismatic(rawA1, rawA2, rawAx, limitsEnabled, limitsMin, limitsMax);
                // #endif
                rawAx.free();
                break;
            // #if DIM2
            case JointType.Revolute:
                result = RawGenericJoint.revolute(rawA1, rawA2);
                break;
            // #endif
        }
        rawA1.free();
        rawA2.free();
        return result;
    }
}
//# sourceMappingURL=impulse_joint.js.map