import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, Dimensions, Platform, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { useRouter } from 'expo-router';
import { Play, ZoomIn, ZoomOut, Sparkles, Sun, Moon, X, Volume2, VolumeX } from 'lucide-react-native';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import { FARM_3D_HTML } from '../../assets/farm3d_html';

// ============================================
// CREATE COW - Ultra Realistic with full details
// ============================================
function createCow(): THREE.Group {
    const cow = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.8 });
    const spotMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.6 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.4 });

    // Main Body - barrel shaped
    const bodyGeometry = new THREE.BoxGeometry(2.2, 2, 4.5);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2.2;
    body.castShadow = true;
    body.receiveShadow = true;
    cow.add(body);

    // Body underside (belly)
    const bellyGeometry = new THREE.BoxGeometry(1.8, 0.6, 3.8);
    const belly = new THREE.Mesh(bellyGeometry, bodyMaterial);
    belly.position.set(0, 1.1, 0);
    cow.add(belly);

    // Spots - more realistic pattern
    const spots = [
        { pos: [0.6, 2.8, 1.2], size: [0.8, 0.7, 0.4] },
        { pos: [-0.8, 2.5, -0.3], size: [1.0, 0.8, 0.4] },
        { pos: [0.4, 2.3, -1.8], size: [0.7, 0.6, 0.4] },
        { pos: [-0.5, 2.9, 0.8], size: [0.5, 0.5, 0.4] },
        { pos: [0.7, 1.8, -0.8], size: [0.6, 0.5, 0.4] },
        { pos: [-0.3, 2.1, 1.5], size: [0.9, 0.7, 0.4] }
    ];
    spots.forEach(spot => {
        const spotGeo = new THREE.BoxGeometry(spot.size[0], spot.size[1], spot.size[2]);
        const spotMesh = new THREE.Mesh(spotGeo, spotMaterial);
        spotMesh.position.set(spot.pos[0], spot.pos[1], spot.pos[2]);
        spotMesh.castShadow = true;
        cow.add(spotMesh);
    });

    // Neck
    const neckGeometry = new THREE.BoxGeometry(1.0, 1.2, 1.0);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.set(0, 2.8, 2.2);
    neck.rotation.x = -0.2;
    cow.add(neck);

    // Head - more detailed
    const headGeometry = new THREE.BoxGeometry(1.3, 1.3, 1.6);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2.8, 3.0);
    head.castShadow = true;
    head.name = 'head';
    cow.add(head);

    // Face spot on head
    const faceSpot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.3), spotMaterial);
    faceSpot.position.set(-0.2, 3.1, 3.5);
    cow.add(faceSpot);

    // Snout/Muzzle - larger and pink
    const snoutGeometry = new THREE.BoxGeometry(1.0, 0.7, 0.5);
    const snout = new THREE.Mesh(snoutGeometry, pinkMaterial);
    snout.position.set(0, 2.4, 3.7);
    cow.add(snout);

    // Nostrils
    const nostrilGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const nostril1 = new THREE.Mesh(nostrilGeometry, darkMaterial);
    nostril1.position.set(0.25, 2.5, 3.95);
    cow.add(nostril1);
    const nostril2 = nostril1.clone();
    nostril2.position.x = -0.25;
    cow.add(nostril2);

    // Eyes - with pupils
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.18, 12, 12);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyePupilGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x1a0a00 });

    // Right eye
    const eyeWhite1 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite1.position.set(0.5, 3.0, 3.4);
    cow.add(eyeWhite1);
    const eyePupil1 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil1.position.set(0.5, 3.0, 3.55);
    cow.add(eyePupil1);

    // Left eye
    const eyeWhite2 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite2.position.set(-0.5, 3.0, 3.4);
    cow.add(eyeWhite2);
    const eyePupil2 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil2.position.set(-0.5, 3.0, 3.55);
    cow.add(eyePupil2);

    // Horns - curved
    const hornGeometry = new THREE.ConeGeometry(0.12, 0.7, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.5 });
    const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
    horn1.position.set(0.5, 3.6, 2.8);
    horn1.rotation.z = 0.4;
    horn1.rotation.x = -0.2;
    cow.add(horn1);
    const horn2 = horn1.clone();
    horn2.position.x = -0.5;
    horn2.rotation.z = -0.4;
    cow.add(horn2);

    // Ears - floppy
    const earGeometry = new THREE.BoxGeometry(0.15, 0.25, 0.5);
    const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
    ear1.position.set(0.65, 3.1, 2.6);
    ear1.rotation.z = 0.8;
    ear1.rotation.y = 0.3;
    cow.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = -0.65;
    ear2.rotation.z = -0.8;
    ear2.rotation.y = -0.3;
    cow.add(ear2);

    // Ear inner pink
    const earInnerGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.35);
    const earInner1 = new THREE.Mesh(earInnerGeometry, pinkMaterial);
    earInner1.position.set(0.65, 3.1, 2.65);
    earInner1.rotation.z = 0.8;
    cow.add(earInner1);
    const earInner2 = earInner1.clone();
    earInner2.position.x = -0.65;
    earInner2.rotation.z = -0.8;
    cow.add(earInner2);

    // Legs with joints and hooves
    const upperLegGeometry = new THREE.BoxGeometry(0.45, 1.2, 0.45);
    const lowerLegGeometry = new THREE.BoxGeometry(0.35, 1.0, 0.35);
    const hoofGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.45);

    const legPositions = [
        { upper: [-0.7, 1.5, 1.5], lower: [-0.7, 0.6, 1.5], hoof: [-0.7, 0.12, 1.5] },
        { upper: [0.7, 1.5, 1.5], lower: [0.7, 0.6, 1.5], hoof: [0.7, 0.12, 1.5] },
        { upper: [-0.7, 1.5, -1.5], lower: [-0.7, 0.6, -1.5], hoof: [-0.7, 0.12, -1.5] },
        { upper: [0.7, 1.5, -1.5], lower: [0.7, 0.6, -1.5], hoof: [0.7, 0.12, -1.5] }
    ];

    legPositions.forEach((pos, idx) => {
        const upperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
        upperLeg.position.set(pos.upper[0], pos.upper[1], pos.upper[2]);
        upperLeg.castShadow = true;
        cow.add(upperLeg);

        const lowerLeg = new THREE.Mesh(lowerLegGeometry, bodyMaterial);
        lowerLeg.position.set(pos.lower[0], pos.lower[1], pos.lower[2]);
        lowerLeg.castShadow = true;
        lowerLeg.name = `leg${idx}`;
        cow.add(lowerLeg);

        const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
        hoof.position.set(pos.hoof[0], pos.hoof[1], pos.hoof[2]);
        hoof.castShadow = true;
        cow.add(hoof);
    });

    // Udder
    const udderGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const udder = new THREE.Mesh(udderGeometry, pinkMaterial);
    udder.position.set(0, 0.9, -0.8);
    udder.scale.set(1, 0.8, 1.2);
    cow.add(udder);

    // Teats
    const teatGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8);
    const teatPositions = [[-0.15, 0.55, -0.65], [0.15, 0.55, -0.65], [-0.15, 0.55, -0.95], [0.15, 0.55, -0.95]];
    teatPositions.forEach(pos => {
        const teat = new THREE.Mesh(teatGeometry, pinkMaterial);
        teat.position.set(pos[0], pos[1], pos[2]);
        cow.add(teat);
    });

    // Tail - with tuft
    const tailGeometry = new THREE.BoxGeometry(0.12, 1.6, 0.12);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 1.8, -2.3);
    tail.rotation.x = 0.3;
    tail.name = 'tail';
    cow.add(tail);

    // Tail tuft
    const tuftGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const tuft = new THREE.Mesh(tuftGeometry, spotMaterial);
    tuft.position.set(0, 0.9, -2.5);
    cow.add(tuft);

    return cow;
}

