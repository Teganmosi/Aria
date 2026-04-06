import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import PropTypes from 'prop-types'

// Seeded random for consistent results
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Premium animated starfield with depth
function StarField() {
  const starsRef = useRef()

  const [positions, colors] = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const seed = i * 0.123456789
      const radius = 20 + seededRandom(seed) * 30
      const theta = seededRandom(seed + 1) * Math.PI * 2
      const phi = Math.acos(2 * seededRandom(seed + 2) - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Gradient colors from gold to cyan
      const colorChoice = seededRandom(seed + 3)
      if (colorChoice < 0.3) {
        colors[i3] = 0.8 + seededRandom(seed + 4) * 0.2
        colors[i3 + 1] = 0.6 + seededRandom(seed + 5) * 0.3
        colors[i3 + 2] = 0.15 + seededRandom(seed + 6) * 0.15
      } else if (colorChoice < 0.6) {
        colors[i3] = 0.13 + seededRandom(seed + 7) * 0.1
        colors[i3 + 1] = 0.83 + seededRandom(seed + 8) * 0.1
        colors[i3 + 2] = 0.93 + seededRandom(seed + 9) * 0.1
      } else {
        colors[i3] = 0.9 + seededRandom(seed + 10) * 0.1
        colors[i3 + 1] = 0.9 + seededRandom(seed + 11) * 0.1
        colors[i3 + 2] = 1
      }
    }
    return [positions, colors]
  }, [])

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          {...{
            attach: "attributes-position",
            count: positions.length / 3,
            array: positions,
            itemSize: 3
          }}
        />
        <bufferAttribute
          {...{
            attach: "attributes-color",
            count: colors.length / 3,
            array: colors,
            itemSize: 3
          }}
        />
      </bufferGeometry>
      <pointsMaterial
        {...{
          size: 0.15,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
          sizeAttenuation: true,
          depthWrite: false
        }}
      />
    </points>
  )
}

// Glowing energy orb with distortion
function EnergyOrb() {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.25
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group {...{ position: [0, 0, 0] }}>
        {/* Inner glow */}
        <mesh ref={glowRef}>
          <sphereGeometry {...{ args: [2.2, 32, 32] }} />
          <meshBasicMaterial
            {...{
              color: "#22d3ee",
              transparent: true,
              opacity: 0.1,
              side: THREE.BackSide
            }}
          />
        </mesh>
        {/* Main orb */}
        <mesh ref={meshRef}>
          <sphereGeometry {...{ args: [1.8, 64, 64] }} />
          <MeshDistortMaterial
            {...{
              color: "#22d3ee",
              emissive: "#22d3ee",
              emissiveIntensity: 0.6,
              roughness: 0.1,
              metalness: 0.9,
              distort: 0.3,
              speed: 3,
              wireframe: false
            }}
          />
        </mesh>
        {/* Outer ring */}
        <mesh {...{ rotation: [Math.PI / 2, 0, 0] }}>
          <torusGeometry {...{ args: [2.5, 0.02, 16, 100] }} />
          <meshBasicMaterial {...{ color: "#67e8f9", transparent: true, opacity: 0.4 }} />
        </mesh>
        <mesh {...{ rotation: [Math.PI / 3, Math.PI / 4, 0] }}>
          <torusGeometry {...{ args: [2.8, 0.015, 16, 100] }} />
          <meshBasicMaterial {...{ color: "#c9a227", transparent: true, opacity: 0.3 }} />
        </mesh>
      </group>
    </Float>
  )
}

// Floating geometric crystals
function GeometricCrystal({ position, color, delay = 0 }) {
  const meshRef = useRef()
  const [speed] = useState(() => 1.5 + seededRandom(delay * 100) * 0.5)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + delay
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + delay
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={meshRef} {...{ position }}>
        <icosahedronGeometry {...{ args: [0.5, 0] }} />
        <meshStandardMaterial
          {...{
            color,
            emissive: color,
            emissiveIntensity: 0.4,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8
          }}
        />
      </mesh>
    </Float>
  )
}

GeometricCrystal.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string.isRequired,
  delay: PropTypes.number,
}

