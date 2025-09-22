// import React, { useState, useEffect, useRef } from 'react';
// import { Heart } from 'lucide-react';

// const Footer = () => {
//   const [hearts, setHearts] = useState([]);
//   const [lastInteraction, setLastInteraction] = useState(Date.now());
//   const heartContainerRef = useRef(null);
//   const heartIdCounter = useRef(0);

//   // Function to create a new heart
//   const createHeart = (x, y) => {
//     const newHeart = {
//       id: heartIdCounter.current++,
//       x: x,
//       y: y,
//       size: Math.random() * 15 + 10, // Random size between 10-25px
//       opacity: 1,
//       rotation: Math.random() * 40 - 20, // Random rotation -20 to 20 degrees
//       velocity: {
//         x: Math.random() * 2 - 1, // Slower, more subtle horizontal velocity
//         y: -Math.random() * 2 - 1 // Slower upward velocity with slight randomness
//       },
//       color: '#eab308' // text-yellow-500 color
//     };
    
//     setHearts(prev => [...prev, newHeart]);
//     setLastInteraction(Date.now());
//   };

//   // Handle heart click
//   const handleHeartClick = (e) => {
//     const heartIcon = e.currentTarget;
//     const rect = heartIcon.getBoundingClientRect();
    
//     // Create multiple hearts around the clicked area
//     for (let i = 0; i < 3; i++) {
//       // Slight offset from the center of the heart icon
//       const offsetX = rect.left + rect.width / 2 + (Math.random() * 20 - 10);
//       const offsetY = rect.top + rect.height / 2 + (Math.random() * 20 - 10);
      
//       // Slight delay for staggered effect
//       setTimeout(() => {
//         createHeart(offsetX, offsetY);
//       }, i * 50);
//     }
//   };

//   // Handle hearts animation
//   useEffect(() => {
//     if (hearts.length === 0) return;

//     const animateHearts = () => {
//       setHearts(prev => 
//         prev.map(heart => ({
//           ...heart,
//           x: heart.x + heart.velocity.x,
//           y: heart.y + heart.velocity.y,
//           velocity: {
//             x: heart.velocity.x,
//             y: heart.velocity.y + 0.03 // Apply lighter gravity for slower movement
//           },
//           opacity: heart.opacity - 0.005, // Slower fade out
//           size: heart.size * 0.995 // Slightly shrink
//         }))
//         .filter(heart => heart.opacity > 0) // Remove fully transparent hearts
//       );
//     };

//     const animationFrame = requestAnimationFrame(animateHearts);
//     return () => cancelAnimationFrame(animationFrame);
//   }, [hearts]);

//   // Create automatic hearts when user hasn't interacted for a while
//   useEffect(() => {
//     const autoHeartInterval = setInterval(() => {
//       const timeSinceLastInteraction = Date.now() - lastInteraction;
      
//       // If no interaction for 3 seconds, create an automatic heart from the heart icon
//       if (timeSinceLastInteraction > 3000 && heartContainerRef.current) {
//         // Find the heart icon
//         const heartIcon = heartContainerRef.current.querySelector('.heart-icon');
//         if (heartIcon) {
//           const rect = heartIcon.getBoundingClientRect();
//           const x = rect.left + rect.width / 2;
//           const y = rect.top + rect.height / 2;
          
//           createHeart(x, y);
//         }
//       }
//     }, 4000); // Check every 4 seconds

//     return () => clearInterval(autoHeartInterval);
//   }, [lastInteraction]);

//   return (
//     <div className="playground" ref={heartContainerRef}>
//       {/* Render animated hearts */}
//       {hearts.map(heart => (
//         <div
//           key={heart.id}
//           className="absolute pointer-events-none"
//           style={{
//             left: heart.x,
//             top: heart.y,
//             opacity: heart.opacity,
//             transform: `rotate(${heart.rotation}deg)`,
//             transition: 'opacity 0.05s ease-out'
//           }}
//         >
//           <Heart 
//             className="fill" 
//             size={heart.size} 
//             color={heart.color}
//           />
//         </div>
//       ))}
      
//       <div className="bottomPosition">
//         <br />
//         <span className="special">Relax and Keep Touching/Clicking🧑🏻‍🚀</span>

//         <h1 className="special">
//           Made with{" "} 
//           <Heart 
//             className="inline h-6 w-6 text-yellow-500 fill-current cursor-pointer heart-icon" 
//             onClick={handleHeartClick}
//           />{" "}
//           by{" "}
//           <a 
//             className="linktree text-yellow-500" 
//             href="https://linktr.ee/egrettas" 
//             target="_blank" 
//             rel="noopener noreferrer"
//           >
//             Egret.
//           </a>
//         </h1>
//         <h3 className="version opacity-80">Build Version 2.0</h3>
//       </div>
//     </div>
//   );
// };

