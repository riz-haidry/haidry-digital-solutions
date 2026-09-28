// Keep Three.js in the scene's lazy chunk and expose only the classes used by
// the composition so the production bundler can tree-shake the rest.
export {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from "three";
