import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import ecommerceImage from "../assets/9a367cc4207ce4aa1e49a5474a85719f.jpg";

function drawConceptCard(THREE, image, variant) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 500;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#292544";
  context.font = '700 20px "Playfair Display", sans-serif';
  context.fillText(
    variant === 0
      ? "HAIDRY / BRAND"
      : variant === 1
        ? "PRODUCT / UI"
        : "WEB / DIGITAL",
    34,
    48,
  );
  context.fillStyle = "#8a879c";
  context.font = '500 12px "DM Sans", sans-serif';
  context.fillText("STRATEGY · DESIGN · DEVELOPMENT", 34, 73);
  context.fillStyle = "#efedff";
  context.fillRect(32, 96, 656, 372);

  if (variant === 0 && image) {
    context.save();
    context.beginPath();
    context.roundRect(48, 112, 624, 340, 14);
    context.clip();
    const scale = Math.max(624 / image.width, 340 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(
      image,
      48 + (624 - width) / 2,
      112 + (340 - height) / 2,
      width,
      height,
    );
    context.fillStyle = "rgba(34, 28, 73, .17)";
    context.fillRect(48, 112, 624, 340);
    context.restore();
    context.fillStyle = "#fff";
    context.font = '600 14px "DM Sans", sans-serif';
    context.fillText("A considered digital storefront", 68, 425);
  } else {
    context.fillStyle = "#fff";
    context.beginPath();
    context.roundRect(52, 116, 616, 332, 12);
    context.fill();
    context.fillStyle = variant === 1 ? "#c8fff0" : "#d9d2ff";
    context.beginPath();
    context.roundRect(74, 140, variant === 1 ? 218 : 270, 286, 12);
    context.fill();
    context.fillStyle = "#292544";
    context.font = '700 27px "Playfair Display", sans-serif';
    context.fillText(
      variant === 1 ? "A clearer way" : "Build what’s next",
      318,
      190,
    );
    context.fillStyle = "#89879a";
    context.fillRect(318, 213, 230, 8);
    context.fillRect(318, 232, 190, 8);
    context.fillRect(318, 251, 215, 8);
    context.fillStyle = "#7157e8";
    context.beginPath();
    context.roundRect(318, 282, 130, 36, 18);
    context.fill();
    context.fillStyle = "#fff";
    context.font = '600 11px "DM Sans", sans-serif';
    context.fillText("EXPLORE", 352, 305);
    context.fillStyle = "#24b8ad";
    context.beginPath();
    context.arc(588, 388, 24, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function ThreeStudioScene() {
  const hostRef = useRef(null);
  const [webglReady, setWebglReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    let renderer;
    let observer;
    let loadObserver;
    let resizeObserver;
    let frame = 0;
    let visible = false;
    let imageTexture;
    const resources = [];
    let removePointerListeners = () => {};
    let targetX = 0;
    let targetY = 0;
    let lastTime = 0;

    const stopFrame = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const start = async () => {
      try {
        const THREE = await import("./threeSceneEngine");
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
        camera.position.set(0, 0, 9.4);
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);
        setWebglReady(true);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x7770a9, 2.15));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(-3.5, 4.5, 6);
        scene.add(keyLight);
        const mintLight = new THREE.PointLight(0x62e3cd, 18, 12);
        mintLight.position.set(3.8, -2, 3.5);
        scene.add(mintLight);

        const composition = new THREE.Group();
        scene.add(composition);
        const markShape = new THREE.Shape();
        markShape.moveTo(-0.68, -1);
        markShape.lineTo(-0.68, 1);
        markShape.lineTo(-0.22, 1);
        markShape.lineTo(-0.22, 0.22);
        markShape.lineTo(0.22, 0.22);
        markShape.lineTo(0.22, 1);
        markShape.lineTo(0.68, 1);
        markShape.lineTo(0.68, -1);
        markShape.lineTo(0.22, -1);
        markShape.lineTo(0.22, -0.22);
        markShape.lineTo(-0.22, -0.22);
        markShape.lineTo(-0.22, -1);
        markShape.closePath();
        const markGeometry = new THREE.ExtrudeGeometry(markShape, {
          depth: 0.32,
          bevelEnabled: true,
          bevelThickness: 0.09,
          bevelSize: 0.07,
          bevelSegments: 3,
          curveSegments: 8,
        });
        markGeometry.center();
        const markMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x7258ed,
          metalness: 0.12,
          roughness: 0.22,
          clearcoat: 0.92,
          clearcoatRoughness: 0.16,
        });
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.position.z = 0.1;
        composition.add(mark);
        resources.push(markGeometry, markMaterial);

        const mintGeometry = new THREE.TorusGeometry(1.82, 0.022, 12, 144);
        const mintMaterial = new THREE.MeshStandardMaterial({
          color: 0x24b8ad,
          metalness: 0.45,
          roughness: 0.28,
          emissive: 0x0b504c,
          emissiveIntensity: 0.22,
        });
        const mintOrbit = new THREE.Mesh(mintGeometry, mintMaterial);
        mintOrbit.rotation.set(1.08, 0.24, -0.34);
        mintOrbit.position.z = -0.15;
        composition.add(mintOrbit);
        resources.push(mintGeometry, mintMaterial);

        const violetGeometry = new THREE.TorusGeometry(2.04, 0.012, 8, 144);
        const violetMaterial = new THREE.MeshBasicMaterial({
          color: 0xaaa0f1,
          transparent: true,
          opacity: 0.66,
        });
        const violetOrbit = new THREE.Mesh(violetGeometry, violetMaterial);
        violetOrbit.rotation.set(0.42, -0.38, 0.7);
        violetOrbit.position.z = -0.28;
        composition.add(violetOrbit);
        resources.push(violetGeometry, violetMaterial);

        const starGeometry = new THREE.IcosahedronGeometry(0.075, 2);
        const starMaterials = [
          new THREE.MeshPhysicalMaterial({
            color: 0x24b8ad,
            metalness: 0.2,
            roughness: 0.18,
            clearcoat: 1,
          }),
          new THREE.MeshPhysicalMaterial({
            color: 0xa99aff,
            metalness: 0.25,
            roughness: 0.2,
            clearcoat: 1,
          }),
          new THREE.MeshPhysicalMaterial({
            color: 0xffc88a,
            metalness: 0.2,
            roughness: 0.22,
            clearcoat: 1,
          }),
        ];
        const satellites = [
          [-1.9, 0.96, 0.32],
          [1.84, 0.62, 0.1],
          [1.35, -1.32, 0.48],
          [-1.53, -1.22, -0.12],
        ];
        const satelliteMeshes = [];
        satellites.forEach(([x, y, z], index) => {
          const satellite = new THREE.Mesh(
            starGeometry,
            starMaterials[index % starMaterials.length],
          );
          satellite.position.set(x, y, z);
          satellite.scale.setScalar(index === 2 ? 1.42 : 1);
          composition.add(satellite);
          satelliteMeshes.push(satellite);
        });
        resources.push(starGeometry, ...starMaterials);

        const image = new Image();
        image.src = ecommerceImage;
        await image.decode().catch(() => undefined);
        if (disposed) return;
        imageTexture = drawConceptCard(
          THREE,
          image.naturalWidth ? image : null,
          0,
        );
        const textures = [
          imageTexture,
          drawConceptCard(THREE, null, 1),
          drawConceptCard(THREE, null, 2),
        ];
        resources.push(...textures);
        const cardPositions = [
          {
            position: [-1.82, 0.88, -0.48],
            rotation: [-0.08, 0.23, 0.085],
            scale: 0.73,
          },
          {
            position: [1.83, 0.24, -0.35],
            rotation: [0.06, -0.22, -0.095],
            scale: 0.75,
          },
          {
            position: [0.06, -1.56, -0.56],
            rotation: [0.08, 0.06, 0.015],
            scale: 0.64,
          },
        ];
        cardPositions.forEach((card, index) => {
          const width = 1.94;
          const height = 1.35;
          const bodyGeometry = new THREE.BoxGeometry(width, height, 0.075);
          const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.04,
            roughness: 0.32,
            clearcoat: 0.7,
            clearcoatRoughness: 0.25,
          });
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.set(...card.position);
          body.rotation.set(...card.rotation);
          body.scale.setScalar(card.scale);
          composition.add(body);
          const screenGeometry = new THREE.PlaneGeometry(
            width - 0.11,
            height - 0.11,
          );
          const screenMaterial = new THREE.MeshBasicMaterial({
            map: textures[index],
            toneMapped: false,
          });
          const screen = new THREE.Mesh(screenGeometry, screenMaterial);
          screen.position.z = 0.041;
          body.add(screen);
          resources.push(
            bodyGeometry,
            bodyMaterial,
            screenGeometry,
            screenMaterial,
          );
        });

        const resize = () => {
          if (!renderer || disposed) return;
          const { width, height } = host.getBoundingClientRect();
          if (width < 1 || height < 1) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.position.z = width < 520 ? 10.8 : 9.4;
          composition.scale.setScalar(width < 520 ? 0.8 : 1);
          camera.updateProjectionMatrix();
          if (reduceMotion || !visible) renderer.render(scene, camera);
        };

        const renderFrame = (time) => {
          if (disposed || !visible || !renderer) {
            stopFrame();
            return;
          }
          frame = requestAnimationFrame(renderFrame);
          const delta = Math.min((time - (lastTime || time)) / 1000, 0.05);
          lastTime = time;
          const speed = reduceMotion ? 0 : delta;
          composition.rotation.y += speed * 0.1;
          composition.rotation.x +=
            (targetY * 0.045 - composition.rotation.x) * 0.06;
          composition.rotation.y +=
            (targetX * 0.045 - composition.rotation.y) * 0.06;
          mintOrbit.rotation.z += speed * 0.04;
          satelliteMeshes.forEach((object, index) => {
            object.position.y =
              satellites[index][1] + Math.sin(time * 0.0007 + index) * 0.055;
          });
          renderer.render(scene, camera);
        };

        const onPointerMove = (event) => {
          if (event.pointerType !== "mouse" || reduceMotion) return;
          const bounds = host.getBoundingClientRect();
          targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        };
        const onPointerLeave = () => {
          targetX = 0;
          targetY = 0;
        };
        host.addEventListener("pointermove", onPointerMove, { passive: true });
        host.addEventListener("pointerleave", onPointerLeave, {
          passive: true,
        });
        removePointerListeners = () => {
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (!visible) stopFrame();
            else if (!reduceMotion && !frame)
              frame = requestAnimationFrame(renderFrame);
            else if (reduceMotion) renderer.render(scene, camera);
          },
          { rootMargin: "100px" },
        );
        observer.observe(host);
        resize();
        if (reduceMotion) renderer.render(scene, camera);
      } catch {
        observer?.disconnect();
        resizeObserver?.disconnect();
        removePointerListeners();
        resources.forEach((resource) => resource.dispose?.());
        resources.length = 0;
        renderer?.dispose();
        renderer?.domElement.remove();
        renderer = undefined;
        if (!disposed) setWebglReady(false);
      }
    };

    const loadOnApproach = () => {
      loadObserver?.disconnect();
      loadObserver = undefined;
      start();
    };
    if ("IntersectionObserver" in window) {
      loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) loadOnApproach();
        },
        { rootMargin: "220px" },
      );
      loadObserver.observe(host);
    } else loadOnApproach();
    return () => {
      disposed = true;
      stopFrame();
      loadObserver?.disconnect();
      observer?.disconnect();
      resizeObserver?.disconnect();
      removePointerListeners();
      resources.forEach((resource) => resource.dispose?.());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      className={`three-studio-scene${webglReady ? " has-webgl" : ""}`}
      role="img"
      aria-label="Interactive 3D composition showing Haidry Digital's branding, interface design and web development work"
    >
      <div className="three-scene-fallback" aria-hidden="true">
        <span>H</span>
        <i />
        <b>BRAND · UI · WEB</b>
      </div>
    </div>
  );
}
