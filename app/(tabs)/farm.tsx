import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { useRouter } from 'expo-router';
import { Play, ZoomIn, ZoomOut, Sparkles, Sun, Moon, X } from 'lucide-react-native';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// REALISTIC COW
// ============================================
function RealisticCow({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const [targetPos, setTargetPos] = useState(position);
    const currentPos = useRef(new THREE.Vector3(...position));
    const currentRot = useRef(rotation);
    const userData = useRef({ grazingTime: 0, isGrazing: Math.random() > 0.5 });

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.5 && !userData.current.isGrazing) {
                const newX = Math.max(-25, Math.min(25, currentPos.current.x + (Math.random() - 0.5) * 8));
                const newZ = Math.max(-25, Math.min(25, currentPos.current.z + (Math.random() - 0.5) * 8));
                setTargetPos([newX, 0, newZ]);
            }
        }, 5000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const target = new THREE.Vector3(targetPos[0], 0, targetPos[2]);
            currentPos.current.lerp(target, 0.008);
            groupRef.current.position.copy(currentPos.current);
            const dir = target.clone().sub(currentPos.current);
            if (dir.length() > 0.1) {
                const targetRot = Math.atan2(dir.x, dir.z);
                currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot, 0.02);
                groupRef.current.rotation.y = currentRot.current;
            }
            // Subtle breathing/movement
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={0.9}>
            {/* Body */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[1.2, 1.1, 2.4]} />
                <meshStandardMaterial color="#FAFAFA" />
            </mesh>
            {/* Spots */}
            <mesh position={[0.3, 1.5, 0.6]}><sphereGeometry args={[0.35, 8, 8]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
            <mesh position={[-0.4, 1.4, -0.3]}><sphereGeometry args={[0.45, 8, 8]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
            <mesh position={[0.2, 1.3, -0.9]}><sphereGeometry args={[0.3, 8, 8]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
            {/* Head */}
            <mesh position={[0, 1.5, 1.4]} castShadow><boxGeometry args={[0.7, 0.7, 0.9]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
            {/* Snout */}
            <mesh position={[0, 1.3, 1.8]} castShadow><boxGeometry args={[0.5, 0.4, 0.25]} /><meshStandardMaterial color="#FFCCBB" /></mesh>
            {/* Horns */}
            <mesh position={[0.25, 2, 1.5]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.08, 0.35, 0.08]} /><meshStandardMaterial color="#4A4A4A" /></mesh>
            <mesh position={[-0.25, 2, 1.5]} rotation={[0, 0, -0.3]} castShadow><boxGeometry args={[0.08, 0.35, 0.08]} /><meshStandardMaterial color="#4A4A4A" /></mesh>
            {/* Ears */}
            <mesh position={[0.35, 1.8, 1.2]} castShadow><boxGeometry args={[0.18, 0.3, 0.12]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
            <mesh position={[-0.35, 1.8, 1.2]} castShadow><boxGeometry args={[0.18, 0.3, 0.12]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
            {/* Legs */}
            <mesh position={[0.35, 0.55, 0.7]} castShadow><boxGeometry args={[0.25, 1.1, 0.25]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
            <mesh position={[-0.35, 0.55, 0.7]} castShadow><boxGeometry args={[0.25, 1.1, 0.25]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
            <mesh position={[0.35, 0.55, -0.7]} castShadow><boxGeometry args={[0.25, 1.1, 0.25]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
            <mesh position={[-0.35, 0.55, -0.7]} castShadow><boxGeometry args={[0.25, 1.1, 0.25]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
            {/* Tail */}
            <mesh position={[0.6, 0.9, -1.2]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.06, 0.9, 0.06]} /><meshStandardMaterial color="#FAFAFA" /></mesh>
        </group>
    );
}

// ============================================
// REALISTIC GOAT
// ============================================
function RealisticGoat({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const [targetPos, setTargetPos] = useState(position);
    const currentPos = useRef(new THREE.Vector3(...position));
    const currentRot = useRef(rotation);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.4) {
                const newX = Math.max(-25, Math.min(25, currentPos.current.x + (Math.random() - 0.5) * 6));
                const newZ = Math.max(-25, Math.min(25, currentPos.current.z + (Math.random() - 0.5) * 6));
                setTargetPos([newX, 0, newZ]);
            }
        }, 4000 + Math.random() * 3000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const target = new THREE.Vector3(targetPos[0], 0, targetPos[2]);
            currentPos.current.lerp(target, 0.012);
            groupRef.current.position.copy(currentPos.current);
            const dir = target.clone().sub(currentPos.current);
            if (dir.length() > 0.1) {
                const targetRot = Math.atan2(dir.x, dir.z);
                currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot, 0.025);
                groupRef.current.rotation.y = currentRot.current;
            }
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.015;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={0.8}>
            {/* Body */}
            <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.75, 0.85, 1.5]} /><meshStandardMaterial color="#B8956A" /></mesh>
            {/* Head */}
            <mesh position={[0, 1.35, 0.9]} castShadow><boxGeometry args={[0.55, 0.55, 0.6]} /><meshStandardMaterial color="#B8956A" /></mesh>
            {/* Beard */}
            <mesh position={[0, 1.1, 1.2]} castShadow><boxGeometry args={[0.4, 0.25, 0.12]} /><meshStandardMaterial color="#B8956A" /></mesh>
            {/* Horns */}
            <mesh position={[0.2, 1.7, 0.8]} rotation={[0, 0, 0.4]} castShadow><boxGeometry args={[0.08, 0.5, 0.08]} /><meshStandardMaterial color="#3A3A3A" /></mesh>
            <mesh position={[-0.2, 1.7, 0.8]} rotation={[0, 0, -0.4]} castShadow><boxGeometry args={[0.08, 0.5, 0.08]} /><meshStandardMaterial color="#3A3A3A" /></mesh>
            {/* Ears */}
            <mesh position={[0.3, 1.55, 0.9]} castShadow><boxGeometry args={[0.15, 0.25, 0.1]} /><meshStandardMaterial color="#B8956A" /></mesh>
            <mesh position={[-0.3, 1.55, 0.9]} castShadow><boxGeometry args={[0.15, 0.25, 0.1]} /><meshStandardMaterial color="#B8956A" /></mesh>
            {/* Legs */}
            <mesh position={[0.22, 0.43, 0.5]} castShadow><boxGeometry args={[0.16, 0.85, 0.16]} /><meshStandardMaterial color="#8D6E63" /></mesh>
            <mesh position={[-0.22, 0.43, 0.5]} castShadow><boxGeometry args={[0.16, 0.85, 0.16]} /><meshStandardMaterial color="#8D6E63" /></mesh>
            <mesh position={[0.22, 0.43, -0.5]} castShadow><boxGeometry args={[0.16, 0.85, 0.16]} /><meshStandardMaterial color="#8D6E63" /></mesh>
            <mesh position={[-0.22, 0.43, -0.5]} castShadow><boxGeometry args={[0.16, 0.85, 0.16]} /><meshStandardMaterial color="#8D6E63" /></mesh>
            {/* Tail */}
            <mesh position={[0.4, 0.75, -0.75]} castShadow><boxGeometry args={[0.06, 0.4, 0.06]} /><meshStandardMaterial color="#B8956A" /></mesh>
        </group>
    );
}

// ============================================
// REALISTIC HEN
// ============================================
function RealisticHen({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const [targetPos, setTargetPos] = useState(position);
    const currentPos = useRef(new THREE.Vector3(...position));
    const currentRot = useRef(rotation);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.3) {
                const newX = Math.max(-25, Math.min(25, currentPos.current.x + (Math.random() - 0.5) * 4));
                const newZ = Math.max(-25, Math.min(25, currentPos.current.z + (Math.random() - 0.5) * 4));
                setTargetPos([newX, 0, newZ]);
            }
        }, 2500 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const target = new THREE.Vector3(targetPos[0], 0, targetPos[2]);
            currentPos.current.lerp(target, 0.018);
            groupRef.current.position.copy(currentPos.current);
            const dir = target.clone().sub(currentPos.current);
            if (dir.length() > 0.05) {
                const targetRot = Math.atan2(dir.x, dir.z);
                currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot, 0.035);
                groupRef.current.rotation.y = currentRot.current;
            }
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 6) * 0.01;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={0.65}>
            {/* Body */}
            <mesh position={[0, 0.45, 0]} castShadow><sphereGeometry args={[0.32, 12, 12]} /><meshStandardMaterial color="#DC4C2C" /></mesh>
            {/* Head */}
            <mesh position={[0, 0.85, 0.3]} castShadow><sphereGeometry args={[0.16, 10, 10]} /><meshStandardMaterial color="#DC4C2C" /></mesh>
            {/* Comb */}
            <mesh position={[0, 1.05, 0.27]} castShadow><boxGeometry args={[0.1, 0.22, 0.08]} /><meshStandardMaterial color="#FF0000" /></mesh>
            {/* Beak */}
            <mesh position={[0, 0.8, 0.45]} castShadow><boxGeometry args={[0.08, 0.08, 0.12]} /><meshStandardMaterial color="#FFAA00" /></mesh>
            {/* Wattle */}
            <mesh position={[0, 0.65, 0.27]} castShadow><boxGeometry args={[0.06, 0.08, 0.04]} /><meshStandardMaterial color="#FF0000" /></mesh>
            {/* Legs */}
            <mesh position={[-0.12, 0.15, 0]} castShadow><boxGeometry args={[0.06, 0.35, 0.06]} /><meshStandardMaterial color="#FFAA00" /></mesh>
            <mesh position={[0.12, 0.15, 0]} castShadow><boxGeometry args={[0.06, 0.35, 0.06]} /><meshStandardMaterial color="#FFAA00" /></mesh>
            {/* Tail */}
            <mesh position={[0, 0.6, -0.3]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.08, 0.3, 0.15]} /><meshStandardMaterial color="#424242" /></mesh>
            {/* Wing */}
            <mesh position={[0.27, 0.52, 0.07]} castShadow><boxGeometry args={[0.08, 0.22, 0.22]} /><meshStandardMaterial color="#DC4C2C" /></mesh>
        </group>
    );
}