// ============================================
// CREATE GOAT - Ultra Realistic with full details
// ============================================
function createGoat(): THREE.Group {
    const goat = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a87c, roughness: 0.9 });
    const darkFurMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3 });
    const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.4 });
    const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.6 });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Goat eyes are golden

    // Main Body
    const bodyGeometry = new THREE.BoxGeometry(1.4, 1.5, 2.8);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.6;
    body.castShadow = true;
    body.receiveShadow = true;
    goat.add(body);

    // Chest - front of body
    const chestGeometry = new THREE.BoxGeometry(1.2, 1.3, 0.8);
    const chest = new THREE.Mesh(chestGeometry, bodyMaterial);
    chest.position.set(0, 1.7, 1.2);
    goat.add(chest);

    // Neck
    const neckGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.7);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.set(0, 2.4, 1.5);
    neck.rotation.x = -0.3;
    goat.add(neck);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.9, 1.0, 1.2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2.5, 2.0);
    head.castShadow = true;
    head.name = 'head';
    goat.add(head);

    // Snout/Muzzle
    const snoutGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.6);
    const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
    snout.position.set(0, 2.2, 2.5);
    goat.add(snout);

    // Nose
    const noseGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.15);
    const nose = new THREE.Mesh(noseGeometry, pinkMaterial);
    nose.position.set(0, 2.15, 2.8);
    goat.add(nose);

    // Nostrils
    const nostrilGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const nostrilMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const nostril1 = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
    nostril1.position.set(0.1, 2.15, 2.88);
    goat.add(nostril1);
    const nostril2 = nostril1.clone();
    nostril2.position.x = -0.1;
    goat.add(nostril2);

    // Eyes - horizontal rectangular pupils like real goats
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.14, 12, 12);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyePupilGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.05);
    const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // Right eye
    const eyeWhite1 = new THREE.Mesh(eyeWhiteGeometry, eyeMaterial);
    eyeWhite1.position.set(0.35, 2.65, 2.35);
    goat.add(eyeWhite1);
    const eyePupil1 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil1.position.set(0.35, 2.65, 2.45);
    goat.add(eyePupil1);

    // Left eye
    const eyeWhite2 = new THREE.Mesh(eyeWhiteGeometry, eyeMaterial);
    eyeWhite2.position.set(-0.35, 2.65, 2.35);
    goat.add(eyeWhite2);
    const eyePupil2 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil2.position.set(-0.35, 2.65, 2.45);
    goat.add(eyePupil2);

    // Beard - multiple strands
    const beardMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 1 });
    const beardGeometry1 = new THREE.BoxGeometry(0.15, 0.5, 0.1);
    const beard1 = new THREE.Mesh(beardGeometry1, beardMaterial);
    beard1.position.set(0, 1.85, 2.45);
    goat.add(beard1);
    const beard2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.08), beardMaterial);
    beard2.position.set(0.1, 1.9, 2.4);
    goat.add(beard2);
    const beard3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.08), beardMaterial);
    beard3.position.set(-0.1, 1.95, 2.4);
    goat.add(beard3);

    // Horns - curved backwards
    const horn1 = new THREE.Group();
    const hornSegment1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 8), hornMaterial);
    hornSegment1.position.y = 0.25;
    horn1.add(hornSegment1);
    const hornSegment2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 8), hornMaterial);
    hornSegment2.position.set(0, 0.55, -0.15);
    hornSegment2.rotation.x = 0.5;
    horn1.add(hornSegment2);
    horn1.position.set(0.3, 3.0, 1.8);
    horn1.rotation.z = 0.3;
    horn1.rotation.x = -0.3;
    goat.add(horn1);

    const horn2 = horn1.clone();
    horn2.position.x = -0.3;
    horn2.rotation.z = -0.3;
    goat.add(horn2);

    // Ears - floppy
    const earGeometry = new THREE.BoxGeometry(0.12, 0.2, 0.4);
    const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
    ear1.position.set(0.45, 2.7, 1.85);
    ear1.rotation.z = 1.0;
    ear1.rotation.y = 0.3;
    goat.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = -0.45;
    ear2.rotation.z = -1.0;
    ear2.rotation.y = -0.3;
    goat.add(ear2);

    // Legs with hooves
    const upperLegGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const lowerLegGeometry = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const hoofGeometry = new THREE.BoxGeometry(0.25, 0.2, 0.3);

    const legPositions = [
        { upper: [-0.4, 1.0, 1.0], lower: [-0.4, 0.4, 1.0], hoof: [-0.4, 0.1, 1.0] },
        { upper: [0.4, 1.0, 1.0], lower: [0.4, 0.4, 1.0], hoof: [0.4, 0.1, 1.0] },
        { upper: [-0.4, 1.0, -1.0], lower: [-0.4, 0.4, -1.0], hoof: [-0.4, 0.1, -1.0] },
        { upper: [0.4, 1.0, -1.0], lower: [0.4, 0.4, -1.0], hoof: [0.4, 0.1, -1.0] }
    ];

    legPositions.forEach((pos, idx) => {
        const upperLeg = new THREE.Mesh(upperLegGeometry, bodyMaterial);
        upperLeg.position.set(pos.upper[0], pos.upper[1], pos.upper[2]);
        upperLeg.castShadow = true;
        goat.add(upperLeg);

        const lowerLeg = new THREE.Mesh(lowerLegGeometry, darkFurMaterial);
        lowerLeg.position.set(pos.lower[0], pos.lower[1], pos.lower[2]);
        lowerLeg.castShadow = true;
        lowerLeg.name = `leg${idx}`;
        goat.add(lowerLeg);

        const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
        hoof.position.set(pos.hoof[0], pos.hoof[1], pos.hoof[2]);
        hoof.castShadow = true;
        goat.add(hoof);
    });

    // Tail - short and upturned
    const tailGeometry = new THREE.BoxGeometry(0.12, 0.35, 0.1);
    const tail = new THREE.Mesh(tailGeometry, darkFurMaterial);
    tail.position.set(0, 1.9, -1.4);
    tail.rotation.x = -0.5;
    tail.name = 'tail';
    goat.add(tail);

    return goat;
}

