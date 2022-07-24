import * as THREE from '../lib/three.module.js';
import { ARButton } from '../lib/ARButton.js';
import * as BufferGeometryUtils  from '../lib/BufferGeometryUtils.js';

let container, labelContainer;
let camera,cameraM, camGui,scene,sceneGui, renderer,rendererGui, light,ambientLight;
let controller;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hitTestSource = null;
let hitTestSourceRequested = false;
const pointG=new THREE.Group();
let measurements = [];
let labels = [];
var mouse = new THREE.Vector2();
let reticle;
let currentLine = null;
let tempLine=null;
let width, height;
let plant=[];
let roomLine;
var trig=0;
var counter=0;
var roomCounter=0;


var touchStartTimeStamp = 0;
var touchEndTimeStamp   = 0;
var hold=0;
var doubleTrig=0;


var sHcenter=[];

var timer;


var waypZ;


let form=document.getElementById("choose");

//let close, undo,undoD,closeD;
let cameraTrig=0;
var undo=null;
var close=null;
var rep=null;


function export2txt() {
  plant.push(measurements);

  scene.remove(currentLine);
  pointG.clear();
  //location.reload();
  var originalData

  for(var pIn=0;pIn<plant.length;pIn++){
    originalData = {
      Rooms: [{
          name: pIn,
          data: plant[pIn]
          }]
      };




    let lineGeometry;
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 5,
      linecap: 'round'
    });


    lineGeometry = new THREE.BufferGeometry().setFromPoints(plant[pIn]);
    roomLine=new THREE.Line(lineGeometry, lineMaterial);
    scene.add(roomLine);

  }
  /*
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(plant, null, 2)], {
    type: "text/plain"
  }));
  a.setAttribute("download", "data.txt");

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  */
  measurements=[];
  counter=0;
  var pasTs=[];
  //pasTs.push(plant);
//  pasTs.push(sHcenter);

  pasTs.splice(0,0,plant);
  pasTs.splice(1,0,sHcenter);
  var passaggio={a:[]};
  var passDue=[];
  for(var inPoli=0;inPoli<plant.length-1;inPoli++){
    for(var inLati=0;inLati <plant[inPoli].length-1;inLati++){
      var strt,endt,ltt;
      strt=[ plant[inPoli][inLati].x , plant[inPoli][inLati].y ];
      endt=[ plant[inPoli][inLati+1].x , plant[inPoli][inLati+1].y ]
      ltt=[strt,endt]
      passDue.push(ltt);

    }
    passaggio.a.push(passDue);
    passDue=[];



  }
  var spass=new Array();
  spass.push(passaggio);
  sessionStorage.setItem('passaggio', JSON.stringify(passaggio));
  window.location.href = "/src/third/index.html";
}


function roomData() {
  plant.push(measurements);

  scene.remove(currentLine);
  pointG.clear();
  var originalData

  for(var pIn=0;pIn<plant.length;pIn++){
    originalData = {
      Rooms: [{
          name: pIn,
          data: plant[pIn]
          }]
      };

    let lineGeometry;
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 5,
      linecap: 'round'
    });

    lineGeometry = new THREE.BufferGeometry().setFromPoints(plant[pIn]);
    roomLine=new THREE.Line(lineGeometry, lineMaterial);
    scene.add(roomLine);

    const sHpath = new THREE.Path();

    sHpath.autoClose=true;



    for(var inShLin=0;inShLin<plant[pIn].length;inShLin++){
      if(inShLin==0){
        sHpath.moveTo(plant[pIn][inShLin].x,plant[pIn][inShLin].y)
      }else{
        sHpath.lineTo(plant[pIn][inShLin].x,plant[pIn][inShLin].y)
      }

    }


    const sHpoints = sHpath.getPoints();

    const heartShape = new THREE.Shape(sHpoints);

    const extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    const sHgeometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
    const sHgeometry1 = new THREE.BufferGeometry().setFromPoints( sHpoints );
    const sHmesh = new THREE.Mesh( sHgeometry, new THREE.MeshPhongMaterial() );

    sHgeometry1.attributes.position.needsUpdate = true;
    sHgeometry1.computeBoundingSphere();
    if(pIn==plant.length-1){
      sHcenter.splice(pIn,0,sHgeometry1.boundingSphere.center);
      console.log(sHcenter);
      }else{

      }
    scene.add( sHmesh );




  }

  //// START senza touches
