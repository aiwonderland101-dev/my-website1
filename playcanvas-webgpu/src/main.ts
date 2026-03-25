import * as pc from 'playcanvas';

const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Missing #application-canvas element');
}

async function createGraphicsDevice() {
  const options: pc.GraphicsDeviceOptions = {
    alpha: true,
    depth: true,
    stencil: true,
    antialias: true,
    deviceTypes: ['webgpu']
  };

  const graphicsDevice = await pc.createGraphicsDevice(canvas, options);

  const defaultCanvas = new pc.CanvasElement();
  defaultCanvas._canvas = canvas;

  return graphicsDevice;
}

async function start() {
  const graphicsDevice = await createGraphicsDevice();

  const app = new pc.Application(canvas, {
    graphicsDevice,
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body),
    keyboard: new pc.Keyboard(document.body),
    elementInput: new pc.ElementInput(canvas)
  });

  app.start();

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  window.addEventListener('resize', () => {
    app.resizeCanvas(canvas.width, canvas.height);
  });

  const root = new pc.Entity();
  app.root.addChild(root);

  const camera = new pc.Entity();
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.1, 0.1, 0.18),
    nearClip: 0.1,
    farClip: 1000
  });
  camera.translate(0, 0, 5);
  app.root.addChild(camera);

  const light = new pc.Entity();
  light.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 1, 1),
    intensity: 1.2,
    castShadows: true
  });
  light.setEulerAngles(45, 30, 0);
  app.root.addChild(light);

  const cube = new pc.Entity();
  cube.addComponent('render', {
    type: 'box',
    material: new pc.StandardMaterial()
  });
  cube.translate(0, 0.5, 0);

  const cubeMaterial = new pc.StandardMaterial();
  cubeMaterial.diffuse = new pc.Color(0.2, 0.75, 0.95);
  cubeMaterial.update();
  cube.render.material = cubeMaterial;

  app.root.addChild(cube);

  app.on('update', (dt) => {
    cube.rotate(15 * dt, 30 * dt, 12 * dt);
  });
}

start().catch((err) => {
  console.error('Failed to initialize PlayCanvas', err);
  const message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.left = '20px';
  message.style.top = '20px';
  message.style.padding = '12px';
  message.style.background = 'rgba(220,20,20,0.85)';
  message.style.color = 'white';
  message.textContent = `WebGPU init error: ${err.message || err}`;
  document.body.appendChild(message);
});
