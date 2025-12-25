import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;

/// 3D Farm View for Web using Three.js
class Farm3DWebView extends StatefulWidget {
  final int hens;
  final int goats;
  final int cows;
  final bool isNight;

  const Farm3DWebView({
    super.key,
    required this.hens,
    required this.goats,
    required this.cows,
    required this.isNight,
  });

  @override
  State<Farm3DWebView> createState() => _Farm3DWebViewState();
}

class _Farm3DWebViewState extends State<Farm3DWebView> {
  final String viewId = 'farm-3d-view-${DateTime.now().millisecondsSinceEpoch}';

  @override
  void initState() {
    super.initState();
    _registerView();
  }

  void _registerView() {
    ui_web.platformViewRegistry.registerViewFactory(viewId, (int id) {
      final iframe = html.IFrameElement()
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..srcdoc = _getHtmlContent();
      return iframe;
    });
  }

  String _getHtmlContent() {
    return '''
<!DOCTYPE html>
<html><head>
<style>body{margin:0;overflow:hidden;background:#87CEEB}</style>
</head><body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
const scene=new THREE.Scene();
scene.background=new THREE.Color(${widget.isNight ? '0x0a0a1a' : '0x87CEEB'});
scene.fog=new THREE.Fog(${widget.isNight ? '0x0a0a1a' : '0x87CEEB'},250,500);
const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(30,20,50);camera.lookAt(0,5,0);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);

const ambient=new THREE.AmbientLight(0xffffff,${widget.isNight ? 0.3 : 0.6});
scene.add(ambient);
const sun=new THREE.DirectionalLight(0xffffff,${widget.isNight ? 0 : 0.9});
sun.position.set(50,60,50);sun.castShadow=true;
scene.add(sun);

// Ground
const groundGeo=new THREE.PlaneGeometry(300,300);
const groundMat=new THREE.MeshStandardMaterial({color:0x4a9d2f});
const ground=new THREE.Mesh(groundGeo,groundMat);
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
scene.add(ground);

// Barn
function createBarn(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(14,9,12),new THREE.MeshStandardMaterial({color:0x8b0000}));
  body.position.y=4.5;body.castShadow=true;g.add(body);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(8,5,4),new THREE.MeshStandardMaterial({color:0x654321}));
  roof.position.y=11;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
  return g;
}
const barn=createBarn();barn.position.set(-60,0,-60);scene.add(barn);

// House
function createHouse(){
  const g=new THREE.Group();
  const walls=new THREE.Mesh(new THREE.BoxGeometry(10,6,12),new THREE.MeshStandardMaterial({color:0xd2691e}));
  walls.position.y=3;walls.castShadow=true;g.add(walls);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(7.5,4,4),new THREE.MeshStandardMaterial({color:0x8b4513}));
  roof.position.y=8.5;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
  return g;
}
const house=createHouse();house.position.set(60,0,-60);scene.add(house);

// Cow
function createCow(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(2,1.8,4),new THREE.MeshStandardMaterial({color:0xffffff}));
  body.position.y=2;body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.5),new THREE.MeshStandardMaterial({color:0xffffff}));
  head.position.set(0,2.5,2.3);head.castShadow=true;g.add(head);
  for(let i=0;i<4;i++){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.8,0.4),new THREE.MeshStandardMaterial({color:0xffffff}));
    leg.position.set((i%2?0.6:-0.6),0.9,(i<2?1.2:-1.2));leg.castShadow=true;g.add(leg);
  }
  return g;
}

// Goat
function createGoat(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.4,2.5),new THREE.MeshStandardMaterial({color:0xb8956a}));
  body.position.y=1.5;body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,1),new THREE.MeshStandardMaterial({color:0xb8956a}));
  head.position.set(0,2.2,1.5);head.castShadow=true;g.add(head);
  return g;
}

// Hen
function createHen(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16),new THREE.MeshStandardMaterial({color:0xdc4c2c}));
  body.position.y=0.6;body.scale.set(1,1.2,1.3);body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,16,16),new THREE.MeshStandardMaterial({color:0xdc4c2c}));
  head.position.set(0,1.1,0.4);head.castShadow=true;g.add(head);
  const comb=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.3,0.1),new THREE.MeshStandardMaterial({color:0xff0000}));
  comb.position.set(0,1.35,0.35);g.add(comb);
  return g;
}

// Add animals
const animals=[];
for(let i=0;i<${widget.cows};i++){
  const c=createCow();c.position.set(-30+i*8,0,20+Math.random()*20);
  c.userData={dir:new THREE.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize(),speed:0.02};
  animals.push(c);scene.add(c);
}
for(let i=0;i<${widget.goats};i++){
  const g=createGoat();g.position.set(30-i*6,0,20+Math.random()*20);
  g.userData={dir:new THREE.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize(),speed:0.025};
  animals.push(g);scene.add(g);
}
for(let i=0;i<Math.min(${widget.hens},15);i++){
  const h=createHen();h.position.set(Math.random()*40-20,0,30+Math.random()*20);
  h.userData={dir:new THREE.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize(),speed:0.015};
  animals.push(h);scene.add(h);
}

// Fence
function createFence(len){
  const g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color:0x8b6914});
  for(let i=-len/2;i<=len/2;i+=5){
    const post=new THREE.Mesh(new THREE.BoxGeometry(0.4,2.5,0.4),mat);
    post.position.set(i,1.25,0);post.castShadow=true;g.add(post);
  }
  for(let y of[0.6,1.3,2]){
    const rail=new THREE.Mesh(new THREE.BoxGeometry(len+10,0.2,0.3),mat);
    rail.position.y=y;rail.castShadow=true;g.add(rail);
  }
  return g;
}
[-75,75].forEach(z=>{const f=createFence(150);f.position.z=z;scene.add(f);});
[-75,75].forEach(x=>{const f=createFence(150);f.rotation.y=Math.PI/2;f.position.x=x;scene.add(f);});

// Trees
function createTree(){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.8,5,8),new THREE.MeshStandardMaterial({color:0x654321}));
  trunk.position.y=2.5;trunk.castShadow=true;g.add(trunk);
  const foliage=new THREE.Mesh(new THREE.SphereGeometry(3.5,8,8),new THREE.MeshStandardMaterial({color:0x228b22}));
  foliage.position.y=5.5;foliage.castShadow=true;g.add(foliage);
  return g;
}
for(let i=-70;i<=70;i+=15){
  [[-80,i],[80,i],[i,-80],[i,80]].forEach(([x,z])=>{
    const t=createTree();t.position.set(x,0,z);scene.add(t);
  });
}

// Controls
let drag=false,prev={x:0,y:0};
document.addEventListener('mousedown',e=>{drag=true;prev={x:e.clientX,y:e.clientY};});
document.addEventListener('mouseup',()=>drag=false);
document.addEventListener('mousemove',e=>{
  if(drag){
    camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),(e.clientX-prev.x)*0.01);
    if(camera.position.y<2)camera.position.y=2;
    camera.lookAt(0,5,0);
  }
  prev={x:e.clientX,y:e.clientY};
});
document.addEventListener('wheel',e=>{
  e.preventDefault();
  const dir=camera.position.clone().normalize();
  const dist=camera.position.length()+e.deltaY*0.05;
  camera.position.copy(dir.multiplyScalar(Math.max(15,dist)));
  if(camera.position.y<2)camera.position.y=2;
  camera.lookAt(0,5,0);
},{passive:false});

function animate(){
  requestAnimationFrame(animate);
  animals.forEach(a=>{
    a.position.x+=a.userData.dir.x*a.userData.speed;
    a.position.z+=a.userData.dir.z*a.userData.speed;
    if(Math.abs(a.position.x)>65||Math.abs(a.position.z)>65)a.userData.dir.multiplyScalar(-1);
    a.rotation.y=Math.atan2(a.userData.dir.x,a.userData.dir.z);
  });
  renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
animate();
</script></body></html>
''';
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(viewType: viewId);
  }
}
