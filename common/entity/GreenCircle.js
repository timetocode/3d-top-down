import nengi from 'nengi'
import * as BABYLON from 'babylonjs'

class GreenCircle {
    constructor(entity, scene) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere('green', { diameter: 25 }, scene)
        this.mesh.entity = this

        const greenMaterial = new BABYLON.StandardMaterial('green-material', scene)
        greenMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0)
        this.mesh.material = greenMaterial

        this.x = 0
        this.y = 0
        this.z = 0

        if (entity) {
            Object.assign(this, entity)
        }

        this.hitpoints = 100
        this.isAlive = true
    }

    get x() { return this.mesh.position.x }
    set x(value) { this.mesh.position.x = value }
    get y() { return this.mesh.position.y }
    set y(value) { this.mesh.position.y = value }
    get z() { return this.mesh.position.z }
    set z(value) { this.mesh.position.z = value }

    takeDamage(amount) {
        if (this.isAlive) {
            this.hitpoints -= amount
        }

        if (this.hitpoints <= 0 && this.isAlive) {
            this.hitpoints = 0
            this.isAlive = false
        }
    }
}

GreenCircle.protocol = {
    x: { type: nengi.Float32, interp: false },
    y: { type: nengi.Float32, interp: false },
    z: { type: nengi.Float32, interp: false },
    hitpoints: nengi.UInt8
}

export default GreenCircle
