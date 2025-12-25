import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useRouter } from 'expo-router';
import { Play, ZoomIn, ZoomOut, Sparkles, Sun, Moon, X, Volume2, VolumeX } from 'lucide-react-native';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// CREATE COW - Realistic with spots
// ============================================
function createCow(): THREE.Group {
    const cow = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.8, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2;
    body.castShadow = true;
    body.receiveShadow = true;
    cow.add(body);

    // Spots
    const spotMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const spots = [
        { pos: [0.5, 2.5, 1], size: [0.6, 0.5, 0.3] },
        { pos: [-0.7, 2.3, -0.5], size: [0.8, 0.6, 0.3] },
        { pos: [0.3, 2.1, -1.5], size: [0.5, 0.4, 0.3] }
    ];
    spots.forEach(spot => {
        const spotGeo = new THREE.BoxGeometry(spot.size[0], spot.size[1], spot.size[2]);
        const spotMesh = new THREE.Mesh(spotGeo, spotMaterial);
        spotMesh.position.set(spot.pos[0], spot.pos[1], spot.pos[2]);
        spotMesh.castShadow = true;
        cow.add(spotMesh);
    });

    // Head
    const headGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.5);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2.5, 2.3);
    head.castShadow = true;
    head.name = 'head';
    cow.add(head);

    // Snout
    const snoutGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xffccbb });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 2.2, 3);
    cow.add(snout);

    // Horns
    const hornGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
    horn1.position.set(0.4, 3.3, 2.5);
    horn1.rotation.z = 0.3;
    cow.add(horn1);
    const horn2 = horn1.clone();
    horn2.position.x = -0.4;
    horn2.rotation.z = -0.3;
    cow.add(horn2);

    // Ears
    const earGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
    ear1.position.set(0.5, 3, 2);
    cow.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = -0.5;
    cow.add(ear2);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.4, 1.8, 0.4);
    const legPositions = [[-0.6, 0.9, 1.2], [0.6, 0.9, 1.2], [-0.6, 0.9, -1.2], [0.6, 0.9, -1.2]];
    legPositions.forEach((pos, idx) => {
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.name = `leg${idx}`;
        cow.add(leg);
    });

    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(1, 1.5, -2);
    tail.rotation.z = 0.3;
    tail.name = 'tail';
    cow.add(tail);

    return cow;
}

// ============================================
// CREATE GOAT - Brown with beard and horns
// ============================================
function createGoat(): THREE.Group {
    const goat = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.8 });

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.4, 2.5);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    goat.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.9, 0.9, 1);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2.2, 1.5);
    head.castShadow = true;
    head.name = 'head';
    goat.add(head);

    // Beard
    const beardGeometry = new THREE.BoxGeometry(0.7, 0.4, 0.2);
    const beard = new THREE.Mesh(beardGeometry, bodyMaterial);
    beard.position.set(0, 1.8, 2);
    goat.add(beard);

    // Horns
    const hornGeometry = new THREE.BoxGeometry(0.12, 0.8, 0.12);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
    horn1.position.set(0.3, 2.8, 1.3);
    horn1.rotation.z = 0.4;
    goat.add(horn1);
    const horn2 = horn1.clone();
    horn2.position.x = -0.3;
    horn2.rotation.z = -0.4;
    goat.add(horn2);

    // Ears
    const earGeometry = new THREE.BoxGeometry(0.25, 0.4, 0.15);
    const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
    ear1.position.set(0.4, 2.6, 1.5);
    goat.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = -0.4;
    goat.add(ear2);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 1.4, 0.25);
    const legPositions = [[-0.35, 0.7, 0.8], [0.35, 0.7, 0.8], [-0.35, 0.7, -0.8], [0.35, 0.7, -0.8]];
    legPositions.forEach((pos, idx) => {
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.name = `leg${idx}`;
        goat.add(leg);
    });

    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0.6, 1.2, -1.2);
    tail.name = 'tail';
    goat.add(tail);

    return goat;
}