// ============================================
// CARETAKER (FARMER)
// ============================================
function Caretaker({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null);
    const [targetPos, setTargetPos] = useState(position);
    const currentPos = useRef(new THREE.Vector3(...position));
    const currentRot = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.3) {
                const newX = Math.max(-25, Math.min(25, currentPos.current.x + (Math.random() - 0.5) * 10));
                const newZ = Math.max(-25, Math.min(25, currentPos.current.z + (Math.random() - 0.5) * 10));
                setTargetPos([newX, 0, newZ]);
            }
        }, 6000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const target = new THREE.Vector3(targetPos[0], 0, targetPos[2]);
            currentPos.current.lerp(target, 0.006);
            groupRef.current.position.copy(currentPos.current);
            const dir = target.clone().sub(currentPos.current);
            if (dir.length() > 0.1) {
                const targetRot = Math.atan2(dir.x, dir.z);
                currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot, 0.02);
                groupRef.current.rotation.y = currentRot.current;
            }
        }
    });

    return (
        <group ref={groupRef} position={position} scale={0.8}>
            {/* Body (shirt) */}
            <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[0.9, 1.5, 0.55]} /><meshStandardMaterial color="#8B4513" /></mesh>
            {/* Head */}
            <mesh position={[0, 2.2, 0]} castShadow><sphereGeometry args={[0.28, 12, 12]} /><meshStandardMaterial color="#FFDBAC" /></mesh>
            {/* Hat */}
            <mesh position={[0, 2.6, 0]} castShadow><coneGeometry args={[0.35, 0.4, 12]} /><meshStandardMaterial color="#654321" /></mesh>
            {/* Arms */}
            <mesh position={[-0.55, 1.2, 0]} castShadow><boxGeometry args={[0.22, 0.9, 0.22]} /><meshStandardMaterial color="#FFDBAC" /></mesh>
            <mesh position={[0.55, 1.2, 0]} castShadow><boxGeometry args={[0.22, 0.9, 0.22]} /><meshStandardMaterial color="#FFDBAC" /></mesh>
            {/* Legs */}
            <mesh position={[-0.22, 0.4, 0]} castShadow><boxGeometry args={[0.22, 0.8, 0.22]} /><meshStandardMaterial color="#2C2C2C" /></mesh>
            <mesh position={[0.22, 0.4, 0]} castShadow><boxGeometry args={[0.22, 0.8, 0.22]} /><meshStandardMaterial color="#2C2C2C" /></mesh>
        </group>
    );
}