/*
  if(plant.length==2){
    export2txt()
  }
*/
  //// END senza touches

  measurements=[];
  counter=0;
}



function toScreenPosition(point, camera){

  var vector = new THREE.Vector3();

  vector.copy(point);
  vector.project(camera);

  vector.x = (vector.x + 1) * width /2;
  vector.y = (-vector.y + 1) * height/2;
  vector.z = 0;

  return vector

};

function getCenterPoint(points) {
  let line = new THREE.Line3(...points)
  return line.getCenter();
}

function matrixToVector(matrix) {
  let vector = new THREE.Vector3();
  vector.setFromMatrixPosition(matrix);
  return vector;
}

function initLine(pointe) {

  var tempGeo
  let lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 5,
    linecap: 'round'
  });
  if(counter==-1){
      return;
  }else{
      if(tempLine){
        scene.remove(tempLine)
      };
      if(pointe!=-1){
        var tempPunt=[];
        tempPunt.push(measurements[counter-1]);

        tempPunt.push(pointe);
        tempGeo= new THREE.BufferGeometry().setFromPoints(tempPunt);
        scene.remove(currentLine);
      }
  }
  let lineGeometry
  if(pointe!=-1){

    lineGeometry = new THREE.BufferGeometry().setFromPoints(measurements);
    tempLine=new THREE.Line(tempGeo, lineMaterial);
    scene.add(tempLine);
    initWayP(measurements);
    return new THREE.Line(lineGeometry, lineMaterial);
  }else{
    if(tempLine){
      scene.remove(tempLine);
      scene.remove(currentLine);
      lineGeometry = new THREE.BufferGeometry().setFromPoints(measurements);
      return new THREE.Line(lineGeometry, lineMaterial);

    };
  }


}

function updateLine(matrix) {
  let positions = tempLine.geometry.attributes.position.array;

  positions[3] = matrix.x;
  positions[4] = matrix.y;
  positions[5] = matrix.z;

  tempLine.geometry.attributes.position.needsUpdate = true;
  tempLine.geometry.computeBoundingSphere();
}

function initReticle() {
  let ring = new THREE.RingBufferGeometry(0.045, 0.05, 32)
  let dot = new THREE.CircleBufferGeometry(0.005, 32)
//  let ring = new THREE.RingBufferGeometry(0.045, 0.05, 32);
//  let dot = new THREE.CircleBufferGeometry(0.005, 32);
  reticle = new THREE.Mesh(
    BufferGeometryUtils.mergeBufferGeometries([ring, dot]),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true,alpha:true });  /// da mettere --->
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);


  /////////////  !!!!!!!!!!! RIAGGIUNGERE  !!!!!!!!!
  renderer.xr.enabled = true;
  //////////////////////////////////////////////////


/*
  rendererGui	= new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  rendererGui.setSize( window.innerWidth, window.innerHeight/10)
*/
}

function initLabelContainer() {
  labelContainer = document.createElement('div');
  labelContainer.style.position = 'absolute';
  labelContainer.style.top = '0px';
  labelContainer.style.pointerEvents = 'none';
  labelContainer.setAttribute('id', 'container');
}

function initCamera() {

  camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 20);

  //  camera	= new THREE.OrthographicCamera( (window.innerWidth/2) / - 2, (window.innerWidth/2) / 2, (window.innerHeight) / 2, (window.innerHeight) / - 2, 0.01, 100000 );
  //  camera.position.z = 50;

  //cameraM= new THREE.OrthographicCamera( (window.innerWidth/2) / - 2, (window.innerWidth/2) / 2, (window.innerHeight/2) / 2, (window.innerHeight/2) / - 2, 0.01, 100000 );
  //cameraM.position.z = 150;


}

function initLight() {
  light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  //ambientLight = new THREE.AmbientLight('white', 1.2);
}

function initScene() {
  scene = new THREE.Scene();
  //sceneGui = new THREE.Scene();

}

