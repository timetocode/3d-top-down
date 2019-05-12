import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import GreenCircle from '../common/entity/GreenCircle'
import Identity from '../common/message/Identity'
import WeaponFired from '../common/message/WeaponFired'

import * as BABYLON from 'babylonjs'
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';

class GameInstance {
    constructor() {
        this.engine = new BABYLON.NullEngine()
        this.scene = new BABYLON.Scene(this.engine)

        this.entities = new Map()

        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        this.instance.onConnect((client, clientData, callback) => {
            //callback({ accepted: false, text: 'Connection denied.'})

            // create a entity for this client
            const entity = new PlayerCharacter()
            this.instance.addEntity(entity) // adding an entity to a nengi instance assigns it an id

            // tell the client which entity it controls (the client will use this to follow it with the camera)
            this.instance.message(new Identity(entity.nid), client)

            entity.x = Math.random() * 1000
            entity.z = Math.random() * 1000
            // establish a relation between this entity and the client
            entity.client = client
            client.entity = entity

            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: entity.x,
                y: entity.y,
                halfWidth: 99999,
                halfHeight: 99999
            }

            this.entities.set(entity.nid, entity)

            callback({ accepted: true, text: 'Welcome!' })
        })

        this.instance.onDisconnect(client => {
            this.instance.removeEntity(client.entity)
            this.entities.delete(client.entity.nid)
        })

        for (var i = 0; i < 25; i++) {
            this.spawnGreenCircle()
        }
    }

    spawnGreenCircle() {
        const green = new GreenCircle({
            x: Math.random() * 1000,
            y: 0,
            z: Math.random() * 1000
        })
        // Order is important for the next two lines
        this.instance.addEntity(green) // assigns an `nid` to green
        this.entities.set(green.nid, green) // uses the `nid` as a key
    }

    update(delta) {
        let cmd = null
        while (cmd = this.instance.getNextCommand()) {
            const tick = cmd.tick
            const client = cmd.client

            for (let i = 0; i < cmd.commands.length; i++) {
                const command = cmd.commands[i]
                const entity = client.entity
                //console.log('command', command)
                if (command.protocol.name === 'MoveCommand') {
                    entity.processMove(command)
                    entity.mesh.computeWorldMatrix(true)
                }

                if (command.protocol.name === 'FireCommand') {
                    if (entity.fire()) {
                        const target = new BABYLON.Vector3(command.x, command.y, command.z)
                        const direction = BABYLON.Vector3.Normalize(target.subtract(entity.mesh.position))

                        const ray = new BABYLON.Ray(entity.mesh.position, direction, 500)
                        const hits = this.scene.multiPickWithRay(ray, (mesh) => {
                            if (mesh.entity === entity) {
                                return false
                            }
                            return true
                        })

                        if (hits) {
                            hits.forEach(hit => {
                                if (hit.pickedMesh) {
                                    if (hit.pickedMesh.entity) {
                                        hit.pickedMesh.entity.takeDamage(100)
                                    }
                                }

                            })
                        }
                        this.instance.addLocalMessage(new WeaponFired(entity.nid, entity.x, entity.y, entity.z, command.x, command.y, command.z))
                    }
                }
            }
        }

        this.entities.forEach(entity => {
            // rather than invoking scene render, we just go through every mesh and recompute the world matrix once per frame
            // no particular reason for doing it this way
            if (entity.mesh) {
                entity.mesh.computeWorldMatrix(true)
            }


            if (entity instanceof GreenCircle) {
                if (!entity.isAlive) {
                    // Order matters for the next 2 lines
                    this.entities.delete(entity.nid)
                    entity.mesh.dispose()
                    this.instance.removeEntity(entity)
                    // respawn after one second
                    setTimeout(() => { this.spawnGreenCircle() }, 1000)
                }
            }
        })

        this.instance.clients.forEach(client => {
            client.view.x = client.entity.x
            client.view.y = client.entity.y

            client.entity.move(delta)
            client.entity.weaponSystem.update(delta)
        })

        // when instance.updates, nengi sends out snapshots to every client
        this.instance.update()
    }
}

export default GameInstance