// ============================================
// BUILDINGS
// ============================================
function FarmHouse({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Walls */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow><boxGeometry args={[6, 4, 7]} /><meshStandardMaterial color="#D2691E" /></mesh>
            {/* Roof */}
            <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[5, 2.8, 4]} /><meshStandardMaterial color="#8B4513" /></mesh>
            {/* Door */}
            <mesh position={[0, 1.2, 3.55]} castShadow><boxGeometry args={[1.2, 1.8, 0.15]} /><meshStandardMaterial color="#4A2511" /></mesh>
            {/* Windows */}
            <mesh position={[-1.1, 3.2, 3.55]}><boxGeometry args={[0.75, 0.75, 0.12]} /><meshStandardMaterial color="#87CEEB" /></mesh>
            <mesh position={[1.1, 3.2, 3.55]}><boxGeometry args={[0.75, 0.75, 0.12]} /><meshStandardMaterial color="#87CEEB" /></mesh>
            {/* Chimney */}
            <mesh position={[2, 4, -2]} castShadow><boxGeometry args={[0.5, 1.8, 0.5]} /><meshStandardMaterial color="#8B4513" /></mesh>
        </group>
    );
}

function Barn({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Main barn */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow><boxGeometry args={[9, 6, 8]} /><meshStandardMaterial color="#8B0000" /></mesh>
            {/* Roof */}
            <mesh position={[0, 7.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[6, 3.2, 4]} /><meshStandardMaterial color="#654321" /></mesh>
            {/* Barn door */}
            <mesh position={[0, 1.8, 4.05]} castShadow><boxGeometry args={[2.2, 2.8, 0.2]} /><meshStandardMaterial color="#4A2511" /></mesh>
            {/* Windows */}
            <mesh position={[-1.4, 5, 4.05]}><boxGeometry args={[0.65, 0.65, 0.12]} /><meshStandardMaterial color="#87CEEB" /></mesh>
            <mesh position={[1.4, 5, 4.05]}><boxGeometry args={[0.65, 0.65, 0.12]} /><meshStandardMaterial color="#87CEEB" /></mesh>
        </group>
    );
}

function Silo({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[0.8, 0.8, 4, 16]} /><meshStandardMaterial color="#C0C0C0" /></mesh>
            <mesh position={[0, 4.3, 0]} castShadow><coneGeometry args={[0.8, 0.7, 16]} /><meshStandardMaterial color="#C0C0C0" /></mesh>
        </group>
    );
}