// ============================================
// CREATE HEN - Ultra Realistic with feathers
// ============================================
function createHen(): THREE.Group {
    const hen = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc94420, roughness: 0.8 });
    const breastMaterial = new THREE.MeshStandardMaterial({ color: 0xd4633e, roughness: 0.8 });
    const combMaterial = new THREE.MeshStandardMaterial({ color: 0xff2222, roughness: 0.5 });
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xf5a623, roughness: 0.4 });
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xf5b342, roughness: 0.5 });
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.7 });
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xa83820, roughness: 0.8 });

    // Main Body - plump
    const bodyGeometry = new THREE.SphereGeometry(0.45, 16, 16);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    body.scale.set(1, 1.1, 1.4);
    body.castShadow = true;
    body.receiveShadow = true;
    hen.add(body);

    // Breast - lighter colored
    const breastGeometry = new THREE.SphereGeometry(0.35, 12, 12);
    const breast = new THREE.Mesh(breastGeometry, breastMaterial);
    breast.position.set(0, 0.6, 0.25);
    breast.scale.set(0.8, 0.9, 0.6);
    hen.add(breast);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.3, 12);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.set(0, 1.0, 0.35);
    hen.add(neck);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.22, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.25, 0.45);
    head.castShadow = true;
    head.name = 'head';
    hen.add(head);

    // Eyes
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.06, 10, 10);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyePupilGeometry = new THREE.SphereGeometry(0.035, 8, 8);
    const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const eyeIrisGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    const eyeIrisMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // Orange iris

    // Right eye
    const eyeWhite1 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite1.position.set(0.1, 1.3, 0.6);
    hen.add(eyeWhite1);
    const eyeIris1 = new THREE.Mesh(eyeIrisGeometry, eyeIrisMaterial);
    eyeIris1.position.set(0.1, 1.3, 0.65);
    hen.add(eyeIris1);
    const eyePupil1 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil1.position.set(0.1, 1.3, 0.68);
    hen.add(eyePupil1);

    // Left eye
    const eyeWhite2 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite2.position.set(-0.1, 1.3, 0.6);
    hen.add(eyeWhite2);
    const eyeIris2 = new THREE.Mesh(eyeIrisGeometry, eyeIrisMaterial);
    eyeIris2.position.set(-0.1, 1.3, 0.65);
    hen.add(eyeIris2);
    const eyePupil2 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil2.position.set(-0.1, 1.3, 0.68);
    hen.add(eyePupil2);

    // Comb - multi-part
    const comb1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.08), combMaterial);
    comb1.position.set(0, 1.5, 0.43);
    hen.add(comb1);
    const comb2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.08), combMaterial);
    comb2.position.set(0, 1.48, 0.35);
    hen.add(comb2);
    const comb3 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.08), combMaterial);
    comb3.position.set(0, 1.45, 0.28);
    hen.add(comb3);

    // Beak - upper and lower
    const upperBeakGeometry = new THREE.BoxGeometry(0.1, 0.06, 0.18);
    const upperBeak = new THREE.Mesh(upperBeakGeometry, beakMaterial);
    upperBeak.position.set(0, 1.22, 0.7);
    hen.add(upperBeak);
    const lowerBeakGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.12);
    const lowerBeak = new THREE.Mesh(lowerBeakGeometry, beakMaterial);
    lowerBeak.position.set(0, 1.17, 0.68);
    hen.add(lowerBeak);

    // Wattle - two parts
    const wattle1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), combMaterial);
    wattle1.position.set(0.03, 1.1, 0.6);
    wattle1.scale.set(1, 1.5, 1);
    hen.add(wattle1);
    const wattle2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), combMaterial);
    wattle2.position.set(-0.03, 1.08, 0.58);
    wattle2.scale.set(1, 1.3, 1);
    hen.add(wattle2);

    // Wings - layered feathers
    const wing1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.35), wingMaterial);
    wing1.position.set(0.4, 0.7, 0.05);
    wing1.rotation.z = -0.2;
    hen.add(wing1);
    const wing1b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.28), bodyMaterial);
    wing1b.position.set(0.42, 0.65, 0.05);
    wing1b.rotation.z = -0.2;
    hen.add(wing1b);

    const wing2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.35), wingMaterial);
    wing2.position.set(-0.4, 0.7, 0.05);
    wing2.rotation.z = 0.2;
    hen.add(wing2);
    const wing2b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.28), bodyMaterial);
    wing2b.position.set(-0.42, 0.65, 0.05);
    wing2b.rotation.z = 0.2;
    hen.add(wing2b);

    // Tail feathers - multiple
    const tailPositions = [
        { pos: [0, 0.95, -0.5], rot: [-0.8, 0, 0], size: [0.05, 0.35, 0.15] },
        { pos: [0.08, 0.9, -0.45], rot: [-0.7, 0.2, 0.1], size: [0.04, 0.3, 0.12] },
        { pos: [-0.08, 0.9, -0.45], rot: [-0.7, -0.2, -0.1], size: [0.04, 0.3, 0.12] },
        { pos: [0.05, 0.85, -0.4], rot: [-0.6, 0.1, 0.05], size: [0.04, 0.25, 0.1] },
        { pos: [-0.05, 0.85, -0.4], rot: [-0.6, -0.1, -0.05], size: [0.04, 0.25, 0.1] }
    ];
    tailPositions.forEach(t => {
        const feather = new THREE.Mesh(new THREE.BoxGeometry(t.size[0], t.size[1], t.size[2]), tailMaterial);
        feather.position.set(t.pos[0], t.pos[1], t.pos[2]);
        feather.rotation.set(t.rot[0], t.rot[1], t.rot[2]);
        feather.name = 'tail';
        hen.add(feather);
    });

    // Legs - skinny with joints
    const thighGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8);
    const shinGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.25, 8);
    const footGeometry = new THREE.BoxGeometry(0.12, 0.04, 0.15);

    // Right leg
    const thigh1 = new THREE.Mesh(thighGeometry, legMaterial);
    thigh1.position.set(0.12, 0.35, 0);
    hen.add(thigh1);
    const shin1 = new THREE.Mesh(shinGeometry, legMaterial);
    shin1.position.set(0.12, 0.15, 0.03);
    shin1.name = 'leg0';
    hen.add(shin1);
    const foot1 = new THREE.Mesh(footGeometry, legMaterial);
    foot1.position.set(0.12, 0.02, 0.05);
    hen.add(foot1);

    // Left leg
    const thigh2 = new THREE.Mesh(thighGeometry, legMaterial);
    thigh2.position.set(-0.12, 0.35, 0);
    hen.add(thigh2);
    const shin2 = new THREE.Mesh(shinGeometry, legMaterial);
    shin2.position.set(-0.12, 0.15, 0.03);
    shin2.name = 'leg1';
    hen.add(shin2);
    const foot2 = new THREE.Mesh(footGeometry, legMaterial);
    foot2.position.set(-0.12, 0.02, 0.05);
    hen.add(foot2);

    // Toes
    const toeGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.08);
    [-1, 0, 1].forEach(offset => {
        const toe1 = new THREE.Mesh(toeGeometry, legMaterial);
        toe1.position.set(0.12 + offset * 0.04, 0.01, 0.12);
        hen.add(toe1);
        const toe2 = new THREE.Mesh(toeGeometry, legMaterial);
        toe2.position.set(-0.12 + offset * 0.04, 0.01, 0.12);
        hen.add(toe2);
    });

    return hen;
}

