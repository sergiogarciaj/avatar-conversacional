'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/state';
import { getBlendShapesForViseme } from '@/lib/viseme-mapper';
import { LipSyncEnergy, LipSyncFrame } from '@/lib/lip-sync-energy';

interface AvatarModelProps {
  modelUrl: string;
  lipSyncMode: 'A' | 'B';
}

function AvatarModel({ modelUrl, lipSyncMode }: AvatarModelProps) {
  const meshRef = useRef<THREE.SkinnedMesh | null>(null);
  const lipSyncRef = useRef<LipSyncEnergy | null>(null);
  const idleAnimationRef = useRef({ time: 0, blinkTime: 0 });
  
  const currentVisemes = useAppStore((state) => state.currentVisemes);
  const isAssistantSpeaking = useAppStore((state) => state.isAssistantSpeaking);

  // Cargar modelo GLTF
  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    // Buscar el mesh con morph targets
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        meshRef.current = child;
      }
    });

    // Inicializar lip-sync para Modo A si hay audio
    if (lipSyncMode === 'A' && isAssistantSpeaking) {
      // El lip-sync se inicializará cuando haya audio disponible
    }

    return () => {
      if (lipSyncRef.current) {
        lipSyncRef.current.stop();
      }
    };
  }, [scene, lipSyncMode, isAssistantSpeaking]);

  // Animación por frame
  useFrame((state, delta) => {
    if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;

    const influences = meshRef.current.morphTargetInfluences;
    const dict = meshRef.current.morphTargetDictionary;

    // Idle animations (parpadeo, micro-movimientos)
    idleAnimationRef.current.time += delta;
    idleAnimationRef.current.blinkTime += delta;

    // Parpadeo automático cada 3-5 segundos
    if (idleAnimationRef.current.blinkTime > 3 + Math.random() * 2) {
      idleAnimationRef.current.blinkTime = 0;
      const blinkSpeed = 0.15;
      
      // Parpadeo rápido
      if (dict && dict['eyeBlinkLeft'] !== undefined) {
        influences[dict['eyeBlinkLeft']] = Math.min(
          influences[dict['eyeBlinkLeft']] + blinkSpeed,
          1
        );
      }
      if (dict && dict['eyeBlinkRight'] !== undefined) {
        influences[dict['eyeBlinkRight']] = Math.min(
          influences[dict['eyeBlinkRight']] + blinkSpeed,
          1
        );
      }
    } else {
      // Recuperar de parpadeo
      if (dict && dict['eyeBlinkLeft'] !== undefined && influences[dict['eyeBlinkLeft']] > 0) {
        influences[dict['eyeBlinkLeft']] = Math.max(
          influences[dict['eyeBlinkLeft']] - 0.1,
          0
        );
      }
      if (dict && dict['eyeBlinkRight'] !== undefined && influences[dict['eyeBlinkRight']] > 0) {
        influences[dict['eyeBlinkRight']] = Math.max(
          influences[dict['eyeBlinkRight']] - 0.1,
          0
        );
      }
    }

    // Micro-movimientos de cabeza
    if (scene) {
      const headBone = scene.getObjectByName('Head');
      if (headBone) {
        headBone.rotation.y = Math.sin(idleAnimationRef.current.time * 0.5) * 0.05;
        headBone.rotation.x = Math.sin(idleAnimationRef.current.time * 0.3) * 0.03;
      }
    }

    // Aplicar lip-sync según el modo
    if (lipSyncMode === 'B' && currentVisemes.length > 0) {
      // Modo B: Usar visemes de Azure
      const now = performance.now();
      const currentViseme = currentVisemes.find(
        (v) => v.atMs <= now && now < v.atMs + (v.durationMs || 100)
      );

      if (currentViseme && dict) {
        // Aplicar blendshapes del viseme
        currentViseme.arkit.forEach(({ name, value }) => {
          const index = dict[name];
          if (index !== undefined) {
            // Suavizado
            const current = influences[index] || 0;
            influences[index] = current * 0.7 + value * 0.3;
          }
        });
      } else if (dict) {
        // Regresar a estado neutral suavemente
        if (dict['jawOpen'] !== undefined) {
          influences[dict['jawOpen']] *= 0.9;
        }
        if (dict['mouthFunnel'] !== undefined) {
          influences[dict['mouthFunnel']] *= 0.9;
        }
        if (dict['mouthPucker'] !== undefined) {
          influences[dict['mouthPucker']] *= 0.9;
        }
      }
    } else if (lipSyncMode === 'A' && dict) {
      // Modo A: Se actualizará mediante callback de LipSyncEnergy
      // Por ahora, dejar que se desvanezca cuando no hay audio
      if (!isAssistantSpeaking) {
        if (dict['jawOpen'] !== undefined) {
          influences[dict['jawOpen']] *= 0.95;
        }
        if (dict['mouthFunnel'] !== undefined) {
          influences[dict['mouthFunnel']] *= 0.95;
        }
        if (dict['mouthPucker'] !== undefined) {
          influences[dict['mouthPucker']] *= 0.95;
        }
      }
    }
  });

  // Función para aplicar frame de lip-sync (Modo A)
  const applyLipSyncFrame = (frame: LipSyncFrame) => {
    if (!meshRef.current || !meshRef.current.morphTargetInfluences) return;

    const influences = meshRef.current.morphTargetInfluences;
    const dict = meshRef.current.morphTargetDictionary;

    if (dict) {
      if (dict['jawOpen'] !== undefined) {
        influences[dict['jawOpen']] = frame.jawOpen;
      }
      if (dict['mouthFunnel'] !== undefined) {
        influences[dict['mouthFunnel']] = frame.mouthFunnel;
      }
      if (dict['mouthPucker'] !== undefined) {
        influences[dict['mouthPucker']] = frame.mouthPucker;
      }
    }
  };

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[0, -1.5, 0]}
    />
  );
}

interface AvatarCanvasProps {
  modelUrl?: string;
  lipSyncMode?: 'A' | 'B';
}

export default function AvatarCanvas({
  modelUrl = '/models/avatar.glb',
  lipSyncMode = 'A',
}: AvatarCanvasProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.5} />
        
        <AvatarModel modelUrl={modelUrl} lipSyncMode={lipSyncMode} />
        
        <Environment preset="city" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

// Precargar el modelo
useGLTF.preload('/models/avatar.glb');
