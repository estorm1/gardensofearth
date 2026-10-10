import * as THREE from "three";
import { cities, globePoint, journeyCamera, mercator, unproject, clamp01 } from "./network-geo";

type River = { features: { geometry: { coordinates: number[][] } }[] };

export async function createNetworkGlobe(host: HTMLElement, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x03090e, 1);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .00002, 30);
  scene.add(new THREE.AmbientLight(0xffffff, 1.9));
  const sun = new THREE.DirectionalLight(0xe2f3ff, 2.2);
  scene.add(sun);
  const earthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 5, specular: 0x142c36 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 192, 96), earthMaterial));

  const atmosphereStrength = { value: 1 };
  const atmosphereVertex = `
    varying vec3 n;
    varying vec3 v;
    void main() {
      vec4 p = modelViewMatrix * vec4(position, 1.0);
      n = normalize(normalMatrix * normal);
      v = normalize(-p.xyz);
      gl_Position = projectionMatrix * p;
    }
  `;
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true, side: THREE.FrontSide, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { strength: atmosphereStrength },
    vertexShader: atmosphereVertex,
    fragmentShader: `
      varying vec3 n;
      varying vec3 v;
      uniform float strength;
      void main() {
        float d = abs(dot(normalize(n), normalize(v)));
        // Ray distance from the planet center, in Earth-radius units.
        float radius = 1.065 * sqrt(max(0.0, 1.0 - d * d));
        float inner = 0.025 + 0.32 * pow(min(radius, 1.0), 8.0);
        float outer = 1.0 - smoothstep(1.0, 1.065, radius);
        gl_FragColor = vec4(0.48, 0.78, 1.0, inner * outer * strength * 1.12);
      }
    `,
  });
  // One continuous veil avoids an inner shadow where two atmospheric shells meet.
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.065, 192, 96), atmosphereMaterial);
  atmosphere.renderOrder = 4;
  scene.add(atmosphere);
  const loader = new THREE.TextureLoader();
  const textures: THREE.Texture[] = [];
  let disposed = false;
  let progress = 0;
  const riverGroup = new THREE.Group();
  scene.add(riverGroup);
  const markers = cities.map(city => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(.009, 20, 12), new THREE.MeshBasicMaterial({ color: 0xff674f }));
    marker.position.set(...globePoint(city.lon,city.lat,1.008));
    scene.add(marker);
    return marker;
  });

  function render(p = progress) {
    if (disposed) return;
    progress = p;
    const state = journeyCamera(p);
    const mobile = host.clientWidth < 700;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const limitingFov = Math.atan(Math.tan(halfFov) * Math.min(camera.aspect, 1));
    const orbitAltitude = 1 / Math.sin(limitingFov * .78) - 1;
    const cityFactor = mobile ? 1.45 : 1;
    const orbitalWeight = clamp01((state.altitude - .05) / 1.5);
    const altitude = state.altitude * THREE.MathUtils.lerp(cityFactor, orbitAltitude / 2.5, orbitalWeight);
    // Keep depth precision high in orbit as well as at city scale.
    camera.near = Math.max(.000005, altitude * .02);
    camera.far = altitude + 4;
    camera.updateProjectionMatrix();
    camera.position.set(...globePoint(state.lon,state.lat,1+altitude));
    camera.lookAt(0,0,0);
    sun.position.copy(camera.position).add(new THREE.Vector3(-.5,1.2,1));
    // Use narrative altitude so desktop and mobile lose the haze at the same beat.
    const atmosphereFade = clamp01((Math.log(state.altitude) - Math.log(.07)) / (Math.log(1.2) - Math.log(.07)));
    atmosphereStrength.value = atmosphereFade * atmosphereFade * (3 - 2 * atmosphereFade);
    riverGroup.visible = p < 1 / cities.length;
    markers.forEach(marker => { marker.visible = altitude > .13; });
    renderer.render(scene,camera);
    renderer.domElement.dataset.longitude = String(state.lon);
    renderer.domElement.dataset.altitude = String(altitude);
    renderer.domElement.dataset.atmosphere = String(atmosphereStrength.value);
  }

  const loadTexture = async (url: string) => {
    const texture = await loader.loadAsync(url);
    if (disposed) { texture.dispose(); return null; }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    textures.push(texture);
    return texture;
  };

  // Local patches use the exact Web Mercator bounds of the downloaded imagery.
  const loadCity = async (city: typeof cities[number], regional = false) => {
    const texture = await loadTexture(`/maps/${city.id}${regional?"-region":""}.jpg`);
    if (!texture || disposed) return;
    const [cx,cy] = mercator(city.lon,city.lat);
    const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
    const steps = 40;
    for(let row=0;row<=steps;row++) for(let col=0;col<=steps;col++) {
      const u=col/steps,v=row/steps;
      const multiplier=regional?4:1;
      const [lon,lat]=unproject(cx+(u-.5)*city.width*multiplier,cy+(.5-v)*city.height*multiplier);
      positions.push(...globePoint(lon,lat,regional?1.00002:1.00004));
      uvs.push(u,1-v);
      if(row<steps && col<steps){ const a=row*(steps+1)+col,b=a+steps+1; indices.push(a,b,a+1,b,b+1,a+1); }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true,depthWrite:false});
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec2 edge=min(vMapUv,1.0-vMapUv);
        diffuseColor.a*=smoothstep(0.0,0.045,min(edge.x,edge.y));`);
    };
    const patch=new THREE.Mesh(geometry,material);
    patch.renderOrder=regional?1:2;
    scene.add(patch);
    render();
  };

  const resize = () => {
    if(disposed || !host.clientWidth || !host.clientHeight) return;
    renderer.setSize(host.clientWidth,host.clientHeight);
    camera.aspect=host.clientWidth/host.clientHeight;
    camera.updateProjectionMatrix(); render();
  };
  const observer=new ResizeObserver(resize); observer.observe(host); resize();
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  renderer.domElement.addEventListener("webglcontextlost",lost);

  const ready = Promise.all([
    loadTexture("/maps/earth.jpg").then(texture=>{ if(texture){earthMaterial.map=texture;earthMaterial.needsUpdate=true;render();} }),
    // A missing detail layer must not take the whole planet offline.
    ...cities.flatMap(city=>[true,false].map(regional=>
      loadCity(city,regional).catch(error=>{console.warn(`[Network globe] Optional imagery unavailable: ${city.id}`,error);})
    )),
    fetch("/maps/la-river.geojson").then(response=>{if(!response.ok)throw new Error("River unavailable");return response.json() as Promise<River>;}).then(data=>{
      if(disposed)return;
      for(const feature of data.features){
        const points=feature.geometry.coordinates.map(([lon,lat])=>new THREE.Vector3(...globePoint(lon,lat,1.000065)));
        if(points.length<2)continue;
        const curve=new THREE.CurvePath<THREE.Vector3>();
        for(let i=1;i<points.length;i++)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
        const geometry=new THREE.TubeGeometry(curve,Math.min(600,points.length*2),.000028,5,false);
        const river=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x70eeff,transparent:true,depthWrite:false}));
        river.renderOrder=3;
        riverGroup.add(river);
      }
      render();
    }).catch(error=>{console.warn("[Network globe] River overlay unavailable",error);}),
  ]);

  return { ready, render, dispose: () => {
    disposed=true; observer.disconnect(); renderer.domElement.removeEventListener("webglcontextlost",lost);
    scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose(); const materials=Array.isArray(object.material)?object.material:[object.material]; materials.forEach(m=>m.dispose());}});
    textures.forEach(texture=>texture.dispose()); renderer.dispose(); renderer.domElement.remove();
  }};
}