// ============================================
// CREATE HEN - Red with comb and wattle
// ============================================
function createHen(): THREE.Group {
    const hen = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xdc4c2c, roughness: 0.7 });

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.scale.set(1, 1.2, 1.3);
    body.castShadow = true;
    hen.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.1, 0.4);
    head.castShadow = true;
    head.name = 'head';
    hen.add(head);

    // Comb
    const combGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.1);
    const combMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const comb = new THREE.Mesh(combGeometry, combMaterial);
    comb.position.set(0, 1.35, 0.35);
    hen.add(comb);

    // Beak
    const beakGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.15);
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(0, 1.05, 0.55);
    hen.add(beak);

    // Wattle
    const wattleGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.05);
    const wattle = new THREE.Mesh(wattleGeometry, combMaterial);
    wattle.position.set(0, 0.85, 0.35);
    hen.add(wattle);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-0.15, 0.2, 0);
    leg1.name = 'leg0';
    hen.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.x = 0.15;
    leg2.name = 'leg1';
    hen.add(leg2);

    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.2);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 0.8, -0.4);
    tail.rotation.z = 0.3;
    tail.name = 'tail';
    hen.add(tail);

    // Wing
    const wingGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.3);
    const wing = new THREE.Mesh(wingGeometry, bodyMaterial);
    wing.position.set(0.35, 0.7, 0.1);
    hen.add(wing);

    return hen;
}

// ============================================
// CREATE CARETAKER (FARMER) - Larger size
// ============================================
function createCaretaker(): THREE.Group {
    const caretaker = new THREE.Group();

    // Body (shirt)
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.9);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    body.name = 'body';
    caretaker.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 3, 0);
    head.castShadow = true;
    head.name = 'head';
    caretaker.add(head);

    // Hat
    const hatGeometry = new THREE.ConeGeometry(0.55, 0.6, 16);
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.set(0, 3.6, 0);
    caretaker.add(hat);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.35, 1.5, 0.35);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.9, 2, 0);
    leftArm.castShadow = true;
    leftArm.name = 'leftArm';
    caretaker.add(leftArm);
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.9, 2, 0);
    rightArm.castShadow = true;
    rightArm.name = 'rightArm';
    caretaker.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.35, 1.3, 0.35);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.35, 0.65, 0);
    leftLeg.castShadow = true;
    leftLeg.name = 'leftLeg';
    caretaker.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.35, 0.65, 0);
    rightLeg.castShadow = true;
    rightLeg.name = 'rightLeg';
    caretaker.add(rightLeg);

    // Shoes
    const shoeGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.5);
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.35, 0, 0);
    caretaker.add(leftShoe);
    const rightShoe = leftShoe.clone();
    rightShoe.position.x = 0.35;
    caretaker.add(rightShoe);

    return caretaker;
}

// ============================================
// CREATE HOUSE
// ============================================
function createHouse(): THREE.Group {
    const house = new THREE.Group();

    // Walls
    const wallGeometry = new THREE.BoxGeometry(10, 6, 12);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.7 });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 3;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(7.5, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, 6.1);
    house.add(door);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.7, 2, 6.2);
    handle.rotation.z = Math.PI / 2;
    house.add(handle);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
    [-1.5, 1.5].forEach(x => {
        const win = new THREE.Mesh(windowGeometry, windowMaterial);
        win.position.set(x, 5, 6.1);
        house.add(win);
    });

    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(0.8, 3, 0.8);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(3, 6, -3);
    chimney.castShadow = true;
    house.add(chimney);

    // Porch
    const porchGeometry = new THREE.BoxGeometry(3, 0.3, 1.5);
    const porchMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
    const porch = new THREE.Mesh(porchGeometry, porchMaterial);
    porch.position.set(0, 0.15, 6.5);
    house.add(porch);

    // Pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    [-1.2, 1.2].forEach(x => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 1, 6.5);
        pillar.castShadow = true;
        house.add(pillar);
    });

    return house;
}

