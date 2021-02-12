import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

import './style.css'

const gui = new dat.GUI()

const parameters = {
  background: 0xdddddd,
  floor: 0xdddddd,
  spotLight: 0xffffff,
  hemisphereLight: 0x00000,
  fog: 0xffffff,
}

// Declare canvas and scene
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
scene.background = new THREE.Color(parameters.background)

gui
  .addColor(parameters, 'background')
  .name('background')
  .onChange(() => {
    scene.background.set(parameters.color)
  })

scene.fog = new THREE.Fog(parameters.fog, 200, 900)

const fogFolder = gui.addFolder('Fog')
fogFolder
  .addColor(parameters, 'fog')
  .name('color')
  .onChange(() => {
    scene.fog.color.set(parameters.fog)
  })
fogFolder.add(scene.fog, 'near').step(1).name('near')
fogFolder.add(scene.fog, 'far').step(1).name('far')

const getSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

let size = getSize()

// Declare camera and controls
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  1,
  1000,
)
camera.position.x = -50
camera.position.y = 50
camera.position.z = 300
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableRotate = true
controls.maxPolarAngle = 1.75
controls.minPolarAngle = 1
controls.maxDistance = 500
controls.minDistance = 250

let mouseX = 0
let mouseY = 0

let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2

const onDocumentMouseMove = event => {
  mouseX = (event.clientX - windowHalfX) / 100
  mouseY = (event.clientY - windowHalfY) / 100
}

document.addEventListener('mousemove', onDocumentMouseMove)

// Declare model
const loader = new GLTFLoader()
loader.crossOrigin = true
loader.load('models/scene.gltf', data => {
  const object = data.scene
  object.scale.set(5, 5, 5)
  object.rotation.set(0, 1.75, 0)

  // Center position
  const box3 = new THREE.Box3().setFromObject(object)
  const vector = new THREE.Vector3()
  box3.getCenter(vector)
  object.position.set(-vector.x, -vector.y, 0)

  object.traverse(n => {
    if (n.isMesh) {
      n.castShadow = true
      n.receiveShadow = true
      if (n.material.map) n.material.map.anisotropy = 16
    }
  })

  scene.add(object)
})

// Floor
const geometry = new THREE.PlaneGeometry(500, 500, 1)
const material = new THREE.MeshPhongMaterial({
  color: parameters.floor,
  side: THREE.DoubleSide,
  depthWrite: false,
})
const floor = new THREE.Mesh(geometry, material)
floor.rotation.x = 1.6
floor.position.y = -57
floor.receiveShadow = true
scene.add(floor)

const floorFolder = gui.addFolder('Floor')
floorFolder
  .addColor(parameters, 'floor')
  .name('color')
  .onChange(() => {
    floor.material.color.setHex(parameters.floor)
  })

floorFolder.add(floor.position, 'x').step(1).name('pos x')
floorFolder.add(floor.position, 'y').step(1).name('pos y')
floorFolder.add(floor.position, 'z').step(1).name('pos z')

floorFolder.add(floor.rotation, 'x').step(0.01).name('rot x')
floorFolder.add(floor.rotation, 'y').step(0.01).name('rot y')
floorFolder.add(floor.rotation, 'z').step(0.01).name('rot z')

// Lights
const light = new THREE.SpotLight(parameters.spotLight, 1)
light.position.set(10, 277, 50)
light.angle = 2
light.shadow.radius = 8
light.castShadow = true
light.shadow.bias = -0.0001
light.shadow.mapSize.width = 1024 * 4
light.shadow.mapSize.height = 1024 * 4
scene.add(light)

const spotLightFolder = gui.addFolder('Spot Light')
spotLightFolder
  .addColor(parameters, 'spotLight')
  .name('color')
  .onChange(() => {
    light.color.set(parameters.spotLight)
  })
spotLightFolder.add(light, 'intensity').step(0.01).name('intensity')
spotLightFolder.add(light.position, 'x').step(1).name('pos x')
spotLightFolder.add(light.position, 'y').step(1).name('pos y')
spotLightFolder.add(light.position, 'z').step(1).name('pos z')
spotLightFolder.add(light, 'angle').step(0.01).name('angle')
spotLightFolder.add(light, 'penumbra').step(0.01).name('penumbra')
spotLightFolder.add(light, 'decay').step(0.01).name('decay')
spotLightFolder.add(light, 'distance').step(1).name('distance')
spotLightFolder.add(light.shadow, 'radius').step(1).name('radius')

const lightHelper = new THREE.SpotLightHelper(light)
scene.add(lightHelper)

const hemiLight = new THREE.HemisphereLight(parameters.hemisphereLight, 4)

const hemiLightFolder = gui.addFolder('Hemisphere Light')
hemiLightFolder
  .addColor(parameters, 'hemisphereLight')
  .name('color')
  .onChange(() => {
    hemiLight.color.set(parameters.hemisphereLight)
  })
hemiLightFolder.add(hemiLight, 'intensity').step(0.01).name('intensity')

scene.add(hemiLight)

// Declare render
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2.3
renderer.shadowMap.enabled = true

const resizeRenderer = () => renderer.setSize(size.width, size.height)
const resizePixelRatio = () =>
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const render = () => {
  controls.update()
  // camera.position.x += (mouseX - camera.position.x)
  // camera.position.y += (- mouseY - camera.position.y)
  // camera.lookAt(scene.position)
  renderer.render(scene, camera)
  window.requestAnimationFrame(render)
}
resizeRenderer()
resizePixelRatio()
render()

// Responsive callback
window.addEventListener('resize', () => {
  size = getSize()
  camera.aspect = size.width / size.height
  resizeRenderer()
  resizePixelRatio()
  camera.updateProjectionMatrix()
})