function getDistance(points) {
  if (points.length == 2)
    return points[0].distanceTo(points[1]);
}

function initXR() {
  container = document.createElement('div');
  document.body.appendChild(container);
  //container.id='container';

  width = window.innerWidth;
  height = window.innerHeight;

  initScene();

  initCamera();
  //scene.add(camera);
  //scene.add(cameraM);


  initLight();
  scene.add(light);

  initRenderer()
  container.appendChild(renderer.domElement);


  initLabelContainer()
  container.appendChild(labelContainer);
  scene.add(pointG);
  //container.appendChild(rendererGui.domElement);


  /////////////  !!!!!!!!!!! RIAGGIUNGERE  x AR  !!!!!!!!!

  document.body.appendChild(ARButton.createButton(renderer, {
      optionalFeatures: ["dom-overlay"],
      domOverlay: {root: document.querySelector('#container')},
      requiredFeatures: ['hit-test']
  }));

/*
  var lay= document.querySelectorAll('canvas');
  lay[0].style.position="absolute";
  lay[1].style.position="absolute";
  lay[1].style.bottom="0px";
  lay[1].style.zIndex=30;
*/

/*
  sceneGui.add(ambientLight);
  sceneGui.add(camGui);
*/


  /////////////  !!!!!!!!!!! RIAGGIUNGERE  x  AR  !!!!!!!!!
  controller = renderer.xr.getController(0);
  controller.addEventListener('selectstart', onInputStart);
  controller.addEventListener('selectend', onTouchEnd);
  scene.add(controller);
  ///////////////////////////////////////

  initReticle();
  scene.add(reticle);

  //window.addEventListener("touchstart", onInputStart, false);
  //window.addEventListener("pointerdown", onInputStart, false);
  //window.addEventListener('pointerup', onTouchEnd,false);
  //renderer.domElement.addEventListener("pointermove", onMouseMove, false);
  ///////////


  window.addEventListener('resize', onWindowResize, false);
  animate()
}
/*
function onMouseMove(event) {
  if (currentLine && trig==1) {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    vectorio.set( pointer.x, pointer.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) );
    vectorio.unproject( camera );
    var p=new THREE.Vector3(vectorio.x,vectorio.y,0);
    reticle.position.copy(p)
    updateLine(p);
  }

}
*/

function onTouchEnd(e) {
    touchEndTimeStamp = e.timeStamp;
    /// !!!!  START IF //!!!!  --->
//    if (doubleTrig==0){

      var difff=new Date().getTime();

      if(difff-hold<700)   {

        hold=0;
        /*
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        vectorio.set( pointer.x, pointer.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) );
        vectorio.unproject( camera );
        var p=new THREE.Vector3(vectorio.x,vectorio.y,0);
        var pic=new THREE.Vector3(pointer.x,pointer.y,0);
        measurements.push(p);
        counter++;
        trig=1;
        if (counter>=0) {

          currentLine=initLine(measurements);
          scene.add(currentLine);

        }
        */

        if (reticle.visible) {

          measurements.push(matrixToVector(reticle.matrix));
          counter++;
          trig=1;

          if (counter>=0) {

            currentLine=initLine(measurements);
            scene.add(currentLine);

          }

        }



        /*
        if (counter>0) {
          raycaster.setFromCamera( pointer, camera );
          console.log("pointer   ",pointer);
          const intersects = raycaster.intersectObject( waypZ, true );

          if ( intersects.length > 0 ) {
      console.log("hai premuto close  ",intersects)
            if(intersects[ 0 ].object.name=="WayP1" ){


              let session = renderer.xr.getSession();
              session.end();

              measurements.push(new THREE.Vector3(measurements[0].x,measurements[0].y,measurements[0].z));

              currentLine=initLine(measurements[counter-1]);
              scene.add(currentLine);
              counter++;

              cameraTrig=1;
              //export2txt();

            }

            if(intersects[ 0 ].object.name=="rep" ){
              export2txt();


            }

          }


        }
  */
      }// in miliseconds
    /// !!!!  end IF //!!!! --->
//  }

}
const vectorio = new THREE.Vector3();