// ============================================
// CREATE BARN
// ============================================
function createBarn(): THREE.Group {
    const barn = new THREE.Group();

    // Main barn
    const barnGeometry = new THREE.BoxGeometry(14, 9, 12);
    const barnMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.8 });
    const barnBody = new THREE.Mesh(barnGeometry, barnMaterial);
    barnBody.position.y = 4.5;
    barnBody.castShadow = true;
    barnBody.receiveShadow = true;
    barn.add(barnBody);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(8, 5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 11;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barn.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(3.5, 4, 0.3);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5, 6.15);
    barn.add(door);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1, 1, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
    [-2, 2].forEach(x => {
        const win = new THREE.Mesh(windowGeometry, windowMaterial);
        win.position.set(x, 7, 6.15);
        barn.add(win);
    });

    return barn;
}

// ============================================
// CREATE SILO
// ============================================
function createSilo(): THREE.Group {
    const silo = new THREE.Group();

    const siloGeometry = new THREE.CylinderGeometry(1.2, 1.2, 6, 16);
    const siloMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.6, metalness: 0.3 });
    const siloBody = new THREE.Mesh(siloGeometry, siloMaterial);
    siloBody.position.y = 3;
    siloBody.castShadow = true;
    silo.add(siloBody);

    const topGeometry = new THREE.ConeGeometry(1.2, 1, 16);
    const top = new THREE.Mesh(topGeometry, siloMaterial);
    top.position.y = 6.5;
    top.castShadow = true;
    silo.add(top);

    return silo;
}

// ============================================
// CREATE TREE
// ============================================
function createTree(): THREE.Group {
    const tree = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.8, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageGeometry = new THREE.SphereGeometry(3.5, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.7 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 5.5;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
}

// ============================================
// CREATE FENCE
// ============================================
function createFence(length: number): THREE.Group {
    const fence = new THREE.Group();
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });

    for (let i = -length / 2; i <= length / 2; i += 5) {
        const postGeometry = new THREE.BoxGeometry(0.4, 2.5, 0.4);
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(i, 1.25, 0);
        post.castShadow = true;
        fence.add(post);
    }

    const railGeometry = new THREE.BoxGeometry(length + 10, 0.2, 0.3);
    [2, 1.3, 0.6].forEach(y => {
        const rail = new THREE.Mesh(railGeometry, postMaterial);
        rail.position.y = y;
        rail.castShadow = true;
        fence.add(rail);
    });

    return fence;
}

