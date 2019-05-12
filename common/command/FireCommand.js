import nengi from 'nengi'

class FireCommand {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

FireCommand.protocol = {
    x: nengi.Int32,
    y: nengi.Int32,
    z: nengi.Int32
}

export default FireCommand
