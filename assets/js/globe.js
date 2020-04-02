const selectors = {
  container: "#home-planet",
  canvas: "#home-planet canvas"
};

const blue = "#170068";

const size = {
  size: 500
};

const tiling = {
  tiling: 1
};

const rotation = {
  rotation: 0
};

const globeSettings = {
  speed: 0.0008
};

class Globe {
  constructor() {
    this.update = this.update.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.container = document.querySelector(selectors.container);
    this.canvas = document.querySelector(selectors.canvas);

    this.createScene();
    this.handleResize();
    this.animate();
    this.update();

    window.addEventListener("resize", this.handleResize);
  }

  createScene() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      width: 500,
      height: 500,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    // Base scene setup
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(blue);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    // Create globe
    const globeContainer = new THREE.Object3D();
    scene.add(globeContainer);

    const globeTexture = new THREE.TextureLoader().load(
      "assets/images/stars_small.png"
    );
    globeTexture.wrapS = THREE.RepeatWrapping;
    globeTexture.wrapT = THREE.RepeatWrapping;
    globeTexture.repeat.set(4, 4);

    const globeMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      map: globeTexture
    });
    const globeGeometry = new THREE.SphereGeometry(85, 50, 50);
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.position.set(0, 0, 70);
    globeContainer.add(globe);

    // Create sign
    const signMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: THREE.ImageUtils.loadTexture("assets/images/sign.jpg"),
      transparent: true
    });
    const signSize = 130;
    const signGeometry = new THREE.PlaneGeometry(
      signSize,
      (signSize * 1) / 1.81,
      1
    );
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 0, 90);
    globe.add(signMesh);

    this.globeContainer = globeContainer;
    this.globeMaterial = globeMaterial;
    this.globe = globe;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.globe = globe;

    // Offset initial globe rotation a bit so it rotates into view
    this.rotateGlobe(-Math.PI / 8);

    // this.createControls();
  }

  createControls() {
    const gui = new dat.GUI({
      useLocalStorage: true
    });
    gui.useLocalStorage = true;
    gui.remember(globeSettings);
    gui.add(globeSettings, "speed", 0.00001, 0.1);

    const rotationFolder = gui.addFolder("rotation");
    rotationFolder.open();
    gui.remember(this.globeContainer.rotation);
    rotationFolder.add(this.globeContainer.rotation, "z", 0, 2 * Math.PI);

    gui.remember(tiling);
    const tilingController = gui.add(tiling, "tiling", 1, 10);
    tilingController.onChange(v => {
      globeMaterial.map.repeat.set(v, v);
      globeMaterial.map.needsUpdate = true;
    });
  }

  setActive(isActive) {
    this.isActive = isActive;
  }

  animate() {
    this.frameCallback = requestAnimationFrame(() => {
      if (this.isActive) {
        this.update();
      }
      this.animate();
    });
  }

  update() {
    this.rotateGlobe(globeSettings.speed);
    this.renderer.render(this.scene, this.camera);
  }

  rotateGlobe(amount) {
    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, -1, 0), amount);
    this.globe.quaternion.multiply(quaternion);
  }

  handleResize() {
    let size = Math.min(
      this.container.clientWidth,
      this.container.clientHeight
    );
    size -= size > 250 ? 60 : 20;
    this.renderer.setSize(this.container.clientWidth, size);
    this.camera.aspect = this.container.clientWidth / size;
    this.camera.updateProjectionMatrix();
  }
}