// ============================================
// CREATE CARETAKER (FARMER) - Ultra Realistic
// ============================================
function createCaretaker(): THREE.Group {
    const caretaker = new THREE.Group();

    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.7 });
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.8 }); // Green plaid shirt
    const overallsMaterial = new THREE.MeshStandardMaterial({ color: 0x3d5c8a, roughness: 0.8 }); // Blue denim
    const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.6 });
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.7 }); // Straw hat
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(1.6, 2.0, 0.9);
    const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
    torso.position.y = 2.5;
    torso.castShadow = true;
    caretaker.add(torso);

    // Shirt collar
    const collarGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.3);
    const collar = new THREE.Mesh(collarGeometry, shirtMaterial);
    collar.position.set(0, 3.55, 0.3);
    caretaker.add(collar);

    // Overalls bib
    const bibGeometry = new THREE.BoxGeometry(0.9, 0.8, 0.15);
    const bib = new THREE.Mesh(bibGeometry, overallsMaterial);
    bib.position.set(0, 2.9, 0.5);
    caretaker.add(bib);

    // Overall straps
    const strapGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.08);
    const strap1 = new THREE.Mesh(strapGeometry, overallsMaterial);
    strap1.position.set(0.3, 2.9, 0.45);
    caretaker.add(strap1);
    const strap2 = strap1.clone();
    strap2.position.x = -0.3;
    caretaker.add(strap2);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 20, 20);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 4.0, 0);
    head.castShadow = true;
    head.name = 'head';
    caretaker.add(head);

    // Hair - back
    const hairBackGeometry = new THREE.SphereGeometry(0.52, 16, 16);
    const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
    hairBack.position.set(0, 4.1, -0.15);
    hairBack.scale.set(1, 0.8, 0.8);
    caretaker.add(hairBack);

    // Ears
    const earGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const ear1 = new THREE.Mesh(earGeometry, skinMaterial);
    ear1.position.set(0.5, 4.0, 0);
    ear1.scale.set(0.6, 1, 0.8);
    caretaker.add(ear1);
    const ear2 = ear1.clone();
    ear2.position.x = -0.5;
    caretaker.add(ear2);

    // Eyes
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyePupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyePupilMaterial = new THREE.MeshStandardMaterial({ color: 0x2d1810 });
    const eyeIrisGeometry = new THREE.SphereGeometry(0.07, 8, 8);
    const eyeIrisMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90d9 }); // Blue eyes

    // Right eye
    const eyeWhite1 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite1.position.set(0.18, 4.1, 0.4);
    caretaker.add(eyeWhite1);
    const eyeIris1 = new THREE.Mesh(eyeIrisGeometry, eyeIrisMaterial);
    eyeIris1.position.set(0.18, 4.1, 0.48);
    caretaker.add(eyeIris1);
    const eyePupil1 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil1.position.set(0.18, 4.1, 0.53);
    caretaker.add(eyePupil1);

    // Left eye
    const eyeWhite2 = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeWhite2.position.set(-0.18, 4.1, 0.4);
    caretaker.add(eyeWhite2);
    const eyeIris2 = new THREE.Mesh(eyeIrisGeometry, eyeIrisMaterial);
    eyeIris2.position.set(-0.18, 4.1, 0.48);
    caretaker.add(eyeIris2);
    const eyePupil2 = new THREE.Mesh(eyePupilGeometry, eyePupilMaterial);
    eyePupil2.position.set(-0.18, 4.1, 0.53);
    caretaker.add(eyePupil2);

    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.18, 0.05, 0.06);
    const eyebrowMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const eyebrow1 = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    eyebrow1.position.set(0.18, 4.25, 0.42);
    eyebrow1.rotation.z = -0.1;
    caretaker.add(eyebrow1);
    const eyebrow2 = eyebrow1.clone();
    eyebrow2.position.x = -0.18;
    eyebrow2.rotation.z = 0.1;
    caretaker.add(eyebrow2);

    // Nose
    const noseGeometry = new THREE.BoxGeometry(0.12, 0.18, 0.15);
    const nose = new THREE.Mesh(noseGeometry, skinMaterial);
    nose.position.set(0, 3.95, 0.5);
    caretaker.add(nose);

    // Smile
    const smileGeometry = new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI);
    const smileMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const smile = new THREE.Mesh(smileGeometry, smileMaterial);
    smile.position.set(0, 3.75, 0.48);
    smile.rotation.x = Math.PI;
    caretaker.add(smile);

    // Straw Hat
    const hatBrimGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 24);
    const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
    hatBrim.position.set(0, 4.5, 0);
    caretaker.add(hatBrim);
    const hatTopGeometry = new THREE.CylinderGeometry(0.45, 0.55, 0.5, 16);
    const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
    hatTop.position.set(0, 4.8, 0);
    caretaker.add(hatTop);
    // Hat band
    const hatBandGeometry = new THREE.CylinderGeometry(0.56, 0.56, 0.1, 16);
    const hatBandMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const hatBand = new THREE.Mesh(hatBandGeometry, hatBandMaterial);
    hatBand.position.set(0, 4.6, 0);
    caretaker.add(hatBand);

    // Arms with sleeves
    const upperArmGeometry = new THREE.BoxGeometry(0.4, 0.9, 0.4);
    const lowerArmGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const handGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.15);

    // Right arm
    const upperArm1 = new THREE.Mesh(upperArmGeometry, shirtMaterial);
    upperArm1.position.set(1.0, 2.8, 0);
    upperArm1.castShadow = true;
    caretaker.add(upperArm1);
    const lowerArm1 = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    lowerArm1.position.set(1.0, 2.0, 0);
    lowerArm1.castShadow = true;
    lowerArm1.name = 'rightArm';
    caretaker.add(lowerArm1);
    const hand1 = new THREE.Mesh(handGeometry, skinMaterial);
    hand1.position.set(1.0, 1.5, 0);
    caretaker.add(hand1);

    // Left arm
    const upperArm2 = new THREE.Mesh(upperArmGeometry, shirtMaterial);
    upperArm2.position.set(-1.0, 2.8, 0);
    upperArm2.castShadow = true;
    caretaker.add(upperArm2);
    const lowerArm2 = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    lowerArm2.position.set(-1.0, 2.0, 0);
    lowerArm2.castShadow = true;
    lowerArm2.name = 'leftArm';
    caretaker.add(lowerArm2);
    const hand2 = new THREE.Mesh(handGeometry, skinMaterial);
    hand2.position.set(-1.0, 1.5, 0);
    caretaker.add(hand2);

    // Legs with overalls
    const upperLegGeometry = new THREE.BoxGeometry(0.5, 1.0, 0.5);
    const lowerLegGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
    const bootGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.6);

    // Right leg
    const upperLeg1 = new THREE.Mesh(upperLegGeometry, overallsMaterial);
    upperLeg1.position.set(0.4, 1.0, 0);
    upperLeg1.castShadow = true;
    caretaker.add(upperLeg1);
    const lowerLeg1 = new THREE.Mesh(lowerLegGeometry, overallsMaterial);
    lowerLeg1.position.set(0.4, 0.4, 0);
    lowerLeg1.castShadow = true;
    lowerLeg1.name = 'rightLeg';
    caretaker.add(lowerLeg1);
    const boot1 = new THREE.Mesh(bootGeometry, bootMaterial);
    boot1.position.set(0.4, 0.2, 0.05);
    boot1.castShadow = true;
    caretaker.add(boot1);

    // Left leg
    const upperLeg2 = new THREE.Mesh(upperLegGeometry, overallsMaterial);
    upperLeg2.position.set(-0.4, 1.0, 0);
    upperLeg2.castShadow = true;
    caretaker.add(upperLeg2);
    const lowerLeg2 = new THREE.Mesh(lowerLegGeometry, overallsMaterial);
    lowerLeg2.position.set(-0.4, 0.4, 0);
    lowerLeg2.castShadow = true;
    lowerLeg2.name = 'leftLeg';
    caretaker.add(lowerLeg2);
    const boot2 = new THREE.Mesh(bootGeometry, bootMaterial);
    boot2.position.set(-0.4, 0.2, 0.05);
    boot2.castShadow = true;
    caretaker.add(boot2);

    return caretaker;
}

