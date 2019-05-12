import SAT from 'sat'

class CollisionSystem {
    constructor() {
        // TODO load and implement a map with some obstalces
    }

    checkLineCircle(x1, y1, x2, y2, circleCollider) {
        let line = new SAT.Polygon(new SAT.Vector(), [
            new SAT.Vector(x1, y1),
            new SAT.Vector(x2, y2)
        ])
        return SAT.testCirclePolygon(circleCollider, line)
    }
}

export default CollisionSystem
