class _Mouse {
  constructor(target) {
    this.cursor = [0, 0]
    this.lastCursor = [0, 0]
    this.velocity = [0, 0]
    this.dampedCursor = [.5, .5]

    this.target         = target || window
    this.wheelVelocity  = [0, 0]
    this.wheel          = [0, 0]
    this.lastWheel      = [0, 0]
    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight
    this.isDown = false
    this.wheelDir = null
    this.emitter = {}

    this.preventDamping = true

  }

  initEvents() {
    this.target.addEventListener('touchstart', (event) => { this.onDown(event.touches[0]), { passive: false }})
    this.target.addEventListener('touchend', (event) => { this.onUp(event.touches[0]), { passive: false }})
    this.target.addEventListener('touchmove', (event) => { event.preventDefault(); this.onMouve(event.touches[0]), { passive: false }})

    this.target.addEventListener('mousedown', (event) => { this.onDown(event) })
    this.target.addEventListener('mousemove', (event) => { this.onMouve(event) })
    this.target.addEventListener('mouseup', (event) => { this.onUp(event) })

    this.target.addEventListener('wheel', (event) => { this.onWheel(event) })

    this.target.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth
      this.screenHeight = window.innerHeight
    })

    requestAnimationFrame(this.update.bind(this))
  }

  onDown(event) {
    this.cursor[0] = (event.clientX / this.screenWidth - 0.5) * 2
    this.cursor[1] = (event.clientY / this.screenHeight - 0.5) * 2
    this.lastCursor[0] = this.cursor[0]
    this.lastCursor[1] = this.cursor[1]
    this.isDown = true
  }

  onUp(event) {
    this.isDown = false
  }

  onWheel(event) {
    this.lastWheel[0] = this.wheel[0]
    this.lastWheel[1] = this.wheel[1]
    this.wheel[0] = event.deltaX
    this.wheel[1] = event.deltaY
    this.wheelDir = event.deltaY < 0 ? "up" : "down"
  }

  onMouve(event) {
    this.cursor[0] = (event.clientX / this.screenWidth - 0.5) * 2
    this.cursor[1] = (event.clientY / this.screenHeight - 0.5) * 2
  }

  update() {
    this.velocity[0] = this.cursor[0] - this.lastCursor[0]
    this.velocity[1] = this.cursor[1] - this.lastCursor[1]
    this.wheelVelocity[0] = this.wheel[0] - this.lastWheel[0]
    this.wheelVelocity[1] = this.wheel[1] - this.lastWheel[1]
    this.lastCursor[0] = this.cursor[0]
    this.lastCursor[1] = this.cursor[1]

    requestAnimationFrame(this.update.bind(this))

  }
}

window.Mouse = new _Mouse()
