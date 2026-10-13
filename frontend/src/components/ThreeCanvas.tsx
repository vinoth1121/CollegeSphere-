import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  className?: string;
  variant?: 'login' | 'dashboard' | 'compact';
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ className = '', variant = 'login' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = variant === 'login' ? 5.5 : 4.5;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // UI/UX Pro Max Accessibility Guideline: Canvas aria-label & role
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive 3D CollegeSphere Institutional Orbit visualization'
    );
    renderer.domElement.className = 'w-full h-full';
    container.appendChild(renderer.domElement);

    // 3. Groups & Geometries
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Central Sphere (The Core Knowledge Hub)
    const sphereGeometry = new THREE.IcosahedronGeometry(variant === 'login' ? 1.4 : 1.1, 2);
    const sphereWireframeMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, sphereWireframeMaterial);
    rootGroup.add(coreSphere);

    // Inner Glowing Core
    const innerGeometry = new THREE.SphereGeometry(variant === 'login' ? 0.9 : 0.7, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.15,
    });
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    rootGroup.add(innerCore);

    // Orbital Ring 1 (Gold Accent / Academic Excellence)
    const ring1Geometry = new THREE.TorusGeometry(variant === 'login' ? 2.1 : 1.7, 0.015, 16, 100);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    rootGroup.add(ring1);

    // Orbital Ring 2 (Sapphire Accent / Technology & Research)
    const ring2Geometry = new THREE.TorusGeometry(variant === 'login' ? 2.6 : 2.0, 0.018, 16, 100);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    rootGroup.add(ring2);

    // Floating Department & Faculty Node Satellites
    const satelliteGroup = new THREE.Group();
    rootGroup.add(satelliteGroup);
    const nodeCount = 12;
    const nodeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.1;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius;
      node.position.z = (Math.sin(angle * 2) * 0.4);
      satelliteGroup.add(node);
    }
    satelliteGroup.rotation.x = Math.PI / 3;
    satelliteGroup.rotation.y = Math.PI / 6;

    // Surrounding Constellation Particle Cloud
    const particlesCount = variant === 'login' ? 350 : 200;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 8;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.025,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.7,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 1.5, 50);
    goldLight.position.set(-5, -3, 3);
    scene.add(goldLight);

    // 5. Interaction Tracking (Mouse & Touch per UI/UX Pro Max rules)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / rect.width - 0.5) * 2;
      mouseY = (y / rect.height - 0.5) * 2;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        mouseX = (x / rect.width - 0.5) * 2;
        mouseY = (y / rect.height - 0.5) * 2;
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / rotation inertia
      targetX = mouseX * 0.4;
      targetY = mouseY * 0.4;
      rootGroup.rotation.y += 0.005 + (targetX - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += 0.002 + (-targetY - rootGroup.rotation.x) * 0.05;

      // Pulse and orbital rotations
      coreSphere.rotation.y = elapsedTime * 0.15;
      coreSphere.rotation.x = elapsedTime * 0.08;

      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.z = -elapsedTime * 0.15;
      satelliteGroup.rotation.z = elapsedTime * 0.25;

      particlesMesh.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove', onTouchMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      sphereWireframeMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-auto ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
