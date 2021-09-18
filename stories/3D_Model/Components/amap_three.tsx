import { Scene } from '@antv/l7';
import { GaodeMap, Mapbox } from '@antv/l7-maps';
import { ThreeLayer, ThreeRender, ILngLat } from '@antv/l7-three';
import * as React from 'react';
// import { DirectionalLight, Scene as ThreeScene } from 'three';
import * as THREE from 'three';
// tslint:disable-next-line:no-submodule-imports
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class GlTFThreeJSDemo extends React.Component {
  // @ts-ignore
  private scene: Scene;

  public componentWillUnmount() {
    this.scene.destroy();
  }

  public async componentDidMount() {
    const response = await fetch(
      'https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json',
    );
    const pointsData = await response.json();

    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        center: [111.4453125, 32.84267363195431],
        pitch: 45,
        rotation: 30,
        zoom: 13,
      }),
    });
    this.scene = scene;
    scene.registerRenderService(ThreeRender);
    scene.on('loaded', () => {
      const threeJSLayer = new ThreeLayer({
        enableMultiPassRenderer: false,
        onAddMeshes: (threeScene: THREE.Scene, layer: ThreeLayer) => {
          threeScene.add(new THREE.AmbientLight(0xffffff));
          const sunlight = new THREE.DirectionalLight(0xffffff, 0.25);
          sunlight.position.set(0, 80000000, 100000000);
          sunlight.matrixWorldNeedsUpdate = true;
          threeScene.add(sunlight);

          // threeScene.applyMatrix4(
          //   layer.getModelMatrix(
          //     [111.4453125, 32.84267363195431], // 经纬度坐标
          //     0, // 高度，单位米/
          //     [Math.PI / 2, -Math.PI, 0], // 沿 XYZ 轴旋转角度
          //     [1, 1, 1], // 沿 XYZ 轴缩放比例
          //   ),
          // )
          // 使用 Three.js glTFLoader 加载模型
          const loader = new GLTFLoader();
          loader.load(
            // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf',
            // 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AnimatedCube/glTF/AnimatedCube.gltf',
            // 'https://gw.alipayobjects.com/os/antvdemo/assets/gltf/radar/34M_17.gltf',
            // 'https://gw.alipayobjects.com/os/antvdemo/assets/gltf/duck/Duck.gltf', // duck
            // 'https://gw.alipayobjects.com/os/antvdemo/assets/gltf/truck/CesiumMilkTruck.gltf', // Truck
            // 'https://gw.alipayobjects.com/os/antvdemo/assets/gltf/man/CesiumMan.gltf',
            'https://gw.alipayobjects.com/os/bmw-prod/3ca0a546-92d8-4ba0-a89c-017c218d5bea.gltf',
            (gltf) => {
              // 根据 GeoJSON 数据放置模型
              layer.getSource().data.dataArray.forEach(({ coordinates }) => {
                const gltfScene = gltf.scene;
                gltfScene.applyMatrix4(
                  // 生成模型矩阵
                  layer.getModelMatrix(
                    [coordinates[0], coordinates[1]], // 经纬度坐标
                    0, // 高度，单位米/
                    [Math.PI / 2, -Math.PI, 0], // 沿 XYZ 轴旋转角度
                    [1000, 1000, 1000], // 沿 XYZ 轴缩放比例
                  ),
                );
                const animations = gltf.animations;
                if (animations && animations.length) {
                  const mixer = new THREE.AnimationMixer(gltfScene);
                  // @ts-ignore
                  // for (let i = 0; i < 1; i++) {
                  const animation = animations[2];

                  // There's .3333 seconds junk at the tail of the Monster animation that
                  // keeps it from looping cleanly. Clip it at 3 seconds

                  const action = mixer.clipAction(animation);

                  action.play();
                  // }
                  layer.addAnimateMixer(mixer);
                }
                // console.log(gltfScene.position)
                let center = scene.getCenter();
                console.log(center);
                console.log(layer.getObjectLngLat(gltfScene));
                // layer.setObjectLngLat(gltfScene, [center.lng + 0.05, center.lat] as ILngLat, 0)
                // layer.setObjectLngLat(gltfScene, [center.lng, center.lat] as ILngLat, 0)
                let t = 0;
                setInterval(() => {
                  t += 0.01;
                  layer.setObjectLngLat(
                    gltfScene,
                    [center.lng, center.lat + Math.sin(t) * 0.1] as ILngLat,
                    0,
                  );
                  // layer.setObjectLngLat(model, [center.lng + 0.2, center.lat], 0)
                }, 16);

                // 向场景中添加模型
                threeScene.add(gltfScene);
              });
              // 重绘图层
              layer.render();
            },
          );
        },
      })
        .source({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [111.4453125, 32.84267363195431],
              },
            },
          ],
        })
        .animate(true);
      scene.addLayer(threeJSLayer);
    });
  }

  public render() {
    return (
      <div
        id="map"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
}
