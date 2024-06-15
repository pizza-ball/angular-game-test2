import { ElementRef, Injectable } from '@angular/core';
import { Color3, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from '@babylonjs/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  GROUND_LENGTH = 500;
  GROUND_WIDTH = 20;

  // store the Engine
  engine: any = null;

  constructor() {}


  // // the Engine will render into the Canvas element
  // start(canvas: ElementRef<HTMLCanvasElement>, scene: Scene) {
  //   this.engine = new Engine(this.canvas, true);

  //   // ... you can add content to the Scene

  //   // ignore the change events from the Engine in the Angular ngZone
  //   this.ngZone.runOutsideAngular(() => {
  //     // start the render loop and therefore start the Engine
  //     this.engine.runRenderLoop(() => scene.render())
  //   });
  // }

  public CreateScene(canvas: HTMLCanvasElement): Scene {
    this.engine = new Engine(canvas, true);

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(this.engine);

    var startPoint = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    var endPoint = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    startPoint.position.z = -(this.GROUND_LENGTH / 2);
    endPoint.position.z = this.GROUND_LENGTH / 2;

    var camera = new UniversalCamera("camera", new Vector3(0, 10, startPoint.position.z), scene);
    //var camera = new FollowCamera("camera", new Vector3(0, 10, startPoint.position.z), scene);
    camera.rotation = new Vector3(.8, 0, 0);

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    //camera.setTarget(Vector3.Zero());

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(.5, 3, 5), scene);
    //light.specular = new Color3(0.1, 0.12, 0.41);
    //var pointLight = new PointLight("pointLight", new Vector3(.5, 1, 5), scene);
    //pointLight.specular = new Color3(0.12, 0.12, 0.41);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = .7;
    //pointLight.intensity = 5;

    var ground = MeshBuilder.CreateGround("ground", { width: this.GROUND_WIDTH, height: this.GROUND_LENGTH }, scene);

    let groundMaterial = new StandardMaterial("Ground Material", scene);
    groundMaterial.disableLighting = true;
    groundMaterial.emissiveColor = new Color3(1, 1, 1);
    ground.material = groundMaterial;

    let groundTexture = new Texture("/assets/bamboofloor.png", scene);
    groundTexture.uScale = this.GROUND_WIDTH/10;
    groundTexture.vScale = this.GROUND_LENGTH/15;
    //groundMaterial.diffuseColor = new Color3(0, 1, 1);
    (<StandardMaterial>ground.material).diffuseTexture = groundTexture;

    var cube1 = MeshBuilder.CreateBox("box1", { size: 1 }, scene);
    cube1.material = new StandardMaterial("bluebox", scene);
    (<StandardMaterial>cube1.material).emissiveColor = new Color3(0.18, 0.22, 0.63);
    cube1.position = new Vector3(2, .5, startPoint.position.z + 10);
    cube1.rotation = new Vector3(0, .4, 0);

    var cube2 = MeshBuilder.CreateBox("box2", { size: 2 }, scene);
    cube2.material = new StandardMaterial("yellowbox", scene);
    (<StandardMaterial>cube2.material).emissiveColor = new Color3(0.94, 0.93, 0.03);
    cube2.position = new Vector3(-3, 1, startPoint.position.z + 30);
    cube2.rotation = new Vector3(0, -.3, 0);

    var cube3 = MeshBuilder.CreateBox("box3", { size: 3 }, scene);
    cube3.material = new StandardMaterial("bigrotate", scene);
    (<StandardMaterial>cube3.material).emissiveColor = new Color3(0.22, 0.83, 0.07);
    cube3.position = new Vector3(4, 1, startPoint.position.z + 60);
    cube3.rotation = new Vector3(0, -.3, 0);

    var wall1 = MeshBuilder.CreatePlane("leftWall", { width: this.GROUND_WIDTH/1.5, height: this.GROUND_LENGTH }, scene);
    wall1.material = new StandardMaterial("wallmat1", scene);
    (<StandardMaterial>wall1.material).emissiveColor = new Color3(1, 1, 1);
    wall1.position = new Vector3(-3, 1, 0);
    wall1.rotation = new Vector3(0, 4.71238898038469, 1.5707963267948966);
    let wall1Texture = new Texture("/assets/wall1.png", scene);
    wall1Texture.uScale = this.GROUND_WIDTH/10;
    wall1Texture.vScale = this.GROUND_LENGTH/15;
    (<StandardMaterial>wall1.material).diffuseTexture = wall1Texture;

    var wall2 = MeshBuilder.CreatePlane("rightWall", { width: this.GROUND_WIDTH/1.5, height: this.GROUND_LENGTH }, scene);
    wall2.material = new StandardMaterial("wallmat2", scene);
    (<StandardMaterial>wall2.material).emissiveColor = new Color3(1, 1, 1);
    wall2.position = new Vector3(3, 1, 0);
    wall2.rotation = new Vector3(0, 1.5707963267948966, 1.5707963267948966);
    let wall2Texture = new Texture("/assets/wall2.png", scene);
    wall2Texture.uScale = this.GROUND_WIDTH/10;
    wall2Texture.vScale = this.GROUND_LENGTH/15;
    (<StandardMaterial>wall2.material).diffuseTexture = wall2Texture;

    // Code in this function will run at the framerate of the monitor
    // scene.onAfterRenderObservable.add(() => {
    //   camera.position.z += .005;
    //   cube3.rotation.y -= .01;
    // });

    return scene;
  }

  updateBG1(scene: Scene){
    if(scene._activeCamera){
      scene._activeCamera.position.z += .05;
    }
    var mesh = scene.getMeshByName("box3");
    if (mesh){
      mesh.rotation.y -= .01;
    }
    scene.render();
  }
}
