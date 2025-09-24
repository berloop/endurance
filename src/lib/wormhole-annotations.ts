// lib/wormhole-annotations.ts
import * as THREE from 'three';

export class WormholeAnnotations {
  private scene: THREE.Scene;
  private annotations: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.annotations = new THREE.Group();
    this.annotations.name = 'wormholeAnnotations';
  }

  public createAnnotations(params: { rho: number; a: number; M: number }) {
    // Clear existing annotations
    this.clearAnnotations();

    // Create dimensional lines and labels
    this.createRadiusAnnotation(params.rho);
    this.createLengthAnnotation(params.a);
    this.createCoordinateLines();
    this.createParameterLabels(params);

    this.scene.add(this.annotations);
  }

 private createRadiusAnnotation(rho: number) {
  // Position relative to throat (z=0 plane)
  const radiusGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(rho * 1.5, 0, 0)
  ]);
  
  const radiusMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000, // Bright red for visibility
    linewidth: 3
  });
  
  const radiusLine = new THREE.Line(radiusGeometry, radiusMaterial);
  this.annotations.add(radiusLine);

  // Arrow at throat level
  const arrowGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
  arrow.position.set(rho * 1.5, 0, 0); // Same z-level as throat
  arrow.rotation.z = -Math.PI / 2;
  this.annotations.add(arrow);
}

  private createLengthAnnotation(a: number) {
    // Length lines showing 2a
    const lengthGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.1, 0, -a),
      new THREE.Vector3(-0.1, 0, a)
    ]);
    
    const lengthMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 12
    });
    
    const lengthLine = new THREE.Line(lengthGeometry, lengthMaterial);
    this.annotations.add(lengthLine);

    // Add end markers
    const markerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.15, 0, a),
      new THREE.Vector3(-0.05, 0, a)
    ]);
    const topMarker = new THREE.Line(markerGeometry, lengthMaterial);
    this.annotations.add(topMarker);

    const bottomMarkerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.15, 0, -a),
      new THREE.Vector3(-0.05, 0, -a)
    ]);
    const bottomMarker = new THREE.Line(bottomMarkerGeometry, lengthMaterial);
    this.annotations.add(bottomMarker);

    // Create 2a label
    this.createTextLabel('2a', new THREE.Vector3(-0.3, 0, 0));
  }

  private createCoordinateLines() {
    // l-coordinate arrow (along z-axis)
    const lArrowGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 2)
    ]);
    
    const coordinateMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
      transparent: true,
      opacity: 0.7
    });
    
    const lArrow = new THREE.Line(lArrowGeometry, coordinateMaterial);
    this.annotations.add(lArrow);

    // l-coordinate arrowhead
    const lArrowHead = new THREE.ConeGeometry(0.03, 0.08, 8);
    const lArrowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.7 
    });
    const lArrowMesh = new THREE.Mesh(lArrowHead, lArrowMaterial);
    lArrowMesh.position.set(0, 0, 2);
    this.annotations.add(lArrowMesh);

    // r-coordinate arrow (radial)
    const rArrowGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.5, 0, 0)
    ]);
    
    const rArrow = new THREE.Line(rArrowGeometry, coordinateMaterial);
    this.annotations.add(rArrow);

    // r-coordinate arrowhead
    const rArrowMesh = new THREE.Mesh(lArrowHead, lArrowMaterial);
    rArrowMesh.position.set(1.5, 0, 0);
    rArrowMesh.rotation.z = -Math.PI / 2;
    this.annotations.add(rArrowMesh);

    // Add coordinate labels
    this.createTextLabel('l', new THREE.Vector3(0.1, 0, 2.1));
    this.createTextLabel('r', new THREE.Vector3(1.6, 0, 0));
  }

  private createParameterLabels(params: { rho: number; a: number; M: number }) {
    // Create a parameter display panel
    const panelWidth = 1.5;
    const panelHeight = 0.8;
    
    // Background panel
    const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7
    });
    
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(3, 0, 1);
    this.annotations.add(panel);

    // Parameter text (simplified as lines for now)
    const textY = 1.3;
    this.createTextLabel(`ρ = ${params.rho.toFixed(3)}`, new THREE.Vector3(2.5, 0, textY));
    this.createTextLabel(`a = ${params.a.toFixed(3)}`, new THREE.Vector3(2.5, 0, textY - 0.2));
    this.createTextLabel(`M = ${params.M.toFixed(3)}`, new THREE.Vector3(2.5, 0, textY - 0.4));
  }

  private createTextLabel(text: string, position: THREE.Vector3) {
    // Simple text representation using small spheres/lines
    // In a full implementation, you'd use TextGeometry with a loaded font
    
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const labelGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    
    // For now, just place a small indicator sphere
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.copy(position);
    this.annotations.add(label);
    
    // You could replace this with proper TextGeometry when you have fonts loaded
  }

  private clearAnnotations() {
    // Remove all existing annotations
    while (this.annotations.children.length > 0) {
      this.annotations.remove(this.annotations.children[0]);
    }
  }

  public updateAnnotations(params: { rho: number; a: number; M: number }) {
    this.createAnnotations(params);
  }

  public setVisible(visible: boolean) {
    this.annotations.visible = visible;
  }

  public getChildrenCount(): number {
    return this.annotations.children.length;
  }

  public dispose() {
    this.scene.remove(this.annotations);
  }
}