import * as THREE from 'three'
import './style.css'

// Declare canvas and scene
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

// Declare camera
const getSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
})

let size = getSize()
const camera = new THREE.PerspectiveCamera(75, size.width / size.height)
scene.add(camera)

// Declare render
const renderer = new THREE.WebGLRenderer({ canvas: canvas })

const resizeRenderer = () => renderer.setSize(size.width, size.height)
const resizePixelRatio = () => renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const updateFrame = () => {
  renderer.render(scene, camera)
  window.requestAnimationFrame(updateFrame)
}

resizeRenderer()
resizePixelRatio()
updateFrame()

// Responsive callback
window.addEventListener('resize', () => {
  size = getSize()
  camera.aspect = size.width / size.height
  resizeRenderer()
  resizePixelRatio()
  camera.updateProjectionMatrix()
})