// ============================================
// CREATE WATER TROUGH
// ============================================
function createWaterTrough(): THREE.Group {
    const trough = new THREE.Group();

    const troughGeometry = new THREE.BoxGeometry(3, 0.8, 1.2);
    const troughMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
    const troughBody = new THREE.Mesh(troughGeometry, troughMaterial);
    troughBody.position.y = 0.4;
    trough.add(troughBody);

    const waterGeometry = new THREE.BoxGeometry(2.8, 0.3, 1);
    const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.3, metalness: 0.2 });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 0.75;
    trough.add(water);

    return trough;
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmScreen() {
    const router = useRouter();
    const { state, getTotalAnimals } = useFarm();
    const { colors, isDark } = useTheme();
    const [isNight, setIsNight] = useState(false);
    const [showConvertReminder, setShowConvertReminder] = useState(true);
    const [cameraDistance, setCameraDistance] = useState(60);

    const glRef = useRef<GLView>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const animationRef = useRef<number | null>(null);
    const animalsRef = useRef<any[]>([]);
    const caretakerRef = useRef<any>(null);
    const lightsRef = useRef<{ ambient: THREE.AmbientLight | null; sun: THREE.DirectionalLight | null; moon: THREE.DirectionalLight | null; sunMesh: THREE.Mesh | null; moonMesh: THREE.Mesh | null; stars: THREE.Points | null; clouds: THREE.Group | null }>({ ambient: null, sun: null, moon: null, sunMesh: null, moonMesh: null, stars: null, clouds: null });
    const lastTouchRef = useRef({ x: 0, y: 0 });
    const cameraAngleRef = useRef({ horizontal: 0, vertical: 0.3 });

    const todayHours = (state.todayMinutes / 60).toFixed(1);

    const updateDayNight = useCallback((night: boolean) => {
        if (!sceneRef.current || !lightsRef.current.ambient) return;

        const { ambient, sun, moon, sunMesh, moonMesh, stars, clouds } = lightsRef.current;

        if (night) {
            sceneRef.current.background = new THREE.Color(0x0a0a1a);
            sceneRef.current.fog = new THREE.Fog(0x0a0a1a, 250, 500);
            if (ambient) ambient.intensity = 0.3;
            if (sun) sun.intensity = 0;
            if (moon) moon.intensity = 0.6;
            if (sunMesh) sunMesh.visible = false;
            if (moonMesh) moonMesh.visible = true;
            if (stars) stars.visible = true;
            if (clouds) {
                clouds.children.forEach((cloud: any) => {
                    if (cloud.material) {
                        cloud.material.color.set(0x333333);
                        cloud.material.emissiveIntensity = 0.1;
                    }
                });
            }
        } else {
            sceneRef.current.background = new THREE.Color(0x87ceeb);
            sceneRef.current.fog = new THREE.Fog(0x87ceeb, 250, 500);
            if (ambient) ambient.intensity = 0.6;
            if (sun) sun.intensity = 0.9;
            if (moon) moon.intensity = 0;
            if (sunMesh) sunMesh.visible = true;
            if (moonMesh) moonMesh.visible = false;
            if (stars) stars.visible = false;
            if (clouds) {
                clouds.children.forEach((cloud: any) => {
                    if (cloud.material) {
                        cloud.material.color.set(0xffffff);
                        cloud.material.emissiveIntensity = 0.3;
                    }
                });
            }
        }
    }, []);

    useEffect(() => {
        updateDayNight(isNight);
    }, [isNight, updateDayNight]);

    const onContextCreate = useCallback(async (gl: any) => {
        // Create renderer
        const renderer = new Renderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setClearColor(0x87ceeb);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 250, 500);
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.set(30, 20, 50);
        camera.lookAt(0, 5, 0);
        cameraRef.current = camera;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        lightsRef.current.ambient = ambientLight;

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
        sunLight.position.set(50, 60, 50);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -150;
        sunLight.shadow.camera.right = 150;
        sunLight.shadow.camera.top = 150;
        sunLight.shadow.camera.bottom = -150;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);
        lightsRef.current.sun = sunLight;

        const moonLight = new THREE.DirectionalLight(0x8899ff, 0);
        moonLight.position.set(-50, 60, -50);
        moonLight.castShadow = true;
        scene.add(moonLight);
        lightsRef.current.moon = moonLight;

        // Sun mesh
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.position.set(50, 60, 50);
        scene.add(sunMesh);
        lightsRef.current.sunMesh = sunMesh;

        // Moon mesh
        const moonGeometry = new THREE.SphereGeometry(4, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xEEEEEE });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        moonMesh.position.set(-50, 60, -50);
        moonMesh.visible = false;
        scene.add(moonMesh);
        lightsRef.current.moonMesh = moonMesh;

        // Stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        for (let i = 0; i < 500; i++) {
            const distance = 300;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            starsVertices.push(
                distance * Math.sin(phi) * Math.cos(theta),
                distance * Math.sin(phi) * Math.sin(theta),
                distance * Math.cos(phi)
            );
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
        const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 2 });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        stars.visible = false;
        scene.add(stars);
        lightsRef.current.stars = stars;

        // Clouds
        const cloudsGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const cloudGeometry = new THREE.SphereGeometry(8, 8, 8);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3,
                roughness: 1
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 300,
                80 + Math.random() * 40,
                (Math.random() - 0.5) * 300
            );
            cloud.scale.set(2 + Math.random() * 2, 1 + Math.random() * 0.5, 2 + Math.random() * 2);
            cloudsGroup.add(cloud);
        }
        scene.add(cloudsGroup);
        lightsRef.current.clouds = cloudsGroup;

        // Ground with grass texture
        const groundGeometry = new THREE.PlaneGeometry(300, 300);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a9d2f, roughness: 0.8 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add buildings
        const house = createHouse();
        house.position.set(60, 0, -60);
        scene.add(house);

        const barn = createBarn();
        barn.position.set(-60, 0, -60);
        scene.add(barn);

        // Add silos
        const silo1 = createSilo();
        silo1.position.set(-50, 0, -40);
        scene.add(silo1);
        const silo2 = createSilo();
        silo2.position.set(-45, 0, -35);
        scene.add(silo2);

        // Add fences with trees
        const fenceLength = 150;

        const fence1 = createFence(fenceLength);
        fence1.position.set(0, 0, -75);
        scene.add(fence1);
        for (let i = -70; i <= 70; i += 15) {
            const tree = createTree();
            tree.position.set(i, 0, -80);
            scene.add(tree);
        }

        const fence2 = createFence(fenceLength);
        fence2.rotation.y = Math.PI / 2;
        fence2.position.set(-75, 0, 0);
        scene.add(fence2);
        for (let i = -70; i <= 70; i += 15) {
            const tree = createTree();
            tree.position.set(-80, 0, i);
            scene.add(tree);
        }

        const fence3 = createFence(fenceLength);
        fence3.position.set(0, 0, 75);
        scene.add(fence3);
        for (let i = -70; i <= 70; i += 15) {
            const tree = createTree();
            tree.position.set(i, 0, 80);
            scene.add(tree);
        }

        const fence4 = createFence(fenceLength);
        fence4.rotation.y = Math.PI / 2;
        fence4.position.set(75, 0, 0);
        scene.add(fence4);
        for (let i = -70; i <= 70; i += 15) {
            const tree = createTree();
            tree.position.set(80, 0, i);
            scene.add(tree);
        }

        // Add water troughs
        const water1 = createWaterTrough();
        water1.position.set(-20, 0, 10);
        scene.add(water1);
        const water2 = createWaterTrough();
        water2.position.set(20, 0, 15);
        scene.add(water2);

        // Add caretaker
        const caretaker = createCaretaker();
        caretaker.position.set(-40, 0, -30);
        scene.add(caretaker);
        caretakerRef.current = {
            obj: caretaker,
            direction: new THREE.Vector3(1, 0, 0),
            walkSpeed: 0.015,
            turnCooldown: 0
        };

        // Add animals based on farm state
        animalsRef.current = [];

        // Add cows
        const numCows = Math.min(state.cows, 5);
        for (let i = 0; i < numCows; i++) {
            const cow = createCow();
            cow.position.set(-30 + i * 15, 0, 20 + (i % 2) * 10);
            scene.add(cow);
            animalsRef.current.push({
                obj: cow,
                type: 'cow',
                direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                walkSpeed: 0.02,
                grazingTime: 0,
                isGrazing: Math.random() > 0.5,
                turnCooldown: 0
            });
        }

        // Add goats
        const numGoats = Math.min(state.goats, 8);
        for (let i = 0; i < numGoats; i++) {
            const goat = createGoat();
            goat.position.set(30 + (i % 3) * 10, 0, 20 + Math.floor(i / 3) * 10);
            scene.add(goat);
            animalsRef.current.push({
                obj: goat,
                type: 'goat',
                direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                walkSpeed: 0.025,
                grazingTime: 0,
                isGrazing: Math.random() > 0.5,
                turnCooldown: 0
            });
        }

        // Add hens
        const numHens = Math.min(state.hens, 10);
        for (let i = 0; i < numHens; i++) {
            const hen = createHen();
            hen.position.set((i % 5) * 8 - 16, 0, 30 + Math.floor(i / 5) * 6);
            scene.add(hen);
            animalsRef.current.push({
                obj: hen,
                type: 'hen',
                direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                walkSpeed: 0.015,
                grazingTime: 0,
                isGrazing: Math.random() > 0.5,
                turnCooldown: 0
            });
        }

        // Animation loop
        let lastTime = Date.now();
        const farmBoundary = 70;

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);

            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            // Update camera position
            if (cameraRef.current) {
                const { horizontal, vertical } = cameraAngleRef.current;
                const x = Math.sin(horizontal) * Math.cos(vertical) * cameraDistance;
                const y = Math.max(5, Math.sin(vertical) * cameraDistance);
                const z = Math.cos(horizontal) * Math.cos(vertical) * cameraDistance;
                cameraRef.current.position.set(x, y, z);
                cameraRef.current.lookAt(0, 5, 0);
            }

            // Update animals
            animalsRef.current.forEach(animal => {
                const userData = animal;
                const grazingDuration = 4;

                if (userData.isGrazing) {
                    userData.grazingTime += deltaTime;

                    // Head bobbing while grazing
                    const head = userData.obj.getObjectByName('head');
                    if (head) {
                        head.rotation.x = Math.sin(currentTime * 0.003) * 0.2;
                    }

                    // Tail wagging
                    const tail = userData.obj.getObjectByName('tail');
                    if (tail) {
                        tail.rotation.z = 0.3 + Math.sin(currentTime * 0.004) * 0.1;
                    }

                    if (userData.grazingTime > grazingDuration) {
                        userData.isGrazing = false;
                        userData.grazingTime = 0;
                        userData.turnCooldown = 0;
                        const angle = (Math.random() - 0.5) * Math.PI / 2;
                        userData.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                    }
                } else {
                    userData.turnCooldown -= deltaTime;

                    const moveX = userData.direction.x * userData.walkSpeed;
                    const moveZ = userData.direction.z * userData.walkSpeed;

                    userData.obj.position.x += moveX;
                    userData.obj.position.z += moveZ;

                    // Boundary check
                    if (Math.abs(userData.obj.position.x) > farmBoundary || Math.abs(userData.obj.position.z) > farmBoundary) {
                        userData.direction.multiplyScalar(-1);
                        userData.turnCooldown = 2;
                    }

                    // Random turning
                    if (userData.turnCooldown <= 0 && Math.random() < 0.02) {
                        const turnAngle = (Math.random() - 0.5) * Math.PI / 3;
                        userData.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);
                        userData.turnCooldown = 1;
                    }

                    // Face direction
                    const angle = Math.atan2(userData.direction.x, userData.direction.z);
                    userData.obj.rotation.y = angle;

                    // Leg animation
                    for (let i = 0; i < 4; i++) {
                        const leg = userData.obj.getObjectByName(`leg${i}`);
                        if (leg) {
                            leg.rotation.x = Math.sin(currentTime * 0.008 + i) * 0.3;
                        }
                    }

                    // Head bobbing
                    const head = userData.obj.getObjectByName('head');
                    if (head) {
                        const baseY = userData.type === 'hen' ? 1.1 : (userData.type === 'goat' ? 2.2 : 2.5);
                        head.position.y = baseY + Math.sin(currentTime * 0.006) * 0.1;
                    }

                    // Random grazing
                    if (Math.random() < 0.01) {
                        userData.isGrazing = true;
                        userData.grazingTime = 0;
                    }
                }
            });

            // Update caretaker
            if (caretakerRef.current) {
                const userData = caretakerRef.current;
                userData.turnCooldown -= deltaTime;

                const moveX = userData.direction.x * userData.walkSpeed;
                const moveZ = userData.direction.z * userData.walkSpeed;

                userData.obj.position.x += moveX;
                userData.obj.position.z += moveZ;

                if (Math.abs(userData.obj.position.x) > farmBoundary || Math.abs(userData.obj.position.z) > farmBoundary) {
                    userData.direction.multiplyScalar(-1);
                    userData.turnCooldown = 2;
                }

                if (userData.turnCooldown <= 0 && Math.random() < 0.015) {
                    const turnAngle = (Math.random() - 0.5) * Math.PI / 4;
                    userData.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);
                    userData.turnCooldown = 1.5;
                }

                const angle = Math.atan2(userData.direction.x, userData.direction.z);
                userData.obj.rotation.y = angle;

                // Arm swing
                const leftArm = userData.obj.getObjectByName('leftArm');
                const rightArm = userData.obj.getObjectByName('rightArm');
                if (leftArm && rightArm) {
                    leftArm.rotation.x = Math.sin(currentTime * 0.008) * 0.4;
                    rightArm.rotation.x = -Math.sin(currentTime * 0.008) * 0.4;
                }

                // Leg swing
                const leftLeg = userData.obj.getObjectByName('leftLeg');
                const rightLeg = userData.obj.getObjectByName('rightLeg');
                if (leftLeg && rightLeg) {
                    leftLeg.rotation.x = Math.sin(currentTime * 0.008) * 0.3;
                    rightLeg.rotation.x = -Math.sin(currentTime * 0.008) * 0.3;
                }
            }

            renderer.render(scene, camera);
            gl.endFrameEXP();
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state.hens, state.goats, state.cows, cameraDistance]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                lastTouchRef.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
            },
            onPanResponderMove: (evt) => {
                const dx = (evt.nativeEvent.pageX - lastTouchRef.current.x) * 0.01;
                const dy = (evt.nativeEvent.pageY - lastTouchRef.current.y) * 0.005;
                lastTouchRef.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };

                cameraAngleRef.current.horizontal += dx;
                cameraAngleRef.current.vertical = Math.max(0.1, Math.min(1.2, cameraAngleRef.current.vertical + dy));
            },
        })
    ).current;

    const handleZoomIn = () => setCameraDistance(prev => Math.max(20, prev - 10));
    const handleZoomOut = () => setCameraDistance(prev => Math.min(120, prev + 10));

    return (
        <View style={styles.container}>
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <GLView
                    ref={glRef}
                    style={{ flex: 1 }}
                    onContextCreate={onContextCreate}
                />
            </View>

            <SafeAreaView style={styles.uiOverlay} pointerEvents="box-none">
                {/* Header with Stats */}
                <View style={[styles.header, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>🌾 Advanced 3D Farm Scene</Text>
                        <Text style={[styles.title, { color: colors.text }]}>🏡 Your Farm</Text>
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
                        style={[styles.dayNightBtn, isNight && styles.dayNightBtnNight]}
                        onPress={() => setIsNight(!isNight)}
                    >
                        {isNight ? <Moon size={20} color="#FFD700" /> : <Sun size={20} color="#FFD700" />}
                        <Text style={[styles.dayNightText, isNight && styles.dayNightTextNight]}>
                            {isNight ? '🌙 Night' : '🌞 Day'}
                        </Text>
                    </TouchableOpacity>

                    {/* Zoom Controls */}
                    <View style={styles.zoomControls}>
                        <TouchableOpacity style={styles.controlBtn} onPress={handleZoomIn}>
                            <ZoomIn size={22} color="#4A7C23" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.controlBtn} onPress={handleZoomOut}>
                            <ZoomOut size={22} color="#4A7C23" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Controls hint */}
                <View style={styles.controlsHint}>
                    <Text style={styles.controlsHintText}>Swipe to Rotate | Buttons to Zoom</Text>
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
        backgroundColor: '#FFD700', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
    },
    dayNightBtnNight: {
        backgroundColor: '#1a1a2e',
    },
    dayNightText: { fontSize: 14, fontWeight: '700', color: '#333' },
    dayNightTextNight: { color: '#FFD700' },
    zoomControls: {
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    controlBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center', marginVertical: 3,
    },
    controlsHint: {
        position: 'absolute', bottom: 180, left: 0, right: 0,
        alignItems: 'center',
    },
    controlsHintText: {
        color: 'white', fontSize: 14, fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4,
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