// ============================================
// CREATE HOUSE - Ultra Realistic with details
// ============================================
function createHouse(): THREE.Group {
    const house = new THREE.Group();

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.8 }); // Cream colored walls
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.7 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.2, metalness: 0.1 });
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    const shutterMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });
    const brickMaterial = new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.9 });

    // Main walls
    const wallGeometry = new THREE.BoxGeometry(10, 7, 12);
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 3.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(11, 0.6, 13);
    const foundationMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.3;
    house.add(foundation);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(8, 4.5, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Roof edge trim
    const trimGeometry = new THREE.BoxGeometry(11.5, 0.3, 13.5);
    const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const trim = new THREE.Mesh(trimGeometry, trimMaterial);
    trim.position.y = 7.15;
    house.add(trim);

    // Door
    const doorGeometry = new THREE.BoxGeometry(2, 3.5, 0.25);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.25, 6.1);
    house.add(door);

    // Door frame
    const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.3), frameMaterial);
    doorFrameTop.position.set(0, 4.05, 6.1);
    house.add(doorFrameTop);
    const doorFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.3), frameMaterial);
    doorFrameLeft.position.set(-1.1, 2.25, 6.1);
    house.add(doorFrameLeft);
    const doorFrameRight = doorFrameLeft.clone();
    doorFrameRight.position.x = 1.1;
    house.add(doorFrameRight);

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.7, 2.3, 6.25);
    house.add(handle);

    // Windows with shutters
    const windowPositions = [
        { x: -2.8, y: 4.5, z: 6.05 },
        { x: 2.8, y: 4.5, z: 6.05 },
        { x: 5.05, y: 4.5, z: 0 },
        { x: -5.05, y: 4.5, z: 0 }
    ];

    windowPositions.forEach((pos, idx) => {
        // Window glass
        const windowGeom = new THREE.BoxGeometry(1.4, 1.6, 0.15);
        const win = new THREE.Mesh(windowGeom, windowMaterial);
        win.position.set(pos.x, pos.y, pos.z);
        if (idx >= 2) win.rotation.y = Math.PI / 2;
        house.add(win);

        // Window frame
        const frameGeom = new THREE.BoxGeometry(1.6, 1.8, 0.2);
        const frame = new THREE.Mesh(frameGeom, frameMaterial);
        frame.position.set(pos.x, pos.y, pos.z - 0.05);
        if (idx >= 2) frame.rotation.y = Math.PI / 2;
        house.add(frame);

        // Window cross
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.18), frameMaterial);
        crossH.position.set(pos.x, pos.y, pos.z + 0.02);
        if (idx >= 2) crossH.rotation.y = Math.PI / 2;
        house.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.18), frameMaterial);
        crossV.position.set(pos.x, pos.y, pos.z + 0.02);
        if (idx >= 2) crossV.rotation.y = Math.PI / 2;
        house.add(crossV);

        // Shutters (only for front windows)
        if (idx < 2) {
            const shutterGeom = new THREE.BoxGeometry(0.6, 1.6, 0.15);
            const shutterL = new THREE.Mesh(shutterGeom, shutterMaterial);
            shutterL.position.set(pos.x - 1.0, pos.y, pos.z);
            house.add(shutterL);
            const shutterR = new THREE.Mesh(shutterGeom, shutterMaterial);
            shutterR.position.set(pos.x + 1.0, pos.y, pos.z);
            house.add(shutterR);

            // Flower box
            const flowerBoxGeom = new THREE.BoxGeometry(1.6, 0.3, 0.4);
            const flowerBoxMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const flowerBox = new THREE.Mesh(flowerBoxGeom, flowerBoxMat);
            flowerBox.position.set(pos.x, pos.y - 1.05, pos.z + 0.2);
            house.add(flowerBox);

            // Flowers
            const flowerColors = [0xff69b4, 0xff6347, 0xffd700, 0xff1493];
            for (let f = 0; f < 4; f++) {
                const flowerGeom = new THREE.SphereGeometry(0.15, 8, 8);
                const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColors[f % 4] });
                const flower = new THREE.Mesh(flowerGeom, flowerMat);
                flower.position.set(pos.x - 0.5 + f * 0.35, pos.y - 0.85, pos.z + 0.25);
                house.add(flower);
            }
        }
    });

    // Chimney with brick detail
    const chimneyGeometry = new THREE.BoxGeometry(1.2, 4, 1.2);
    const chimney = new THREE.Mesh(chimneyGeometry, brickMaterial);
    chimney.position.set(3, 8, -3);
    chimney.castShadow = true;
    house.add(chimney);
    // Chimney top
    const chimneyTopGeom = new THREE.BoxGeometry(1.5, 0.3, 1.5);
    const chimneyTop = new THREE.Mesh(chimneyTopGeom, brickMaterial);
    chimneyTop.position.set(3, 10.15, -3);
    house.add(chimneyTop);

    // Porch
    const porchFloorGeom = new THREE.BoxGeometry(6, 0.3, 3);
    const porchMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8 });
    const porchFloor = new THREE.Mesh(porchFloorGeom, porchMaterial);
    porchFloor.position.set(0, 0.45, 7.5);
    house.add(porchFloor);

    // Porch steps
    for (let s = 0; s < 3; s++) {
        const stepGeom = new THREE.BoxGeometry(3, 0.2, 0.5);
        const step = new THREE.Mesh(stepGeom, porchMaterial);
        step.position.set(0, 0.1 + s * 0.15, 9 + (2 - s) * 0.4);
        house.add(step);
    }

    // Porch roof
    const porchRoofGeom = new THREE.BoxGeometry(6.5, 0.2, 3.5);
    const porchRoof = new THREE.Mesh(porchRoofGeom, roofMaterial);
    porchRoof.position.set(0, 4.2, 7.5);
    house.add(porchRoof);

    // Porch pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.25, 3.7, 12);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    [[-2.5, 7.5], [2.5, 7.5], [-2.5, 9], [2.5, 9]].forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(pos[0], 2.3, pos[1]);
        pillar.castShadow = true;
        house.add(pillar);
    });

    // Potted plants on porch
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0xcd853f });
    const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    [[-2, 7], [2, 7]].forEach(pos => {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 8), potMaterial);
        pot.position.set(pos[0], 0.85, pos[1]);
        house.add(pot);
        const plant = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), plantMaterial);
        plant.position.set(pos[0], 1.3, pos[1]);
        house.add(plant);
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
// CREATE TREE - Ultra Realistic with layers
// ============================================
function createTree(): THREE.Group {
    const tree = new THREE.Group();

    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const barkMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2e1f, roughness: 1 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d7d32, roughness: 0.8 });
    const foliageLightMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.7 });
    const foliageDarkMaterial = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.9 });

    // Main trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6, 12);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    tree.add(trunk);

    // Bark texture details
    for (let i = 0; i < 8; i++) {
        const barkGeometry = new THREE.BoxGeometry(0.15, 1.5 + Math.random(), 0.1);
        const bark = new THREE.Mesh(barkGeometry, barkMaterial);
        const angle = (i / 8) * Math.PI * 2;
        bark.position.set(
            Math.cos(angle) * 0.6,
            2 + Math.random() * 2,
            Math.sin(angle) * 0.6
        );
        bark.rotation.y = angle;
        tree.add(bark);
    }

    // Branches
    const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const branchPositions = [
        { pos: [0.8, 4.5, 0], rot: [0, 0, 0.7], len: 2 },
        { pos: [-0.6, 5, 0.5], rot: [0.3, 0.5, -0.8], len: 1.8 },
        { pos: [0.3, 5.5, -0.7], rot: [-0.4, 0, 0.6], len: 1.5 },
        { pos: [-0.5, 4, -0.3], rot: [-0.2, -0.3, -0.6], len: 1.6 }
    ];
    branchPositions.forEach(b => {
        const branchGeometry = new THREE.CylinderGeometry(0.08, 0.15, b.len, 6);
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);
        branch.position.set(b.pos[0], b.pos[1], b.pos[2]);
        branch.rotation.set(b.rot[0], b.rot[1], b.rot[2]);
        branch.castShadow = true;
        tree.add(branch);
    });

    // Foliage - multiple layers for realistic look
    // Main center foliage
    const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 12), foliageMaterial);
    foliage1.position.set(0, 7, 0);
    foliage1.castShadow = true;
    tree.add(foliage1);

    // Upper foliage (lighter)
    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 10, 10), foliageLightMaterial);
    foliage2.position.set(0.5, 8.5, 0.3);
    foliage2.castShadow = true;
    tree.add(foliage2);

    // Side foliage clusters (darker)
    const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 10), foliageDarkMaterial);
    foliage3.position.set(-1.5, 6.5, 1);
    tree.add(foliage3);

    const foliage4 = new THREE.Mesh(new THREE.SphereGeometry(2, 10, 10), foliageMaterial);
    foliage4.position.set(1.5, 6.8, -0.8);
    tree.add(foliage4);

    const foliage5 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), foliageLightMaterial);
    foliage5.position.set(-0.8, 7.5, -1.2);
    tree.add(foliage5);

    // Root bulges at base
    const rootMaterial = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 1 });
    for (let i = 0; i < 5; i++) {
        const rootGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 6, 6);
        const root = new THREE.Mesh(rootGeometry, rootMaterial);
        const angle = (i / 5) * Math.PI * 2;
        root.position.set(
            Math.cos(angle) * 0.7,
            0.2,
            Math.sin(angle) * 0.7
        );
        root.scale.set(1, 0.5, 1);
        tree.add(root);
    }

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
    return trough;
}

