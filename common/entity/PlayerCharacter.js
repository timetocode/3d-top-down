import nengi from 'nengi'
import WeaponSystem from '../WeaponSystem'
import * as BABYLON from 'babylonjs'

class PlayerCharacter {
    constructor(entity, scene) {
        this.mesh = BABYLON.MeshBuilder.CreateBox('b', { size: 25 })
        this.mesh.entity = this

        const redMaterial = new BABYLON.StandardMaterial('red-material', scene)
        redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0)
        this.mesh.material = redMaterial

        this.x = 0
        this.y = 0
        this.z = 0

        if (entity) {
            Object.assign(this, entity)
        }
        this.y = 0

        this.rotation = 0
        this.hitpoints = 100
        this.isAlive = true

        this.moveDirection = {
            x: 0,
            z: 0
        }
        this.speed = 400
        this.weaponSystem = new WeaponSystem()
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

            // DEAD! come back to life and teleport to a new spot
            setTimeout(() => {
                this.hitpoints = 100
                this.isAlive = 100
                this.x = Math.random() * 500
                this.z = Math.random() * 500
                this.y = 0
            }, 1000)
        }
    }

    fire() {
        if (!this.isAlive) {
            return false
        }

        return this.weaponSystem.fire()
    }

    processMove(command) {
        if (!this.isAlive) {
            return
        }

        this.rotation = command.rotation

        let unitX = 0
        let unitZ = 0

        // create forces from input
        if (command.forward) { unitZ += 1 }
        if (command.backward) { unitZ -= 1 }
        if (command.left) { unitX -= 1 }
        if (command.right) { unitX += 1 }

        // normalize      
        const len = Math.sqrt(unitX * unitX + unitZ * unitZ)
        if (len > 0) {
            unitX = unitX / len
            unitZ = unitZ / len
        }

        this.moveDirection.x = unitX
        this.moveDirection.z = unitZ

    }

    move(delta) {
        this.x += this.moveDirection.x * this.speed * delta
        this.z += this.moveDirection.z * this.speed * delta
    }
}

PlayerCharacter.protocol = {
    x: { type: nengi.Float32, interp: true },
    y: { type: nengi.Float32, interp: true },
    z: { type: nengi.Float32, interp: true },
    rotation: { type: nengi.RotationFloat32, interp: true },
    isAlive: nengi.Boolean,
    hitpoints: nengi.UInt8
}

export default PlayerCharacter