// Holographic ring system
function HolographicRings() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const ringsData = useMemo(() => [0, 1, 2, 3], [])

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} {...{ position: [3, 1, -2] }}>
        {ringsData.map((i) => (
          <mesh key={`ring-${i}`} {...{ rotation: [i * 0.3, i * 0.5, 0] }}>
            <torusGeometry {...{ args: [1 - i * 0.15, 0.02, 16, 64] }} />
            <meshBasicMaterial
              {...{
                color: i % 2 === 0 ? "#22d3ee" : "#c9a227",
                transparent: true,
                opacity: 0.5 - i * 0.1
              }}
            />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

// DNA/Helix structure representing life/faith
function HelixStructure() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const spheres = useMemo(() => {
    const arr = []
    for (let i = 0; i < 12; i++) {
      const t = i / 12 * Math.PI * 4
      arr.push({
        id: `sphere-${i}`,
        pos: [Math.cos(t) * 0.8, i * 0.3 - 1.5, Math.sin(t) * 0.8],
        color: i % 2 === 0 ? "#22d3ee" : "#c9a227"
      })
    }
    return arr
  }, [])

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} {...{ position: [-3, 0, -1], scale: 0.6 }}>
        {spheres.map((s) => (
          <mesh key={s.id} {...{ position: s.pos }}>
            <sphereGeometry {...{ args: [0.15, 16, 16] }} />
            <meshStandardMaterial
              {...{
                color: s.color,
                emissive: s.color,
                emissiveIntensity: 0.6,
                metalness: 0.8,
                roughness: 0.2
              }}
            />
          </mesh>
        ))}
        {/* Connection lines */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`helix-line-${i}`} {...{ rotation: [0, i * Math.PI / 2, 0] }}>
            <cylinderGeometry {...{ args: [0.01, 0.01, 3, 8] }} />
            <meshBasicMaterial {...{ color: "#22d3ee", transparent: true, opacity: 0.3 }} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

// Sparkle particles
function FloatingSparkles() {
  return (
    <Sparkles
      count={100}
      scale={12}
      size={2}
      speed={0.4}
      opacity={0.5}
      color="#c9a227"
    />
  )
}

// Bible book with premium materials
function BibleBook() {
  const bookRef = useRef()

  useFrame((state) => {
    if (bookRef.current) {
      bookRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={bookRef} {...{ position: [2.5, -0.5, 0.5], scale: 0.35 }}>
        {/* Book cover */}
        <mesh {...{ position: [0, 0, 0.35] }}>
          <boxGeometry {...{ args: [3, 4, 0.35] }} />
          <meshStandardMaterial
            {...{
              color: "#1e3a5f",
              metalness: 0.4,
              roughness: 0.6
            }}
          />
        </mesh>
        {/* Book spine */}
        <mesh {...{ position: [-1.4, 0, 0] }}>
          <boxGeometry {...{ args: [0.25, 4, 0.7] }} />
          <meshStandardMaterial
            {...{
              color: "#c9a227",
              metalness: 0.7,
              roughness: 0.3
            }}
          />
        </mesh>
        {/* Pages */}
        <mesh {...{ position: [0, 0, 0] }}>
          <boxGeometry {...{ args: [2.7, 3.8, 0.45] }} />
          <meshStandardMaterial {...{ color: "#f5f5dc", roughness: 0.9 }} />
        </mesh>
        {/* Cross */}
        <mesh {...{ position: [0.4, 0.3, 0.36] }}>
          <boxGeometry {...{ args: [0.12, 1.2, 0.06] }} />
          <meshStandardMaterial
            {...{
              color: "#c9a227",
              metalness: 0.9,
              roughness: 0.1,
              emissive: "#c9a227",
              emissiveIntensity: 0.3
            }}
          />
        </mesh>
        <mesh {...{ position: [0.4, 0.7, 0.36] }}>
          <boxGeometry {...{ args: [0.7, 0.12, 0.06] }} />
          <meshStandardMaterial
            {...{
              color: "#c9a227",
              metalness: 0.9,
              roughness: 0.1,
              emissive: "#c9a227",
              emissiveIntensity: 0.3
            }}
          />
        </mesh>
        {/* Glow effect */}
        <pointLight {...{ position: [0.5, 0.5, 1], color: "#c9a227", intensity: 0.5, distance: 3 }} />
      </group>
    </Float>
  )
}

// Golden cross
function GoldenCross() {
  const crossRef = useRef()

  useFrame((state) => {
    if (crossRef.current) {
      crossRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
      crossRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={crossRef} {...{ position: [-2.8, 0.5, 0], scale: 0.55 }}>
        <mesh {...{ position: [0, 0.5, 0] }}>
          <boxGeometry {...{ args: [0.22, 1.4, 0.22] }} />
          <meshStandardMaterial
            {...{
              color: "#c9a227",
              metalness: 0.9,
              roughness: 0.1,
              emissive: "#c9a227",
              emissiveIntensity: 0.4
            }}
          />
        </mesh>
        <mesh {...{ position: [0, 0, 0] }}>
          <boxGeometry {...{ args: [1, 0.22, 0.22] }} />
          <meshStandardMaterial
            {...{
              color: "#c9a227",
              metalness: 0.9,
              roughness: 0.1,
              emissive: "#c9a227",
              emissiveIntensity: 0.4
            }}
          />
        </mesh>
        {/* Glow */}
        <pointLight {...{ position: [0, 0.3, 0.3], color: "#c9a227", intensity: 0.4, distance: 2 }} />
      </group>
    </Float>
  )
}

// Neural network nodes
function NeuralNetwork() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
    }
  })

  const nodes = useMemo(() => [
    { id: 'node-0', pos: [0, 0, 0], main: true },
    { id: 'node-1', pos: [1, 0.6, 0.3] },
    { id: 'node-2', pos: [-1, 0.6, -0.3] },
    { id: 'node-3', pos: [0.6, -0.6, 0.5] },
    { id: 'node-4', pos: [-0.6, -0.6, -0.5] },
    { id: 'node-5', pos: [0.3, 1, -0.3] },
    { id: 'node-6', pos: [-0.3, -1, 0.3] },
    { id: 'node-7', pos: [0.9, 0, -0.6] },
    { id: 'node-8', pos: [-0.9, 0, 0.6] }
  ], [])

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={groupRef} {...{ position: [-1.2, 1.2, -1.2], scale: 0.5 }}>
        {nodes.map((node) => (
          <mesh key={node.id} {...{ position: node.pos }}>
            <sphereGeometry {...{ args: [0.12, 16, 16] }} />
            <meshStandardMaterial
              {...{
                color: node.main ? "#4f46e5" : "#818cf8",
                emissive: node.main ? "#4f46e5" : "#818cf8",
                emissiveIntensity: 0.7,
                metalness: 0.9,
                roughness: 0.1
              }}
            />
          </mesh>
        ))}
        {/* Connections */}
        {nodes.slice(1).map((node) => (
          <mesh
            key={`conn-${node.id}`}
            {...{
              position: [node.pos[0] / 2, node.pos[1] / 2, node.pos[2] / 2],
              rotation: [0, 0, Math.atan2(node.pos[1], node.pos[0])]
            }}
          >
            <cylinderGeometry {...{ args: [0.015, 0.015, Math.hypot(...node.pos), 8] }} />
            <meshBasicMaterial {...{ color: "#818cf8", transparent: true, opacity: 0.3 }} />
          </mesh>
        ))}
        <pointLight {...{ position: [0, 0, 0], color: "#4f46e5", intensity: 0.3, distance: 2 }} />
      </group>
    </Float>
  )
}

// Main scene
function Scene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight {...{ intensity: 0.2 }} />

      {/* Main directional light */}
      <directionalLight {...{ position: [10, 10, 5], intensity: 0.8, color: "#ffffff" }} />

      {/* Colored point lights */}
      <pointLight {...{ position: [-10, -10, -10], color: "#22d3ee", intensity: 0.6 }} />
      <pointLight {...{ position: [10, 5, 5], color: "#c9a227", intensity: 0.5 }} />
      <pointLight {...{ position: [0, -5, 8], color: "#818cf8", intensity: 0.4 }} />
      <pointLight {...{ position: [5, -3, -5], color: "#67e8f9", intensity: 0.3 }} />

      {/* Background */}
      <color {...{ attach: "background", args: ['#050508'] }} />
      <fog {...{ attach: "fog", args: ['#050508', 8, 35] }} />

      {/* Starfield */}
      <StarField />

      {/* Main elements */}
      <EnergyOrb />
      <FloatingSparkles />
      <BibleBook />
      <GoldenCross />
      <NeuralNetwork />
      <HolographicRings />
      <HelixStructure />

      {/* Floating crystals */}
      <GeometricCrystal position={[4, 2, -3]} color="#22d3ee" delay={0} />
      <GeometricCrystal position={[-4, -1, -2]} color="#c9a227" delay={1} />
      <GeometricCrystal position={[3, -2, 1]} color="#818cf8" delay={2} />
      <GeometricCrystal position={[-3, 2, 0]} color="#67e8f9" delay={0.5} />
      <GeometricCrystal position={[0, 3, -4]} color="#22d3ee" delay={1.5} />

      {/* Subtle orbit controls for interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.15}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  )
}

export default function Hero3DScene() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
