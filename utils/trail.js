import * as THREE from '../node_modules/three/build/three.module.js';

export class Trail {
    constructor(color, maxPoints = 500) {
        // Usa THREE.BufferGeometry para performance
        const geometry = new THREE.BufferGeometry();
        // Array para posições (x, y, z)
        const positions = new Float32Array(maxPoints * 3);
        // Array para cores (r, g, b)
        const colors = new Float32Array(maxPoints * 3);

        // Define os atributos da geometria
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Material da linha. vertexColors: true permite que cada vértice tenha uma cor.
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.95,
            linewidth: 2
        });

        this.line = new THREE.Line(geometry, material);
        this.maxPoints = maxPoints;
        this.points = [];
        this.color = new THREE.Color(color);
        this.positions = positions;
        this.colors = colors;
    }

    // Adiciona um novo ponto à trilha na posição atual do objeto
    addPoint(position) {
        this.points.push(position.clone());
        if (this.points.length > this.maxPoints) {
            this.points.shift(); // Remove o ponto mais antigo para manter o rastro
        }
        this.updateGeometry();
    }

    // Atualiza a geometria da linha
    updateGeometry() {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            this.positions[i * 3] = point.x;
            this.positions[i * 3 + 1] = point.y;
            this.positions[i * 3 + 2] = point.z;

            // Fator de opacidade e cor baseado na posição do ponto na trilha
            const alpha = Math.pow(i / this.points.length, 0.72);
            this.colors[i * 3] = this.color.r * alpha;
            this.colors[i * 3 + 1] = this.color.g * alpha;
            this.colors[i * 3 + 2] = this.color.b * alpha;
        }

        // Zera os pontos não utilizados
        for (let i = this.points.length; i < this.maxPoints; i++) {
            this.positions[i * 3] = this.positions[i * 3 + 1] = this.positions[i * 3 + 2] = 0;
            this.colors[i * 3] = this.colors[i * 3 + 1] = this.colors[i * 3 + 2] = 0;
        }

        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.geometry.attributes.color.needsUpdate = true;
        this.line.geometry.setDrawRange(0, this.points.length);
    }
}