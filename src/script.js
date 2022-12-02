import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { gsap } from "gsap";

/**
 * Base
 */

// Cursor
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

// Debug
const gui = new dat.GUI({ width: 300 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x424242)

let dpr = window.devicePixelRatio

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
canvas.style.maxWidth = window.innerWidth + "px"
canvas.style.maxHeight = window.innerHeight + "px"

const cw = canvas.width
const ch = canvas.height


/**
 * P5
 */
let fft, audio, toggleBtn, mapBass, mapMid, vColor
const s = (p) => {

    const toggleAudio = () => {
        if (audio.isPlaying()) {
            audio.pause()
            toggleBtn.innerHTML('Play')
        } else {
            audio.play()
            toggleBtn.innerHTML('Stop')
        }
    }

    p.preload = () => {
        audio = p.loadSound('./sound/song2.mp3')
    }

    p.setup = () => {
        toggleBtn = document.querySelector('#toggle-btn')
        toggleBtn.addEventListener('click', () => {
            toggleAudio()
        })

        fft = new p5.FFT()
    }
    
    p.draw =() => {
        fft.analyze()

        const bass    = fft.getEnergy("bass")
        const mid     = fft.getEnergy("mid")
        const treble  = fft.getEnergy("bass")

        mapBass     = p.map(bass, 0, 255, -100, 100)
        mapMid      = p.map(mid, 0, 255, -200, 200)
        vColor  = p.map(treble, 0, 255, 0, 255)
    }
}
new p5(s)


/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(1, 300, 300)
const planeGeometry = new THREE.PlaneGeometry(10, 10, 20, 20)

// Color
debugObject.depthColor = "#d57e43"
debugObject.surfaceColor = "#2bda2e"

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        rez: { value: [cw, ch] },
        mouse: { value: cursor },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector3(4, 4, 4) },
        uBigWavesSpeed: { value: 1.5 },

        u_bass: { value: 0 },
        u_mid: { value: 0 },
        u_treble: { value: 0 },

        uSmallWavesElevation: { value: 0.002 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        // uSurfaceColor: { value: new THREE.Color(0) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },
    },
    side: THREE.DoubleSide,
    // wireframe: true
})
const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x424242,
    side: THREE.DoubleSide,
})


/**
 * GUI
 */
gui.addColor(debugObject, 'depthColor').onChange(() => {
    material.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
    material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})


gui.add(material.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(material.uniforms.uBigWavesFrequency.value, 'z').min(0).max(10).step(0.001).name('uBigWavesFrequencyZ')
gui.add(material.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


gui.add(material.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(material.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(material.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(material.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1).name('uSmallWavesIterations')


gui.add(material.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(material.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')


// Mesh
const mesh = new THREE.Mesh(geometry, material)
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.position.y = -1.5
planeMesh.rotation.x = -Math.PI * 0.5
scene.add(mesh, planeMesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.lookAt(mesh.position)
camera.position.set(0, 5, 8)
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = true
controls.minPolarAngle = Math.PI * 0.25
controls.maxPolarAngle = Math.PI * 0.5


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
pointLight.lookAt(mesh.position)
scene.add(ambientLight, pointLight)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * GSAP
 */
document.querySelector('#start').addEventListener('click', () => {
    gsap.to(camera.position, {
        duration: 2,
        x: -3,
        y: 0,
        z: 3,
        ease: "power3.inOut"
    })
    gsap.to(mesh.rotation, {
        duration: 1,
        x: -3,
        y: 0,
        z: 3,
        ease: "power3.inOut"
    })

    // // // Make the camera move according to the mouse position
    // camera.position.x = -cursor.x * 0.4
    // camera.position.y = cursor.y * 0.4
    // camera.lookAt(mesh.position)
})


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Update controls
    controls.update()
    let elapsedTime = clock.getElapsedTime()

    mesh.rotation.y = elapsedTime * 0.5

    
    material.uniforms.uTime.value = elapsedTime
    material.uniforms.mouse.value = cursor
    material.uniforms.u_bass.value = mapBass
    material.uniforms.u_mid.value = mapMid
    material.uniforms.uDepthColor.value = new THREE.Color(`hsl(${vColor}, 100%, 50%)`)
    material.uniforms.uSurfaceColor.value = new THREE.Color(`hsl(${vColor + 100}, 100%, 50%)`)

    // Render
    renderer.render(scene, camera)
    console.table([mapBass, mapMid, vColor]);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()