function onInputStart(event) {

///////// START  parte del doubletrig  ///////
/*
  if(event.touches.length > 1) {
        doubleTrig=1;
    }else{
        doubleTrig=0;
    }
*/
 ///////  END    parte del doubletrig  ///////

  touchStartTimeStamp = event.timeStamp;
  hold=new Date().getTime();

}

/*
function onSelect() {
  if (reticle.visible) {

    measurements.push(matrixToVector(reticle.matrix));



    if (counter>=0) {

      currentLine=initLine(measurements);
      scene.add(currentLine);


    }
    counter++;
    trig=1;

  }

}
*/

function initWayP(point) {
  pointG.clear();
  for (var nSc=0;nSc<scene.children.length;nSc++){

     if(scene.children[nSc].name=="WayP1") {
       scene.remove(waypZ);
     }
  }

  //
  for (var an=0;an<measurements.length;an++){
  //let ring = new THREE.RingBufferGeometry(0.045, 0.05, 32).rotateX(- Math.PI / 2);

    if (an==0 && trig==1){

      let dotoZ = new THREE.SphereGeometry(0.02, 16, 12);
      let colr={color: "green"};
      waypZ = new THREE.Mesh(dotoZ, new THREE.MeshBasicMaterial(colr));

      waypZ.name = "WayP1";
      //waypZ.scale.set(2,2,2)
      waypZ.position.copy(measurements[an]);
      scene.add(waypZ)
    }else{
      let doto = new THREE.SphereGeometry(0.02, 16, 12);
      let colr={color: "red"};
      let wayp = new THREE.Mesh(doto, new THREE.MeshBasicMaterial(colr));

      wayp.name = "WayP";

      wayp.position.copy(measurements[an]);
      pointG.add(wayp);

    }

  }

}

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {

  if (frame){


    let referenceSpace = renderer.xr.getReferenceSpace();
    let session = renderer.xr.getSession();
    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace('viewer').then(function (referenceSpace) {
        session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
          hitTestSource = source;
        });
      });
      session.addEventListener('end', function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      let hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length) {
        let hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
      } else {
        reticle.visible = false;
      }

      if (currentLine && trig==1) {
        updateLine(matrixToVector(reticle.matrix));
      }
    }

    labels.map((label) => {
      let pos = toScreenPosition(label.point, renderer.xr.getCamera(camera));
      let x = pos.x;
      let y = pos.y;
      label.div.style.transform = "translate(-50%, -50%) translate(" + x + "px," + y + "px)";
    })
  }

  if (hold!==0){
    ////////   IF del doubleTrig   ////////
     //if(doubleTrig==0){
      var difff=new Date().getTime();
      if(difff-hold>=1000)   {
        hold=0;
        measurements.push(new THREE.Vector3(measurements[0].x,measurements[0].y,measurements[0].z));
        counter=counter+1;
        currentLine=initLine(-1);
        scene.add(currentLine);
        trig=0;
        roomCounter++;
        //cameraTrig=1;
        roomData();
      }

      //}// in miliseconds
        /////  START sezione NO-AR ///
        /*
        measurements.push(new THREE.Vector3(measurements[0].x,measurements[0].y,measurements[0].z));
        counter=counter+1;
        currentLine=initLine(-1);
        scene.add(currentLine);
        trig=0;
        roomCounter++;
        //cameraTrig=1;
        roomData();
        */
        /////  END sezione NO-AR ///


        ///// START sezione AR
        ////******************




        ////******************

        /////END sezione AR



      ////////   ELSE dell' IF del doubleTrig   ////////
      ///  if(doubleTrig==0){   ----->

      }else{
        var difff=new Date().getTime();
        if(difff-hold>=10000)   {
          hold=0;


          //measurements.push(new THREE.Vector3(measurements[0].x,measurements[0].y,measurements[0].z));
          //counter=counter+1;
          //currentLine=initLine(-1);
          //scene.add(currentLine);
          trig=0;
          //roomCounter++;

          //cameraTrig=1;
          export2txt();



        }// in miliseconds


      }

    //}




    if(cameraTrig==0){
      renderer.render( scene, camera );
      //rendererGui.render( sceneGui, camGui );
    }


}

export { initXR }