// ============================================
// 2D FARM VIEW - For Android Compatibility
// ============================================
function Farm2DView({
    isNight,
    setIsNight,
    showConvertReminder,
    setShowConvertReminder,
    state,
    getTotalAnimals,
    colors,
    isDark,
    greeting,
    todayHours,
    router
}: {
    isNight: boolean;
    setIsNight: (value: boolean) => void;
    showConvertReminder: boolean;
    setShowConvertReminder: (value: boolean) => void;
    state: any;
    getTotalAnimals: () => number;
    colors: any;
    isDark: boolean;
    greeting: string;
    todayHours: number;
    router: any;
}) {
    // Animation values for animals
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const bounceY = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8],
    });

    const renderAnimals = (emoji: string, count: number, label: string) => {
        if (count === 0) return null;
        const displayCount = Math.min(count, 12); // Max 12 visible
        const animals = Array(displayCount).fill(emoji);

        return (
            <View style={styles2d.animalSection}>
                <Text style={[styles2d.animalLabel, { color: colors.textSecondary }]}>{label} ({count})</Text>
                <View style={styles2d.animalGrid}>
                    {animals.map((animal, index) => (
                        <Animated.View
                            key={`${label}-${index}`}
                            style={[
                                styles2d.animalItem,
                                { transform: [{ translateY: bounceY }] }
                            ]}
                        >
                            <Text style={styles2d.animalEmoji}>{animal}</Text>
                        </Animated.View>
                    ))}
                    {count > 12 && (
                        <View style={styles2d.moreCount}>
                            <Text style={styles2d.moreCountText}>+{count - 12}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles2d.container, { backgroundColor: isNight ? '#1a1a2e' : '#87CEEB' }]}>
            {/* Sky gradient effect */}
            <View style={[styles2d.sky, { backgroundColor: isNight ? '#0f0f23' : '#87CEEB' }]}>
                {isNight && (
                    <View style={styles2d.starsContainer}>
                        {Array(20).fill(0).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles2d.star,
                                    {
                                        left: `${(i * 17) % 100}%`,
                                        top: `${(i * 23) % 60}%`,
                                        opacity: 0.5 + Math.random() * 0.5
                                    }
                                ]}
                            />
                        ))}
                    </View>
                )}
                {!isNight && <Text style={styles2d.sunEmoji}>☀️</Text>}
                {isNight && <Text style={styles2d.moonEmoji}>🌙</Text>}
            </View>

            {/* Farm Scene */}
            <View style={[styles2d.farmScene, { backgroundColor: isNight ? '#2d4a2a' : '#4a7c23' }]}>
                {/* Barn */}
                <View style={styles2d.barnContainer}>
                    <Text style={styles2d.barnEmoji}>🏠</Text>
                    <Text style={styles2d.barnLabel}>Your Farm</Text>
                </View>

                {/* Animals Area */}
                <ScrollView
                    style={styles2d.animalsContainer}
                    contentContainerStyle={styles2d.animalsContent}
                    showsVerticalScrollIndicator={false}
                >
                    {renderAnimals('🐔', state.hens, 'Hens')}
                    {renderAnimals('🐐', state.goats, 'Goats')}
                    {renderAnimals('🐄', state.cows, 'Cows')}

                    {getTotalAnimals() === 0 && (
                        <View style={styles2d.emptyFarm}>
                            <Text style={styles2d.emptyEmoji}>🌾</Text>
                            <Text style={[styles2d.emptyText, { color: colors.textSecondary }]}>
                                Your farm is empty!{'\n'}Start a focus session to earn animals.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Decorative elements */}
                <View style={styles2d.decorations}>
                    <Text style={styles2d.decorEmoji}>🌳</Text>
                    <Text style={styles2d.decorEmoji}>🌻</Text>
                    <Text style={styles2d.decorEmoji}>🌳</Text>
                </View>
            </View>

            {/* UI Overlay - Same as 3D version */}
            <SafeAreaView style={styles2d.uiOverlay} pointerEvents="box-none">
                {/* Header */}
                <View style={[styles2d.header, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                    <View>
                        <Text style={[styles2d.title, { color: colors.text }]}>🏡 Your Farm</Text>
                        <Text style={[styles2d.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
                    </View>
                    <View style={styles2d.statsRow}>
                        <View style={[styles2d.statBadge, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                            <Text style={styles2d.statEmoji}>🐾</Text>
                            <Text style={[styles2d.statText, { color: isDark ? colors.text : '#8B6B00' }]}>{getTotalAnimals()}</Text>
                        </View>
                        <View style={[styles2d.statBadge, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                            <Sparkles size={14} color="#FFB800" />
                            <Text style={[styles2d.statText, { color: isDark ? colors.text : '#8B6B00' }]}>{todayHours}h</Text>
                        </View>
                    </View>
                </View>

                {/* Hen Conversion Reminder */}
                {state.hens >= 10 && showConvertReminder && (
                    <View style={[styles2d.convertReminder, { backgroundColor: isDark ? colors.surfaceSecondary : '#FFF8E1' }]}>
                        <TouchableOpacity
                            style={styles2d.convertReminderContent}
                            onPress={() => router.push('/(tabs)/goals')}
                        >
                            <Text style={styles2d.convertReminderEmoji}>🐔→🐐</Text>
                            <View style={styles2d.convertReminderText}>
                                <Text style={[styles2d.convertReminderTitle, { color: isDark ? colors.accent : '#E65100' }]}>Convert your hens!</Text>
                                <Text style={[styles2d.convertReminderDesc, { color: isDark ? colors.textSecondary : '#8B6B00' }]}>
                                    You have {state.hens} hens. Tap to convert to goats/cows!
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles2d.convertReminderClose}
                            onPress={() => setShowConvertReminder(false)}
                        >
                            <X size={18} color={isDark ? colors.textSecondary : '#8B6B00'} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Day/Night Toggle */}
                <View style={styles2d.dayNightContainer}>
                    <TouchableOpacity
                        style={[styles2d.dayNightBtn, isNight && styles2d.dayNightBtnNight]}
                        onPress={() => setIsNight(!isNight)}
                        activeOpacity={0.7}
                    >
                        {isNight ? <Moon size={18} color="#FFD700" /> : <Sun size={18} color="#FFFFFF" />}
                        <Text style={[styles2d.dayNightText, isNight && styles2d.dayNightTextNight]}>
                            {isNight ? 'Night' : 'Day'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Start Focus Button */}
                <View style={styles2d.fabContainer}>
                    <TouchableOpacity
                        style={[styles2d.fab, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/focus-start')}
                        activeOpacity={0.8}
                    >
                        <Play size={28} color="#FFF" fill="#FFF" />
                        <Text style={styles2d.fabText}>Start Focus</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// 2D Styles
const styles2d = StyleSheet.create({
    container: { flex: 1 },
    sky: { height: '35%', justifyContent: 'center', alignItems: 'center' },
    starsContainer: { ...StyleSheet.absoluteFillObject },
    star: { position: 'absolute', width: 4, height: 4, backgroundColor: '#fff', borderRadius: 2 },
    sunEmoji: { fontSize: 60, position: 'absolute', top: 30, right: 30 },
    moonEmoji: { fontSize: 50, position: 'absolute', top: 30, right: 30 },
    farmScene: { flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, paddingTop: 20 },
    barnContainer: { alignItems: 'center', marginBottom: 10 },
    barnEmoji: { fontSize: 50 },
    barnLabel: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },
    animalsContainer: { flex: 1, paddingHorizontal: 20 },
    animalsContent: { paddingBottom: 120 },
    animalSection: { marginBottom: 20 },
    animalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: 'rgba(255,255,255,0.8)' },
    animalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    animalItem: {
        width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12, alignItems: 'center', justifyContent: 'center'
    },
    animalEmoji: { fontSize: 28 },
    moreCount: {
        width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12, alignItems: 'center', justifyContent: 'center'
    },
    moreCountText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    emptyFarm: { alignItems: 'center', paddingVertical: 40 },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyText: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.7)' },
    decorations: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
    decorEmoji: { fontSize: 30 },
    uiOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        marginHorizontal: 16, marginTop: 8, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    greeting: { fontSize: 12, fontWeight: '500' },
    title: { fontSize: 20, fontWeight: '800', marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 8 },
    statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, gap: 6 },
    statEmoji: { fontSize: 14 },
    statText: { fontSize: 14, fontWeight: '700' },
    dayNightContainer: { position: 'absolute', right: 16, top: 140 },
    dayNightBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FF8C00', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
        minWidth: 90, justifyContent: 'center',
    },
    dayNightBtnNight: { backgroundColor: '#1a1a3e' },
    dayNightText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    dayNightTextNight: { color: '#FFD700' },
    fabContainer: { alignSelf: 'center', marginBottom: 100 },
    fab: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 28, paddingVertical: 16, borderRadius: 50, gap: 10,
        shadowColor: '#2D4A22', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },
    fabText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    convertReminder: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 16, gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    convertReminderEmoji: { fontSize: 24 },
    convertReminderText: { flex: 1 },
    convertReminderTitle: { fontSize: 14, fontWeight: '700' },
    convertReminderDesc: { fontSize: 11, marginTop: 2 },
    convertReminderContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    convertReminderClose: { padding: 6 },
});

// ============================================
// MAIN COMPONENT
// ============================================
export default function FarmScreen() {
    const router = useRouter();
    const { state, getTotalAnimals } = useFarm();
    const { colors, isDark } = useTheme();

    const getCurrentIsNight = () => {
        const hour = new Date().getHours();
        return hour < 6 || hour >= 18; // Night between 6 PM and 6 AM
    };

    const [isNight, setIsNight] = useState(getCurrentIsNight());
    const [showConvertReminder, setShowConvertReminder] = useState(true);
    const [cameraDistance, setCameraDistance] = useState(60);

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const userName = state.userName || 'Focus Farmer';
    const greeting = `${getTimeBasedGreeting()}, ${userName}`;

    const glRef = useRef<GLView>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const animationRef = useRef<number | null>(null);
    const animalsRef = useRef<any[]>([]);
    const caretakerRef = useRef<any>(null);
    const lightsRef = useRef<{ ambient: THREE.AmbientLight | null; sun: THREE.DirectionalLight | null; moon: THREE.DirectionalLight | null; sunMesh: THREE.Mesh | null; moonMesh: THREE.Mesh | null; stars: THREE.Points | null; clouds: THREE.Group | null }>({ ambient: null, sun: null, moon: null, sunMesh: null, moonMesh: null, stars: null, clouds: null });
    const lastTouchRef = useRef({ x: 0, y: 0 });
    const cameraControlRef = useRef({
        currentHorizontal: 0,
        targetHorizontal: 0,
        currentVertical: 0.3,
        targetVertical: 0.3,
        currentDistance: 60,
        targetDistance: 60
    });

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

        // Add grass patches for realistic look
        const grassColors = [0x3d8b28, 0x56b044, 0x4ca83c, 0x68c45a, 0x45a030];
        for (let i = 0; i < 200; i++) {
            const grassPatchGeometry = new THREE.PlaneGeometry(
                3 + Math.random() * 5,
                3 + Math.random() * 5
            );
            const grassMaterial = new THREE.MeshStandardMaterial({
                color: grassColors[Math.floor(Math.random() * grassColors.length)],
                roughness: 0.9
            });
            const grassPatch = new THREE.Mesh(grassPatchGeometry, grassMaterial);
            grassPatch.rotation.x = -Math.PI / 2;
            grassPatch.position.set(
                (Math.random() - 0.5) * 280,
                0.01 + Math.random() * 0.02,
                (Math.random() - 0.5) * 280
            );
            grassPatch.receiveShadow = true;
            scene.add(grassPatch);
        }

        // Add small grass blades/tufts
        const grassTuftMaterial = new THREE.MeshStandardMaterial({ color: 0x2d7d32, roughness: 1 });
        for (let i = 0; i < 100; i++) {
            const tuftGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
            const tuft = new THREE.Mesh(tuftGeometry, grassTuftMaterial);
            tuft.position.set(
                (Math.random() - 0.5) * 250,
                0.4,
                (Math.random() - 0.5) * 250
            );
            tuft.castShadow = true;
            scene.add(tuft);
        }

        // Add small flower patches
        const flowerColors = [0xffeb3b, 0xffffff, 0xe91e63, 0x9c27b0, 0xff5722];
        for (let i = 0; i < 50; i++) {
            const flowerGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.1, 6, 6);
            const flowerMaterial = new THREE.MeshStandardMaterial({
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.set(
                (Math.random() - 0.5) * 140,
                0.2,
                (Math.random() - 0.5) * 140
            );
            scene.add(flower);
        }

        // Add small rocks
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9 });
        for (let i = 0; i < 30; i++) {
            const rockGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 5, 5);
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 250,
                0.15 + Math.random() * 0.1,
                (Math.random() - 0.5) * 250
            );
            rock.scale.set(1, 0.6, 1);
            rock.castShadow = true;
            scene.add(rock);
        }

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

            // Smooth camera lerping
            const cam = cameraControlRef.current;
            const lerpFactor = 0.15; // Adjustment for smoothness speed

            cam.currentHorizontal += (cam.targetHorizontal - cam.currentHorizontal) * lerpFactor;
            cam.currentVertical += (cam.targetVertical - cam.currentVertical) * lerpFactor;
            cam.currentDistance += (cam.targetDistance - cam.currentDistance) * lerpFactor;

            // Update camera position
            if (cameraRef.current) {
                const x = Math.sin(cam.currentHorizontal) * Math.cos(cam.currentVertical) * cam.currentDistance;
                const y = Math.max(5, Math.sin(cam.currentVertical) * cam.currentDistance);
                const z = Math.cos(cam.currentHorizontal) * Math.cos(cam.currentVertical) * cam.currentDistance;
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
    }, [state.hens, state.goats, state.cows]);

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

                cameraControlRef.current.targetHorizontal += dx;
                cameraControlRef.current.targetVertical = Math.max(0.1, Math.min(1.2, cameraControlRef.current.targetVertical + dy));
            },
        })
    ).current;

    const handleZoomIn = () => {
        cameraControlRef.current.targetDistance = Math.max(20, cameraControlRef.current.targetDistance - 15);
    };
    const handleZoomOut = () => {
        cameraControlRef.current.targetDistance = Math.min(120, cameraControlRef.current.targetDistance + 15);
    };

    // Use WebView with three.js for 3D rendering on all platforms
    // This provides consistent cross-platform 3D with animations
    const webViewRef = useRef<WebView>(null);

    // Send state to WebView
    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'updateState',
                hens: state.hens,
                goats: state.goats,
                cows: state.cows
            }));
        }
    }, [state.hens, state.goats, state.cows]);

    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'toggleDayNight',
                isNight: isNight
            }));
        }
    }, [isNight]);

    const handleZoomInWebView = () => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'zoom', delta: -15 }));
    };
    const handleZoomOutWebView = () => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'zoom', delta: 15 }));
    };

    // We now use the imported FARM_3D_HTML constant instead of a relative local file requirement
    // to improve reliability on Android internal storage resolution.

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: FARM_3D_HTML }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                mixedContentMode="always"
                onLoad={() => {
                    // Send initial state after load
                    setTimeout(() => {
                        webViewRef.current?.postMessage(JSON.stringify({
                            type: 'updateState',
                            hens: state.hens,
                            goats: state.goats,
                            cows: state.cows
                        }));
                        webViewRef.current?.postMessage(JSON.stringify({
                            type: 'toggleDayNight',
                            isNight: isNight
                        }));
                    }, 500);
                }}
            />

            <SafeAreaView style={styles.uiOverlay} pointerEvents="box-none">
                {/* Header with Stats */}
                <View style={[styles.header, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>🏡 Your Farm</Text>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
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

                {/* Day/Night Controls */}
                <View style={styles.dayNightContainer}>
                    <TouchableOpacity
                        style={[styles.dayNightBtn, isNight && styles.dayNightBtnNight]}
                        onPress={() => setIsNight(!isNight)}
                        activeOpacity={0.7}
                    >
                        {isNight ? <Moon size={18} color="#FFD700" /> : <Sun size={18} color="#FFFFFF" />}
                        <Text style={[styles.dayNightText, isNight && styles.dayNightTextNight]}>
                            {isNight ? 'Night' : 'Day'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Zoom Controls */}
                <View style={styles.zoomContainer}>
                    <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomInWebView} activeOpacity={0.7}>
                        <ZoomIn size={20} color="#4A7C23" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOutWebView} activeOpacity={0.7}>
                        <ZoomOut size={20} color="#4A7C23" />
                    </TouchableOpacity>
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
    dayNightContainer: {
        position: 'absolute', right: 16, top: 140,
    },
    dayNightBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FF8C00', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
        minWidth: 90, justifyContent: 'center',
    },
    dayNightBtnNight: {
        backgroundColor: '#1a1a3e',
    },
    dayNightText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    dayNightTextNight: { color: '#FFD700' },
    zoomContainer: {
        position: 'absolute', right: 16, top: 200,
        backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
        alignItems: 'center',
    },
    zoomBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center', marginVertical: 2,
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
