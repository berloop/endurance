"use client";

const Shaders = () => {
  return (
    <>
      <script 
        type="x-shader/x-vertex" 
        id="vertexshader"
        dangerouslySetInnerHTML={{
          __html: `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;
            
            void main() {
              vColor = customColor;
              vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
              gl_PointSize = size * ( 300.0 / -mvPosition.z );
              gl_Position = projectionMatrix * mvPosition;
            }
          `
        }}
      />
      
      <script 
        type="x-shader/x-fragment" 
        id="fragmentshader"
        dangerouslySetInnerHTML={{
          __html: `
            uniform vec3 color;
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            
            void main() {
              gl_FragColor = vec4( color * vColor, 1.0 );
              gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }
          `
        }}
      />
    </>
  );
};

export default Shaders;