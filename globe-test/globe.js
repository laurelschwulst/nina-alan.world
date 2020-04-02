const selectors = {
  canvas: ".globe canvas"
};

const blue = "#170068";

const size = {
  size: 500,
}

const tiling = {
  tiling: 1
}

const rotation = {
  rotation: 0,
}

class Globe {
  constructor() {
    this.update = this.update.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);

    this.canvas = document.querySelector(selectors.canvas);
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.globe = null;
    this.globeMaterial = null;
    this.globeSettings = {
      speed: 0.001
    };

    this.createScene();
    this.animate();

    // this.handleColorsChanged([blue, blue, "#FFFFFF"]);
    this.canvas.addEventListener("drop", this.handleDrop);
    this.canvas.addEventListener("dragover", this.handleDragOver);

    document.addEventListener("keydown", e => {
      if (e.keyCode == 32) {
        this.download();
      }
    });
  }

  createScene() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      width: 500,
      height: 500,
      antialias: true,
      preserveDrawingBuffer: true
    });

    renderer.setPixelRatio(1);
    // renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( blue);

    const aspect = 1;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    const globeContainer = new THREE.Object3D();
    scene.add(globeContainer);

    const globeMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      map: THREE.ImageUtils.loadTexture("sign.jpg"),
      transparent: true
    });
    globeMaterial.map.wrapS = THREE.RepeatWrapping;
    globeMaterial.map.wrapT = THREE.RepeatWrapping;
    globeMaterial.map.repeat.set(2, 2);
    globeMaterial.map.needsUpdate = true;
    this.globeMaterial = globeMaterial;
    // const globeContainer
    const globeGeometry = new THREE.SphereGeometry(85, 50, 50);
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.position.set(0,0, 70);
    globeContainer.add(globe);
    this.globeContainer = globeContainer;

    const signMaterial = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      map: THREE.ImageUtils.loadTexture("sign.jpg"),
      transparent: true
    });
    signMaterial.map.wrapS = THREE.RepeatWrapping;
    signMaterial.map.wrapT = THREE.RepeatWrapping;
    signMaterial.map.repeat.set(16, 16);
    signMaterial.map.repeat.x = 200;
    signMaterial.map.repeat.y = 200;
    signMaterial.map.needsUpdate = true;
    const signGeometry = new THREE.PlaneGeometry(150, 75, 1);
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 0, 100);
    // globe.add(signMesh)

    this.renderer = renderer;
    this.scene = scene;
    window.scene = scene;
    this.camera = camera;
    this.globe = globe;
    this.globeMaterial = new THREE.MeshBasicMaterial();

    const gui = new dat.GUI({
      useLocalStorage: true
    });
    gui.useLocalStorage = true;
    gui.remember(this.globeSettings);
    gui.add(this.globeSettings, "speed", 0.00001, 0.1);

    gui.remember(size)
    const sizeController = gui.add(size, 'size', 100, 1000)
    sizeController.onChange((v) => {
      this.renderer.setSize(v, v)
    })

    const rotationFolder = gui.addFolder("rotation")
    rotationFolder.open();
    gui.remember(this.globeContainer.rotation)
    rotationFolder.add(this.globeContainer.rotation, 'z', 0, 2 * Math.PI)

    gui.remember(tiling)
    const tilingController = gui.add(tiling, 'tiling', 1, 10)
    tilingController.onChange((v) => {
      globeMaterial.map.repeat.set(v, v);
      globeMaterial.map.needsUpdate = true;
    })

    var obj = { render: () => this.download()};
    gui.add(obj,'render');





    const loader = new THREE.TextureLoader();
    // loader.load("stars.png", texture => {
    //   texture.wrapS = THREE.RepeatWrapping;
    //   texture.wrapT = THREE.RepeatWrapping;
    //   texture.repeat.set(16, 16);
    //   texture.repeat.x = 200;
    //   texture.repeat.y = 200;
    //   texture.needsUpdate = true;
    //   this.globeMaterial.uniforms["mask"].value = texture;
    // });
  }

  animate() {
    this.frameCallback = requestAnimationFrame(() => {
      this.update();
      this.animate();
    });
  }

  download() {
    cancelAnimationFrame(this.frameCallback);
    const currentRotationFrames = (Math.PI * 2) / this.globeSettings.speed;
    const frameRate = 24;
    var capturer = new CCapture({
      name: 'planet-render',
      format: 'webm',
      workersPath: '',
      framerate: frameRate
    });

    const currentFps = 60;
    const targetFps = frameRate;

    // video will be at 30fps, so halve the number of frames
    const rotationFrames = currentRotationFrames / (currentFps / targetFps);
    console.log("will download", rotationFrames);

    document.getElementById("progress").style.display = "block"

    capturer.start();
    let currentFrame = 0;
    const downloadNextFrame = () => {
      this.globe.rotation.y = -(currentFrame / rotationFrames) * Math.PI * 2;

      this.renderer.render(this.scene, this.camera);
      capturer.capture(this.canvas);

      // var imageData = this.canvas.toDataURL()
      // var imageLink = document.createElement('a');
      // imageLink.download = 'frame-' + currentFrame + '.png'
      // console.log("download", imageLink.download)

      // imageLink.href = imageData;
      // imageLink.click();

      // step globe rotation
      // console.log(this.globe.rotation.y)

      ++currentFrame;
      document.getElementById("progress").innerHTML = 'Rendering ' + (currentFrame / rotationFrames * 100).toFixed(2) + '%';

      if (currentFrame < rotationFrames) {
        requestAnimationFrame(() => downloadNextFrame());
      } else {
        capturer.stop();
        document.getElementById("progress").innerHTML = 'Rendering ' + (currentFrame / rotationFrames).toFixed(2) + '%';

        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        capturer.save();
        console.log("done downloading");
      }
    };

    downloadNextFrame();
  }

  update() {
    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(
      new THREE.Vector3(0, -1, 0),
      this.globeSettings.speed
    );
    this.globe.quaternion.multiply(quaternion);

    this.renderer.render(this.scene, this.camera);
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    var file = e.dataTransfer.files[0];
    var reader = new FileReader();
    reader.onload = () => {
      var image = document.createElement("img");
      image.src = event.target.result;
      var texture = new THREE.Texture(image);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(2, 2);
      texture.needsUpdate = true;
      this.globe.material.map = texture;
    };
    reader.readAsDataURL(file);
  }

  handleColorsChanged(colors) {
    // this.scene.background = new THREE.Color(colors[0]);
    this.globeMaterial.uniforms["colorA"].value = new THREE.Color(colors[1]);
    this.globeMaterial.uniforms["colorB"].value = new THREE.Color(colors[2]);
  }

  handleResize() {
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  createGlobeMaterial() {
    const uniforms = {
      colorB: { type: "vec3", value: new THREE.Color(0xffffff) },
      colorA: { type: "vec3", value: new THREE.Color(0x0000ff) },
      mask: { type: "t", value: new THREE.Texture() }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = vec2(uv.x * 4.0, uv.y * 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D mask;
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec2 vUv;

        void main() {
          vec3 maskColor = texture2D(mask, vUv).rgb;
          gl_FragColor = vec4(mix(colorA, colorB, maskColor.r), maskColor.r * 1.5);
        }
      `
    });
    // material.transparent = true;
    // material.depthWrite = false;

    return material;
  }
}

new Globe();
