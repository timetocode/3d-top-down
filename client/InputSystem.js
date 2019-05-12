const _pointerLock = element => {
    element.requestPointerLock = element.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock

    element.requestPointerLock()
}


class InputSystem {
    constructor() {
        this.canvasEle = document.getElementById('main-canvas')
        this.onmousemove = null

        this.currentState = {
            w: false,
            s: false,
            a: false,
            d: false,
            r: false,
            mx: 0,
            my: 0,
            mouseDown: false
        }

        this.frameState = {
            w: false,
            s: false,
            a: false,
            d: false,
            r: false,
            mouseDown: false
        }

        // disable right click
        document.addEventListener('contextmenu', event =>
            event.preventDefault()
        )

        document.addEventListener('keydown', event => {
            //console.log('keydown', event)
            // w or up arrow
            if (event.keyCode === 87 || event.keyCode === 38) {
                this.currentState.w = true
                this.frameState.w = true
            }
            // a or left arrow
            if (event.keyCode === 65 || event.keyCode === 37) {
                this.currentState.a = true
                this.frameState.a = true
            }
            // s or down arrow
            if (event.keyCode === 83 || event.keyCode === 40) {
                this.currentState.s = true
                this.frameState.s = true
            }
            // d or right arrow
            if (event.keyCode === 68 || event.keyCode === 39) {
                this.currentState.d = true
                this.frameState.d = true
            }
        })

        document.addEventListener('keyup', event => {
            //console.log('keyup', event)
            if (event.keyCode === 87 || event.keyCode === 38) {
                this.currentState.w = false
            }
            if (event.keyCode === 65 || event.keyCode === 37) {
                this.currentState.a = false
            }
            if (event.keyCode === 83 || event.keyCode === 40) {
                this.currentState.s = false
            }
            if (event.keyCode === 68 || event.keyCode === 39) {
                this.currentState.d = false
            }
        })

        document.addEventListener('mousemove', event => {
            this.currentState.mx = event.clientX
            this.currentState.my = event.clientY
            if (this.onmousemove) {
                this.onmousemove(event)
            }
        })

        document.addEventListener('pointerdown', event => {
            this.currentState.mouseDown = true
            this.frameState.mouseDown = true
            //_pointerLock(this.canvasEle)
        })


        document.addEventListener('mouseup', event => {
            this.currentState.mouseDown = false
        })
    }

    releaseKeys() {
        this.frameState.w = this.currentState.w
        this.frameState.a = this.currentState.a
        this.frameState.s = this.currentState.s
        this.frameState.d = this.currentState.d
        this.frameState.r = this.currentState.r
        this.frameState.mouseDown = this.currentState.mouseDown
    }
}

export default InputSystem