function WaterTrough({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[2, 0.55, 0.8]} /><meshStandardMaterial color="#696969" /></mesh>
            <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.85, 0.22, 0.65]} /><meshStandardMaterial color="#4A90E2" /></mesh>
        </group>
    );
}

// ============================================
// ENVIRONMENT
// ============================================
function Ground({ isNight }: { isNight: boolean }) {
    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={isNight ? "#2D4A22" : "#4A9D2F"} />
            </mesh>
        </>
    );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 1.8, 0]} castShadow><cylinderGeometry args={[0.4, 0.55, 3.5, 8]} /><meshStandardMaterial color="#654321" /></mesh>
            <mesh position={[0, 4.2, 0]} castShadow><sphereGeometry args={[2.2, 8, 8]} /><meshStandardMaterial color="#228B22" /></mesh>
        </group>
    );
}

function FenceSection({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const direction = new THREE.Vector3(end[0] - start[0], 0, end[2] - start[2]);
    const length = direction.length();
    const center: [number, number, number] = [(start[0] + end[0]) / 2, 1.2, (start[2] + end[2]) / 2];
    const angle = Math.atan2(direction.x, direction.z);

    return (
        <group position={center} rotation={[0, angle, 0]}>
            {/* Posts */}
            {Array.from({ length: Math.ceil(length / 4) + 1 }).map((_, i) => (
                <mesh key={`post-${i}`} position={[0, 0, -length / 2 + i * 4]} castShadow>
                    <boxGeometry args={[0.25, 1.8, 0.25]} />
                    <meshStandardMaterial color="#8B6914" />
                </mesh>
            ))}
            {/* Rails */}
            <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.18, 0.14, length]} /><meshStandardMaterial color="#8B6914" /></mesh>
            <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.18, 0.14, length]} /><meshStandardMaterial color="#8B6914" /></mesh>
            <mesh position={[0, 1.4, 0]} castShadow><boxGeometry args={[0.18, 0.14, length]} /><meshStandardMaterial color="#8B6914" /></mesh>
        </group>
    );
}

function Cloud({ position, isNight }: { position: [number, number, number]; isNight: boolean }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[5, 8, 8]} />
            <meshStandardMaterial color={isNight ? "#333333" : "#FFFFFF"} />
        </mesh>
    );
}

