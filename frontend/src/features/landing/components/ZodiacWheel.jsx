import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Text, MeshDistortMaterial, Environment, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { mulberry32 } from './random'

const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F0D68A'
const PURPLE = '#7C3AED'
const BLUE = '#3B82F6'

const ZODIAC_SIGNS = [
  { symbol: '♈', name: 'Aries', color: '#FF4444' },
  { symbol: '♉', name: 'Taurus', color: '#44BB66' },
  { symbol: '♊', name: 'Gemini', color: '#FFCC00' },
  { symbol: '♋', name: 'Cancer', color: '#AAAAAA' },
  { symbol: '♌', name: 'Leo', color: '#FF8800' },
  { symbol: '♍', name: 'Virgo', color: '#88BB44' },
  { symbol: '♎', name: 'Libra', color: '#FF66AA' },
  { symbol: '♏', name: 'Scorpio', color: '#CC0044' },
  { symbol: '♐', name: 'Sagittarius', color: '#8844FF' },
  { symbol: '♑', name: 'Capricorn', color: '#446688' },
  { symbol: '♒', name: 'Aquarius', color: '#44BBFF' },
  { symbol: '♓', name: 'Pisces', color: '#6644AA' },
]

function GlowRing({ radius, width, color, emissive, opacity = 1 }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, width, 64, 128]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={1.5}
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}

function ZodiacSphere({ sign, index, radius }) {
  const ref = useRef()
  const angle = (index / 12) * Math.PI * 2
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.5 + index) * 0.12
    }
  })

  return (
    <group>
      <mesh ref={ref} position={[x, 0, z]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color={sign.color}
          emissive={sign.color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[x * 1.5, 0.3 + Math.sin(index) * 0.1, z * 1.5]}
        fontSize={0.28}
        color={sign.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {sign.symbol}
      </Text>
    </group>
  )
}

function CentralSphere() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.1
      ref.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.7, 64, 64]} />
        <MeshDistortMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={2}
          metalness={0.4}
          roughness={0.15}
          distort={0.2}
          speed={1.2}
        />
      </mesh>
      <pointLight color={PURPLE} intensity={3} distance={4} decay={1} />
    </group>
  )
}

function OrbitingParticles() {
  const count = 600
  const ref = useRef()
  const [positions, colors] = useMemo(() => {
    const rand = mulberry32(0xA570)
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      const r = 0.5 + rand() * 4.5
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3
      pos[i * 3 + 2] = r * Math.cos(phi)
      const c = new THREE.Color().setHSL(0.1 + rand() * 0.05, 0.8, 0.5 + rand() * 0.4)
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }
    return [pos, cols]
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.03
      ref.current.rotation.x += delta * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors sizeAttenuation transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function LightRays() {
  const ref = useRef()
  const positions = useMemo(() => {
    const rand = mulberry32(0xBE17)
    const pos = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) {
      const angle = rand() * Math.PI * 2
      const r = 0.5 + rand() * 1.5
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = (rand() - 0.5) * 0.5
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.01} color={GOLD} transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

function RingGlow() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.05
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.8, 3.2, 64]} />
      <meshBasicMaterial color={GOLD} transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

function GroundGlow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial
        color={GOLD}
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Scene() {
  const groupRef = useRef()
  const { pointer } = useThree()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (pointer.y * 0.05),
        0.02
      )
    }
  })

  return (
    <group ref={groupRef}>
      <GroundGlow />
      <RingGlow />
      <Float speed={0.8} floatIntensity={0.3} rotationIntensity={0.1}>
        <GlowRing radius={2.2} width={0.05} color={GOLD} emissive={GOLD_LIGHT} />
        <GlowRing radius={2.4} width={0.02} color={GOLD_LIGHT} emissive={GOLD} opacity={0.5} />
      </Float>
      {ZODIAC_SIGNS.map((sign, i) => (
        <ZodiacSphere key={sign.name} sign={sign} index={i} radius={2.2} />
      ))}
      <CentralSphere />
      <OrbitingParticles />
      <LightRays />
      <Sparkles count={50} scale={6} size={0.8} speed={0.3} color={GOLD} opacity={0.4} />
    </group>
  )
}

function handleContextLost(event) {
  event.preventDefault()
}

export default function ZodiacWheel() {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 5.5], fov: 45, near: 0.1, far: 20 }}
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at 40% 40%, #0f0520 0%, #06030a 50%, #000000 100%)',
      }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', handleContextLost)
      }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 4, 3]} intensity={1.5} color={GOLD_LIGHT} />
      <pointLight position={[-3, -1, 4]} intensity={0.8} color={PURPLE} />
      <pointLight position={[0, -3, 2]} intensity={0.5} color={BLUE} />
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={0.8} intensity={0.4} color={GOLD} />
      <Stars radius={12} depth={8} count={2000} factor={4} saturation={0} fade speed={0.5} />
      <Scene />
      <Environment preset="night" />
    </Canvas>
  )
}