// export default Footer;


import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const [hearts, setHearts] = useState([]);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const heartContainerRef = useRef(null);
  const heartIdCounter = useRef(0);

  // Check if it's a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Typical mobile breakpoint
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Rest of the existing component logic remains the same...
  // Function to create a new heart
  const createHeart = (x, y) => {
    const newHeart = {
      id: heartIdCounter.current++,
      x: x,
      y: y,
      size: Math.random() * 15 + 10, // Random size between 10-25px
      opacity: 1,
      rotation: Math.random() * 40 - 20, // Random rotation -20 to 20 degrees
      velocity: {
        x: Math.random() * 2 - 1, // Slower, more subtle horizontal velocity
        y: -Math.random() * 2 - 1 // Slower upward velocity with slight randomness
      },
      color: '#eab308' // text-yellow-500 color
    };
    
    setHearts(prev => [...prev, newHeart]);
    setLastInteraction(Date.now());
  };

  // Handle heart click
  const handleHeartClick = (e) => {
    const heartIcon = e.currentTarget;
    const rect = heartIcon.getBoundingClientRect();
    
    // Create multiple hearts around the clicked area
    for (let i = 0; i < 3; i++) {
      // Slight offset from the center of the heart icon
      const offsetX = rect.left + rect.width / 2 + (Math.random() * 20 - 10);
      const offsetY = rect.top + rect.height / 2 + (Math.random() * 20 - 10);
      
      // Slight delay for staggered effect
      setTimeout(() => {
        createHeart(offsetX, offsetY);
      }, i * 50);
    }
  };

  // Handle hearts animation
  useEffect(() => {
    if (hearts.length === 0) return;

    const animateHearts = () => {
      setHearts(prev => 
        prev.map(heart => ({
          ...heart,
          x: heart.x + heart.velocity.x,
          y: heart.y + heart.velocity.y,
          velocity: {
            x: heart.velocity.x,
            y: heart.velocity.y + 0.03 // Apply lighter gravity for slower movement
          },
          opacity: heart.opacity - 0.005, // Slower fade out
          size: heart.size * 0.995 // Slightly shrink
        }))
        .filter(heart => heart.opacity > 0) // Remove fully transparent hearts
      );
    };

    const animationFrame = requestAnimationFrame(animateHearts);
    return () => cancelAnimationFrame(animationFrame);
  }, [hearts]);

  // Create automatic hearts when user hasn't interacted for a while
  useEffect(() => {
    const autoHeartInterval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      
      // If no interaction for 3 seconds, create an automatic heart from the heart icon
      if (timeSinceLastInteraction > 3000 && heartContainerRef.current) {
        // Find the heart icon
        const heartIcon = heartContainerRef.current.querySelector('.heart-icon');
        if (heartIcon) {
          const rect = heartIcon.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          createHeart(x, y);
        }
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(autoHeartInterval);
  }, [lastInteraction]);

  // Render different content for mobile
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]" ref={heartContainerRef}>
 <div className="text-right  rounded-lg p-2">
   <br />
   <span className="text-zinc-300 text-lg block">&quot;Relax and Keep Touching🧑🏻‍🚀&quot;</span>
  
   <h3 className="text-zinc-300 text-lg">Open on desktop for full experience.</h3>
   <h1 className="text-lg">
     Made with{" "}
     <Heart 
       className="inline h-4 w-4 text-yellow-500 fill-current cursor-pointer" 
       onClick={handleHeartClick}
     />{" "}
     by{" "}
     <a 
       className="text-yellow-500" 
       href="https://linktr.ee/egrettas" 
       target="_blank" 
       rel="noopener noreferrer"
     >
       Egret.
     </a>
   </h1>
 </div>
</div>
    );
  }

  // Original full desktop version
  return (
    <div className="playground" ref={heartContainerRef}>
      {/* Render animated hearts */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute pointer-events-none"
          style={{
            left: heart.x,
            top: heart.y,
            opacity: heart.opacity,
            transform: `rotate(${heart.rotation}deg)`,
            transition: 'opacity 0.05s ease-out'
          }}
        >
          <Heart 
            className="fill" 
            size={heart.size} 
            color={heart.color}
          />
        </div>
      ))}
      
      <div className="bottomPosition">
        <br />
        <span className="special">Relax and Keep Touching/Clicking🧑🏻‍🚀</span>

        <h1 className="special">
          Made with{" "} 
          <Heart 
            className="inline h-6 w-6 text-yellow-500 fill-current cursor-pointer heart-icon" 
            onClick={handleHeartClick}
          />{" "}
          by{" "}
          <a 
            className="linktree text-yellow-500" 
            href="https://linktr.ee/egrettas" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Egret.
          </a>
        </h1>
        <h3 className="version opacity-80">Build Version 2.0</h3>
      </div>
    </div>
  );
};

export default Footer;