'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Create clouds with evenly spaced positions
    const clouds: THREE.Mesh[] = [];
    const cloudCount = 15;
    const cloudsPerRow = 5;
    const cloudSpacingX = 10;
    const cloudSpacingY = 5;
    const cloudSpacingZ = 6;

    for (let i = 0; i < cloudCount; i++) {
      const row = Math.floor(i / cloudsPerRow);
      const col = i % cloudsPerRow;

      // Create cloud group with multiple spheres
      const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15 + (i % 3) * 0.05, // Varied but consistent opacity
      });

      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

      // Position clouds in a grid pattern with slight offset for natural look
      cloud.position.set(
        (col - cloudsPerRow / 2) * cloudSpacingX + (row % 2) * 2,
        (row - 1) * cloudSpacingY,
        -10 - (row * cloudSpacingZ)
      );

      // Consistent cloud sizes based on position
      const scale = 0.7 + (i % 4) * 0.3;
      cloud.scale.set(scale * 2, scale * 0.5, scale);

      clouds.push(cloud);
      scene.add(cloud);
    }

    // Add stars (twinkling particles)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1200;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsSizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
      // Position stars across the sky
      starsPositions[i * 3] = (Math.random() - 0.5) * 50;
      starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      starsPositions[i * 3 + 2] = -15 - Math.random() * 20;

      // Random star sizes
      starsSizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      size: 0.05,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsMesh);

    // Add accent particles (floating dust/sparkles)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const particlesPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      particlesPositions[i * 3] = (Math.random() - 0.5) * 25;
      particlesPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create shooting stars
    interface ShootingStar {
      mesh: THREE.Line;
      velocity: THREE.Vector3;
      lifetime: number;
      maxLifetime: number;
      head: THREE.Mesh;
      glow: THREE.Mesh;
    }

    const shootingStars: ShootingStar[] = [];
    let shootingStarTimer = 0;

    const createShootingStar = () => {
      // Random starting position (top corners or sides)
      const startX = Math.random() > 0.5 ? 20 + Math.random() * 10 : -20 - Math.random() * 10;
      const startY = 8 + Math.random() * 4;
      const startZ = -5 - Math.random() * 5;

      // Create longer trail for meteor effect
      const trailLength = 15;
      const points = [];

      // Direction vector for the trail
      const direction = new THREE.Vector3(
        Math.random() > 0.5 ? -1 : 1,
        -0.3,
        -0.2
      ).normalize();

      for (let i = 0; i < trailLength; i++) {
        points.push(new THREE.Vector3(
          startX + direction.x * i * 0.3,
          startY + direction.y * i * 0.3,
          startZ + direction.z * i * 0.3
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Create gradient-like effect by using additive blending
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        linewidth: 3,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);

      // Add a bright sphere at the head of the meteor
      const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const headMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(startX, startY, startZ);
      scene.add(head);

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xadd8e6,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(startX, startY, startZ);
      scene.add(glow);

      // Faster velocity for meteor effect
      const velocity = new THREE.Vector3(
        direction.x * 0.4,
        direction.y * 0.4,
        direction.z * 0.2
      );

      shootingStars.push({
        mesh: line,
        velocity: velocity,
        lifetime: 0,
        maxLifetime: 60 + Math.random() * 40,
        head: head,
        glow: glow,
      } as ShootingStar & { head: THREE.Mesh; glow: THREE.Mesh });
    };

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      // Gentle floating and drifting animation for clouds
      clouds.forEach((cloud, index) => {
        cloud.position.x += Math.sin(time + index) * 0.002;
        cloud.position.y += Math.cos(time + index * 0.5) * 0.001;

        // Wrap clouds around
        if (cloud.position.x > 15) cloud.position.x = -15;
        if (cloud.position.x < -15) cloud.position.x = 15;
      });

      // Twinkling stars effect
      const starPositions = starsGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        starPositions[i3 + 2] += Math.sin(time + i) * 0.001;
      }
      starsGeometry.attributes.position.needsUpdate = true;

      // Slow rotation of accent particles
      particlesMesh.rotation.y += 0.0003;
      particlesMesh.rotation.x = Math.sin(time * 0.1) * 0.05;

      // Shooting stars animation
      shootingStarTimer++;

      // Create new shooting star randomly (every 2-4 seconds at 60fps)
      if (shootingStarTimer > 120 + Math.random() * 120) {
        createShootingStar();
        shootingStarTimer = 0;
      }

      // Update existing shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.lifetime++;

        // Get the line positions
        const positions = star.mesh.geometry.attributes.position.array as Float32Array;
        const trailLength = positions.length / 3;

        // Move each point in the trail
        for (let j = 0; j < trailLength; j++) {
          const idx = j * 3;
          positions[idx] += star.velocity.x;
          positions[idx + 1] += star.velocity.y;
          positions[idx + 2] += star.velocity.z;
        }
        star.mesh.geometry.attributes.position.needsUpdate = true;

        // Move the head and glow
        star.head.position.x += star.velocity.x;
        star.head.position.y += star.velocity.y;
        star.head.position.z += star.velocity.z;

        star.glow.position.x += star.velocity.x;
        star.glow.position.y += star.velocity.y;
        star.glow.position.z += star.velocity.z;

        // Fade out as lifetime increases
        const fadeProgress = star.lifetime / star.maxLifetime;
        (star.mesh.material as THREE.LineBasicMaterial).opacity = 1 * (1 - fadeProgress);
        (star.head.material as THREE.MeshBasicMaterial).opacity = 1 * (1 - fadeProgress);
        (star.glow.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - fadeProgress);

        // Remove if lifetime exceeded
        if (star.lifetime > star.maxLifetime) {
          scene.remove(star.mesh);
          scene.remove(star.head);
          scene.remove(star.glow);

          star.mesh.geometry.dispose();
          (star.mesh.material as THREE.Material).dispose();
          star.head.geometry.dispose();
          (star.head.material as THREE.Material).dispose();
          star.glow.geometry.dispose();
          (star.glow.material as THREE.Material).dispose();

          shootingStars.splice(i, 1);
        }
      }

      // Camera follows mouse smoothly
      camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();

      // Dispose clouds
      clouds.forEach(cloud => {
        cloud.geometry.dispose();
        (cloud.material as THREE.Material).dispose();
      });

      // Dispose stars
      starsGeometry.dispose();
      starsMaterial.dispose();

      // Dispose accent particles
      particlesGeometry.dispose();
      particlesMaterial.dispose();

      // Dispose shooting stars
      shootingStars.forEach(star => {
        scene.remove(star.mesh);
        scene.remove(star.head);
        scene.remove(star.glow);
        star.mesh.geometry.dispose();
        (star.mesh.material as THREE.Material).dispose();
        star.head.geometry.dispose();
        (star.head.material as THREE.Material).dispose();
        star.glow.geometry.dispose();
        (star.glow.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Three.js Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a, #111827)' }}
      />

      {/* Main Content - AICAMPUS Text */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="text-[15vw] md:text-[12vw] lg:text-[10vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 leading-none tracking-tighter animate-pulse"
          style={{ fontFamily: 'Agency FB, sans-serif' }}
        >
          AICAMPUS
        </h1>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-emerald-500 to-teal-500 -z-10 animate-pulse"></div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6 text-emerald-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
