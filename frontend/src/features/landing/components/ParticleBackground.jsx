import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from './random'

const COLORS = [
  new THREE.Color('#FFD700'),
  new THREE.Color('#D4AF37'),
  new THREE.Color('#9B59B6'),
  new THREE.Color('#8E44AD'),
  new THREE.Color('#3498DB'),
  new THREE.Color('#2980B9'),
]

function ParticleField() {
  const groupRef = useRef()

  const [positions, sizes, colors] = useMemo(() => {
    const rand = mulberry32(0xC0FFEE)
    const pos = new Float32Array(3000 * 3)
    const siz = new Float32Array(3000)
    const col = new Float32Array(3000 * 3)

    for (let i = 0; i < 3000; i++) {
      const radius = Math.cbrt(rand()) * 10
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)

      siz[i] = 0.02 + rand() * 0.08

      const c = COLORS[Math.floor(rand() * COLORS.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return [pos, siz, col]
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06
      groupRef.current.rotation.x += delta * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3000}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={3000}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={3000}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function handleContextLost(event) {
  event.preventDefault()
}

export default function ParticleBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', handleContextLost)
        }}
      >
        <ParticleField />
      </Canvas>
    </div>
  )
}
