import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

import './style.css'

const gui = new dat.GUI()

const parameters = {
  background: 0xf0f0f0,
  floor: 0xff000,
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
  object.position.set(0, 0, 0)
  object.scale.set(5, 5, 5)
  object.rotation.set(0, 1.75, 0)
  scene.add(object)
})

// Floor
const geometry = new THREE.PlaneGeometry(500, 500, 1)
const material = new THREE.MeshBasicMaterial({
  color: parameters.floor,
  side: THREE.DoubleSide,
})
const floor = new THREE.Mesh(geometry, material)
floor.rotation.x = 1.6
floor.position.y = -79
scene.add(floor)

gui
  .addColor(parameters, 'floor')
  .name('floor color')
  .onChange(() => {
    floor.material.color.setHex(parameters.floor)
  })

gui.add(floor.position, 'x').step(1).name('pos x')
gui.add(floor.position, 'y').step(1).name('pos y')
gui.add(floor.position, 'z').step(1).name('pos z')

gui.add(floor.rotation, 'x').step(0.01).name('rot x')
gui.add(floor.rotation, 'y').step(0.01).name('rot y')
gui.add(floor.rotation, 'z').step(0.01).name('rot z')

// Declare render
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
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
