import * as BABYLON from 'babylonjs'
import GreenCircle from '../../common/entity/GreenCircle'
import PlayerCharacter from '../../common/entity/PlayerCharacter'


class Renderer {
    constructor() {
        this.canvas = document.getElementById('main-canvas')
        this.engine = new BABYLON.Engine(this.canvas)
       
        this.scene = new BABYLON.Scene(this.engine)
        this.scene.detachControl()
        this.camera = new BABYLON.TargetCamera('camera', new BABYLON.Vector3(0, 500, 0), this.scene)

        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 10000, height: 10000 }, this.scene)
        plane.position.y = -1
        plane.rotation.x = 0.5 * Math.PI

        const mat = new BABYLON.StandardMaterial('mat', this.scene)
        mat.diffuseColor = new BABYLON.Color3(0, 0, 0)
        plane.material = mat

        const light = new BABYLON.HemisphericLight('h', new BABYLON.Vector3(0, 1, 0.5), this.scene)
        light.intensity = 0.8

        this.myId = null
        this.myEntity = null
        this.entities = new Map()


        this.resize()
        window.onresize = () => {
            this.resize()
        }
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    createEntity(entity) {
        // create and add an entity to the renderer
        if (entity.protocol.name === 'PlayerCharacter') {
            const clientEntity = new PlayerCharacter(entity, this.scene)
            this.entities.set(entity.nid, clientEntity)


            // if that entity is ours, save it to myEntity
            if (entity.nid === this.myId) {
                this.myEntity = clientEntity
            }
        }

        if (entity.protocol.name === 'GreenCircle') {
            const clientEntity = new GreenCircle(entity, this.scene)
            this.entities.set(entity.nid, clientEntity)
        }
    }

    updateEntity(update) {
        const entity = this.entities.get(update.nid)
        entity[update.prop] = update.value
    }

    processMessage(message) {
        if (message.protocol.name === 'Identity') {
            this.myId = message.entityId
            console.log('identified as', this.myId)
        }
    }

    deleteEntity(nid) {
        // remove an entity from the renderer
        const entity = this.entities.get(nid)
        if (entity) {
            entity.mesh.dispose()
            this.entities.delete(nid)
        }
    }

    processLocalMessage(message) {
        if (message.protocol.name === 'WeaponFired') {
            this.drawHitscan(message, new BABYLON.Color4(1, 1, 1, 0.5))
        }
    }

    drawHitscan(message, color) {
        // draws a debug line showing a shot
        const origin = new BABYLON.Vector3(message.x, message.y, message.z)
        const target = new BABYLON.Vector3(message.tx, message.ty, message.tz)
        const direction = BABYLON.Vector3.Normalize(target.subtract(origin))
        const ray = new BABYLON.Ray(origin, direction, 500)
        const rh = BABYLON.RayHelper.CreateAndShow(ray, this.scene, color)
        setTimeout(() => {
            rh.dispose()
        }, 64)
    }


    followSmoothlyWithCamera(entity, delta) {
        const cameraSpeed = 16
        const targetX = entity.x
        const targetZ = entity.z
        const dx = targetX - this.camera.position.x
        const dz = targetZ - this.camera.position.z

        this.camera.position.x += dx * cameraSpeed * delta
        this.camera.position.z += dz * cameraSpeed * delta

       // this.camera.position.x = entity.mesh.position.x
       // this.camera.position.z = entity.mesh.position.z
        this.camera.rotation.x = 0.44 * Math.PI
    }

    toWorldCoordinates(mouseX, mouseY) {
        const pickResult = this.scene.pick(mouseX, mouseY)
        if (pickResult && pickResult.pickedPoint) {
            return pickResult.pickedPoint
        }
        return null
    }

    update(delta) {

        if (this.myEntity) {
            //this.centerCamera(this.myEntity)
            this.followSmoothlyWithCamera(this.myEntity, delta)
        }

        this.scene.render()
    }
}

export default Renderer
