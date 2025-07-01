import * as THREE from 'three';

export function createIcosahedron() {
    const geo = new THREE.IcosahedronGeometry(1.0, 2);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
    });

    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.scale.setScalar(1.001);
    mesh.add(wireMesh);

    return mesh;
}