function SunMoon({ isNight }: { isNight: boolean }) {
    // Generate random star positions
    const stars = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < 100; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.4 + 0.1; // Upper hemisphere
            const r = 120 + Math.random() * 30;
            positions.push([
                Math.sin(theta) * Math.cos(phi) * r,
                Math.sin(phi) * r + 20,
                Math.cos(theta) * Math.cos(phi) * r,
            ]);
        }
        return positions;
    }, []);

    return (
        <>
            {/* Sun */}
            {!isNight && (
                <mesh position={[50, 60, 50]}>
                    <sphereGeometry args={[4, 16, 16]} />
                    <meshBasicMaterial color="#FFD700" />
                </mesh>
            )}
            {/* Moon - bigger and brighter */}
            {isNight && (
                <>
                    <mesh position={[-50, 65, -50]}>
                        <sphereGeometry args={[5, 16, 16]} />
                        <meshBasicMaterial color="#FFFACD" />
                    </mesh>
                    {/* Moon glow */}
                    <mesh position={[-50, 65, -50]}>
                        <sphereGeometry args={[7, 16, 16]} />
                        <meshBasicMaterial color="#FFFACD" transparent opacity={0.3} />
                    </mesh>
                    {/* Stars */}
                    {stars.map((pos, i) => (
                        <mesh key={`star-${i}`} position={pos}>
                            <sphereGeometry args={[0.3 + Math.random() * 0.4, 6, 6]} />
                            <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                    ))}
                </>
            )}
        </>
    );
}

// ============================================
// CAMERA CONTROLLER
// ============================================
function SmoothCameraController({ targetState }: { targetState: { distance: number; rotationY: number; rotationX: number } }) {
    const { camera } = useThree();
    const currentState = useRef({ distance: 50, rotationY: 0.5, rotationX: 0.4 });

    useFrame(() => {
        currentState.current.distance = THREE.MathUtils.lerp(currentState.current.distance, targetState.distance, 0.1);
        currentState.current.rotationY = THREE.MathUtils.lerp(currentState.current.rotationY, targetState.rotationY, 0.08);
        currentState.current.rotationX = THREE.MathUtils.lerp(currentState.current.rotationX, targetState.rotationX, 0.08);
        const { distance, rotationY, rotationX } = currentState.current;
        const x = Math.sin(rotationY) * Math.cos(rotationX) * distance;
        const y = Math.sin(rotationX) * distance;
        const z = Math.cos(rotationY) * Math.cos(rotationX) * distance;
        camera.position.set(x, Math.max(8, y), z);
        camera.lookAt(0, 2, 0);
    });
    return null;
}

