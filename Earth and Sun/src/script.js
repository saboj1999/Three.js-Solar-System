import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

const defaultScaleFactor = Math.pow(10, 10) // 10^9 is good too with use of camera views
const AU = 1.5 * Math.pow(10, 11)
const gravitationConstant = -6.67 * Math.pow(10, -11)

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}
const parameters = {
    timeStep: 4320, // 60 -> 1 Simulation hour per 1 Actual second (4320 -> 3 days / 1 second)
    scaleFactor: defaultScaleFactor,
    gravitationalN: 0
}

let timeStep = parameters.timeStep
const defaultTimeStep = parameters.timeStep
let scaleFactor = parameters.scaleFactor
let pauseState = false

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const sunTexture = textureLoader.load('/textures/sun.jpg')
const earthTexture = textureLoader.load('/textures/earth.jpg')

const radiusMod = 1.5
let sunRadius = .95 * radiusMod
let earthRadius = .50 * radiusMod

/**
 * Default Planet Values for Reset
 */
const sunDefaultObject = 
{
    xPosition: 0,
    yPosition: 0,
    zPosition: 0,
    xVelocity: 0,
    yVelocity: 0,
    zVelocity: 0,
    mass: 1.989 * Math.pow(10, 30),
    radius: sunRadius
}
const earthDefaultObject = 
{
    xPosition: AU,
    yPosition: 0,
    zPosition: 0,
    xVelocity: 0,
    yVelocity: 0,//29783 * Math.sin(.8),
    zVelocity: -29783,// * Math.cos(.8),
    mass: 5.972 * Math.pow(10, 24),
    radius: earthRadius
}

/**
 * Helper Axis
 */
const axesHelper = new THREE.AxesHelper(25)
scene.add(axesHelper)
axesHelper.visible = false

/**
 * Plane
 */
const planeGeometry = new THREE.PlaneGeometry(500, 500, 300, 300)
const planeMaterial = new THREE.MeshBasicMaterial(
{
    color:0xffffff, 
    wireframe: true,
    transparent: true,
    opacity: .1
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = - Math.PI / 2
scene.add(plane)
plane.visible =  false

/**
 * Planet Meshes
 */
// Sun
const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32)
const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    emissive: '#FEC829'
})
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
scene.add(sun)

// Earth
const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32)
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

/**
 * Planet Objects
 */
const sunObject = 
{
    mesh: sun,
    xPosition: 0,
    yPosition: 0,
    zPosition: 0,
    xVelocity: 0,
    yVelocity: 0,
    zVelocity: 0,
    mass: 1.989 * Math.pow(10, 30),
    radius: sunRadius,
    default: sunDefaultObject
}
const earthObject = 
{
    mesh: earth,
    xPosition: AU,
    yPosition: 0,
    zPosition: 0,
    xVelocity: 0,
    yVelocity: 0,//29783 * Math.sin(.8),
    zVelocity: -29783,// * Math.cos(.8),
    mass: 5.972 * Math.pow(10, 24),
    radius: earthRadius,
    default: earthDefaultObject
}
earth.position.x = earthObject.xPosition / scaleFactor

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
scene.add(ambientLight)

// gui.add(ambientLight, 'intensity').min(0).max(1).step(.01).name('Ambient Intensity')

const pointLight = new THREE.PointLight(0xfceea7, 1.25)
scene.add(pointLight)

// gui.add(pointLight, 'intensity').min(0).max(1).step(.01).name('Point Intensity')

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

window.addEventListener('keydown', (event) => 
{
    if(event.key == 'h')
    {
        if(gui._hidden)
            gui.show()
        else
            gui.hide()
    }
    if(event.key == 'v')
    {
        if(!plane.visible)
            plane.visible = true
        else
            plane.visible = false
    }
    if(event.key == 'x')
    {
        if(!axesHelper.visible)
            axesHelper.visible = true
        else
            axesHelper.visible = false
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Planets
 */
const planets = [
    sunObject, 
    earthObject
]

// Artifcially update velocities to produce more circular orbits
// const velocityMod = 2.75
// const artificalVelocityMod = () =>
// {
//     for(const planet of planets)
//     {
//         planet.xVelocity *= velocityMod
//         planet.yVelocity *= velocityMod
//         planet.zVelocity *= velocityMod
//     }
// }
// artificalVelocityMod()

const updateRadii = () =>
{
    let ratio = defaultScaleFactor/parameters.scaleFactor
    sun.scale.setScalar(ratio * sunRadius)
    earth.scale.setScalar(ratio * earthRadius)
}

let scaleWithZoom = true
const zoomScale = {scaleWithZoom}

const updatePlanets = () =>
{
    timeStep = parameters.timeStep
    scaleFactor = parameters.scaleFactor


        for(const planetA of planets)
        {
            let nextVX = 0
            let nextVY = 0
            let nextVZ = 0
    
            if(!pauseState)
            {
                for(const planetB of planets)
                {
                    if(planetA != planetB)
                    {
                        const sameBaseDistanceDenominator = 
                            Math.pow(planetA.xPosition - planetB.xPosition, 2)
                            + Math.pow(planetA.yPosition - planetB.yPosition, 2)
                            + Math.pow(planetA.zPosition - planetB.zPosition, 2)

                        const distance = Math.pow(
                            sameBaseDistanceDenominator, 1/2.0)
                        const denominator = Math.pow(
                            sameBaseDistanceDenominator, 3/2.0)

                        const G = gravitationConstant * Math.pow((AU/distance), parameters.gravitationalN)
        
                        nextVX += (G * planetB.mass * (planetA.xPosition - planetB.xPosition)
                        * timeStep) / denominator
                        nextVY += (G * planetB.mass * (planetA.yPosition - planetB.yPosition)
                        * timeStep) / denominator
                        nextVZ += (G * planetB.mass * (planetA.zPosition - planetB.zPosition)
                        * timeStep) / denominator
        
                        planetA.xVelocity += nextVX
                        planetA.yVelocity += nextVY
                        planetA.zVelocity += nextVZ
                    }
                }
                planetA.xPosition += planetA.xVelocity * timeStep
                planetA.yPosition += planetA.yVelocity * timeStep
                planetA.zPosition += planetA.zVelocity * timeStep
            }
            planetA.mesh.position.x = planetA.xPosition / scaleFactor
            planetA.mesh.position.y = planetA.yPosition / scaleFactor
            planetA.mesh.position.z = planetA.zPosition / scaleFactor
        }
        if(zoomScale.scaleWithZoom)
            updateRadii()
}



gui.add(parameters, 'timeStep')
    .min(100)
    .max(100000)
    .step(10)
    .onChange(updatePlanets)
    .name('Time Step')
gui.add(parameters, 'scaleFactor')
    .min(defaultScaleFactor / 20)
    .max(5 * defaultScaleFactor)
    .step(10)
    .onFinishChange(updatePlanets)
    .name("Zoom")
gui.add(zoomScale, 'scaleWithZoom').name('Scale with Zoom')

gui.add(parameters, 'gravitationalN')
    .min(-6)
    .max(6)
    .step(.01)
    .name('Gravitational Modifer')
    .onFinishChange(updatePlanets)

gui.add(axesHelper, 'visible').name('AxesHelper')
gui.add(plane, 'visible').name('Wireframe Plane')


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElaspedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElaspedTime
    oldElaspedTime = elapsedTime
    
    // Update Planets
    updatePlanets()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()