import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { mulberry32 } from './random'

function CelestialSphere() {
  const sphereRef = useRef()
  const ringRef = useRef()
  const outerRingRef = useRef()

  useFrame((_, delta) => {
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.1
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.2
      ringRef.current.rotation.z += delta * 0.15
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x -= delta * 0.1
      outerRingRef.current.rotation.z += delta * 0.12
    }
  })

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={sphereRef} scale={2.2}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#6B21A8"
            emissive="#6B21A8"
            emissiveIntensity={0.3}
            transparent
            opacity={0.85}
            distort={0.25}
            speed={2}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      </Float>

      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.8, 0.04, 32, 64]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
      </mesh>

      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]} scale={0.8}>
        <torusGeometry args={[3.6, 0.02, 16, 64]} />
        <meshBasicMaterial color="#6B21A8" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function Stars({ count = 300 }) {
  const positions = useMemo(() => {
    const rand = mulberry32(0x5EED)
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) pos[i] = (rand() - 0.5) * 40
    return pos
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#F59E0B"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function OrbitingRing() {
  const ref = useRef()
  const count = 12

  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos.push({ angle, radius: 4.2 })
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15
  })

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[Math.cos(p.angle) * p.radius, 0, Math.sin(p.angle) * p.radius]}
          scale={0.06}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function handleContextLost(event) {
  event.preventDefault()
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', handleContextLost)
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, 2]} intensity={0.5} color="#6B21A8" />
        <CelestialSphere />
        <Stars />
        <OrbitingRing />
      </Canvas>
    </div>
  )
}