// ============================================
// DYNAMIC ANIMALS SCENE
// ============================================
function FarmScene({ cameraState, animalCounts, isNight }: { cameraState: { distance: number; rotationY: number; rotationX: number }; animalCounts: { hens: number; goats: number; cows: number }; isNight: boolean }) {
    const cowPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < Math.min(animalCounts.cows, 10); i++) {
            positions.push([-18 + (i % 3) * 12, 0, 8 + Math.floor(i / 3) * 10]);
        }
        return positions;
    }, [animalCounts.cows]);

    const goatPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < Math.min(animalCounts.goats, 15); i++) {
            positions.push([-12 + (i % 4) * 7, 0, -6 + Math.floor(i / 4) * 7]);
        }
        return positions;
    }, [animalCounts.goats]);

    const henPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < Math.min(animalCounts.hens, 20); i++) {
            positions.push([6 + (i % 5) * 4, 0, 12 + Math.floor(i / 5) * 4]);
        }
        return positions;
    }, [animalCounts.hens]);

    return (
        <>
            <ambientLight intensity={isNight ? 0.5 : 0.6} />
            <directionalLight
                position={isNight ? [-50, 60, -50] : [50, 60, 50]}
                intensity={isNight ? 0.6 : 0.9}
                castShadow
                shadow-mapSize={[2048, 2048]}
                color={isNight ? "#B8C4FF" : "#FFFFFF"}
            />
            <hemisphereLight args={[isNight ? '#2a2a4e' : '#87CEEB', isNight ? '#2a3e2a' : '#7CB342', isNight ? 0.6 : 0.4]} />
            <color attach="background" args={[isNight ? '#0F0F2A' : '#87CEEB']} />
            <fog attach="fog" args={[isNight ? '#0F0F2A' : '#87CEEB', 100, 250]} />

            <SmoothCameraController targetState={cameraState} />
            <Ground isNight={isNight} />
            <SunMoon isNight={isNight} />

            {/* Clouds */}
            <Cloud position={[25, 40, -25]} isNight={isNight} />
            <Cloud position={[-30, 45, 15]} isNight={isNight} />
            <Cloud position={[10, 38, 35]} isNight={isNight} />

            {/* Buildings */}
            <FarmHouse position={[35, 0, -30]} />
            <Barn position={[-35, 0, -35]} />
            <Silo position={[-28, 0, -22]} />
            <Silo position={[-24, 0, -18]} />

            {/* Fences */}
            <FenceSection start={[-45, 0, -45]} end={[45, 0, -45]} />
            <FenceSection start={[45, 0, -45]} end={[45, 0, 45]} />
            <FenceSection start={[45, 0, 45]} end={[-45, 0, 45]} />
            <FenceSection start={[-45, 0, 45]} end={[-45, 0, -45]} />

            {/* Trees around the perimeter */}
            {Array.from({ length: 12 }).map((_, i) => <Tree key={`tree-n-${i}`} position={[-42 + i * 7, 0, -50]} scale={0.85} />)}
            {Array.from({ length: 12 }).map((_, i) => <Tree key={`tree-s-${i}`} position={[-42 + i * 7, 0, 50]} scale={0.85} />)}
            {Array.from({ length: 10 }).map((_, i) => <Tree key={`tree-e-${i}`} position={[50, 0, -40 + i * 8]} scale={0.85} />)}
            {Array.from({ length: 10 }).map((_, i) => <Tree key={`tree-w-${i}`} position={[-50, 0, -40 + i * 8]} scale={0.85} />)}

            {/* Water troughs */}
            <WaterTrough position={[-12, 0, 6]} />
            <WaterTrough position={[12, 0, 9]} />

            {/* Caretaker */}
            <Caretaker position={[-25, 0, -18]} />

            {/* Dynamic Animals */}
            {cowPositions.map((pos, i) => <RealisticCow key={`cow-${i}`} position={pos} rotation={Math.random() * Math.PI * 2} />)}
            {goatPositions.map((pos, i) => <RealisticGoat key={`goat-${i}`} position={pos} rotation={Math.random() * Math.PI * 2} />)}
            {henPositions.map((pos, i) => <RealisticHen key={`hen-${i}`} position={pos} rotation={Math.random() * Math.PI * 2} />)}
        </>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmScreen() {
    const router = useRouter();
    const { state, getTotalAnimals } = useFarm();
    const { colors, isDark } = useTheme();
    const [cameraState, setCameraState] = useState({ distance: 55, rotationY: 0.5, rotationX: 0.4 });
    const [isNight, setIsNight] = useState(false);
    const [showConvertReminder, setShowConvertReminder] = useState(true);
    const lastTouch = useRef({ x: 0, y: 0 });

    const todayHours = (state.todayMinutes / 60).toFixed(1);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                lastTouch.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
            },
            onPanResponderMove: (evt) => {
                const dx = (evt.nativeEvent.pageX - lastTouch.current.x) * 0.008;
                const dy = (evt.nativeEvent.pageY - lastTouch.current.y) * 0.005;
                lastTouch.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
                setCameraState(prev => ({
                    ...prev,
                    rotationY: prev.rotationY + dx,
                    rotationX: Math.max(0.15, Math.min(1.3, prev.rotationX + dy)),
                }));
            },
        })
    ).current;

    const handleZoomIn = () => setCameraState(prev => ({ ...prev, distance: Math.max(20, prev.distance - 8) }));
    const handleZoomOut = () => setCameraState(prev => ({ ...prev, distance: Math.min(100, prev.distance + 8) }));

    return (
        <View style={styles.container}>
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <Canvas camera={{ position: [55, 35, 55], fov: 45 }} shadows>
                    <Suspense fallback={null}>
                        <FarmScene cameraState={cameraState} animalCounts={{ hens: state.hens, goats: state.goats, cows: state.cows }} isNight={isNight} />
                    </Suspense>
                </Canvas>
            </View>

            <SafeAreaView style={styles.uiOverlay} pointerEvents="box-none">
                {/* Header with Stats */}
                <View style={[styles.header, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Your Farm</Text>
                        <Text style={[styles.title, { color: colors.text }]}>🏡 3D Farm</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBadge, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                            <Text style={styles.statEmoji}>🐾</Text>
                            <Text style={[styles.statText, { color: isDark ? colors.text : '#8B6B00' }]}>{getTotalAnimals()}</Text>
                        </View>
                        <View style={[styles.statBadge, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                            <Sparkles size={14} color="#FFB800" />
                            <Text style={[styles.statText, { color: isDark ? colors.text : '#8B6B00' }]}>{todayHours}h</Text>
                        </View>
                    </View>
                </View>

                {/* Hen Conversion Reminder */}
                {state.hens >= 10 && showConvertReminder && (
                    <View style={[styles.convertReminder, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                        <TouchableOpacity
                            style={styles.convertReminderContent}
                            onPress={() => router.push('/(tabs)/goals')}
                        >
                            <Text style={styles.convertReminderEmoji}>🐔→🐐</Text>
                            <View style={styles.convertReminderText}>
                                <Text style={[styles.convertReminderTitle, { color: isDark ? colors.accent : '#E65100' }]}>Convert your hens!</Text>
                                <Text style={[styles.convertReminderDesc, { color: isDark ? colors.textSecondary : '#8B6B00' }]}>
                                    You have {state.hens} hens. Tap to convert to goats/cows!
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.convertReminderClose}
                            onPress={() => setShowConvertReminder(false)}
                        >
                            <X size={18} color={isDark ? colors.textSecondary : '#8B6B00'} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    {/* Day/Night Toggle */}
                    <TouchableOpacity
                        style={[styles.dayNightBtn, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.95)' }, isNight && styles.dayNightBtnNight]}
                        onPress={() => setIsNight(!isNight)}
                    >
                        {isNight ? <Moon size={20} color="#FFD700" /> : <Sun size={20} color="#FFD700" />}
                        <Text style={[styles.dayNightText, { color: isDark ? colors.text : '#333' }, isNight && styles.dayNightTextNight]}>
                            {isNight ? 'Night' : 'Day'}
                        </Text>
                    </TouchableOpacity>

                    {/* Zoom Controls */}
                    <View style={[styles.zoomControls, { backgroundColor: isDark ? colors.surface : 'rgba(255,255,255,0.95)' }]}>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isDark ? colors.primaryLight : '#E8F5E9' }]} onPress={handleZoomIn}>
                            <ZoomIn size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isDark ? colors.primaryLight : '#E8F5E9' }]} onPress={handleZoomOut}>
                            <ZoomOut size={22} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.fabContainer}>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push('/focus-start')} activeOpacity={0.8}>
                        <Play size={28} color="#FFF" fill="#FFF" />
                        <Text style={styles.fabText}>Start Focus</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#87CEEB' },
    canvasContainer: { flex: 1 },
    uiOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.95)', marginHorizontal: 16, marginTop: 8, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    greeting: { fontSize: 12, color: '#6B8E6B', fontWeight: '500' },
    title: { fontSize: 20, fontWeight: '800', color: '#2D4A22', marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 8 },
    statBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, gap: 6,
    },
    statEmoji: { fontSize: 14 },
    statText: { fontSize: 14, fontWeight: '700', color: '#8B6B00' },
    controlsContainer: {
        position: 'absolute', right: 16, top: 140,
        gap: 10,
    },
    dayNightBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 10, gap: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    dayNightBtnNight: {
        backgroundColor: '#1a1a2e',
    },
    dayNightText: { fontSize: 12, fontWeight: '600', color: '#333' },
    dayNightTextNight: { color: '#FFD700' },
    zoomControls: {
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    controlBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center', marginVertical: 3,
    },
    fabContainer: { alignSelf: 'center', marginBottom: 100 },
    fab: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A7C23',
        paddingHorizontal: 28, paddingVertical: 16, borderRadius: 50, gap: 10,
        shadowColor: '#2D4A22', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },
    fabText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    convertReminder: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 14,
        borderRadius: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    convertReminderEmoji: { fontSize: 24 },
    convertReminderText: { flex: 1 },
    convertReminderTitle: { fontSize: 14, fontWeight: '700', color: '#E65100' },
    convertReminderDesc: { fontSize: 11, color: '#8B6B00', marginTop: 2 },
    convertReminderContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    convertReminderClose: { padding: 6 },
});
