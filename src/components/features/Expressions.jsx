
// "use client";

// import { expressionColors, isExpressionColor } from "@/utils/expressionColors";
// import { expressionLabels } from "@/utils/expressionLabels";

// export default function Expressions({ values }) {
//   // If no values, don't render anything
//   if (!values || Object.keys(values).length === 0) {
//     return null;
//   }

//   // Function to format expression names (handle camelCase, snake_case, etc.)
//   const formatExpressionName = (key) => {
//     if (expressionLabels[key]) {
//       return expressionLabels[key];
//     }
    
//     // Try to format the key if no direct match
//     return key
//       // Convert camelCase to spaces
//       .replace(/([A-Z])/g, ' $1')
//       // Convert snake_case to spaces
//       .replace(/_/g, ' ')
//       // Capitalize first letter
//       .replace(/^./, str => str.toUpperCase());
//   };

//   // Get top 3 expressions by value
//   const top3 = Object.entries(values)
//     .filter(([, value]) => typeof value === 'number') // Only keep numeric values
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 3);

//   if (top3.length === 0) {
//     return null;
//   }

//   return (
//     <div className="text-xs pt-3 w-full border-t border-neutral-700 flex flex-col md:flex-row gap-3">
//       {top3.map(([key, value]) => (
//         <div key={key} className="w-full overflow-hidden">
//           <div className="flex items-center justify-between gap-1 pb-1">
//             <div className="font-medium truncate text-zinc-400">
//               {formatExpressionName(key)}
//             </div>
//             <div className="opacity-50 text-zinc-500">{value.toFixed(2)}</div>
//           </div>
//           <div 
//             className="relative h-1"
//             style={{
//               "--expression-color": isExpressionColor(key) 
//                 ? expressionColors[key] 
//                 : "#a9cce1"
//             }}
//           >
//             <div className="absolute top-0 left-0 w-full h-full rounded-full opacity-10 bg-[var(--expression-color)]" />
//             <div
//               className="absolute top-0 left-0 h-full rounded-full bg-[var(--expression-color)]"
//               style={{
//                 width: `${Math.min(value * 100, 100)}%`
//               }}
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// "use client";

// import { expressionColors, isExpressionColor } from "@/utils/expressionColors";
// import { expressionLabels } from "@/utils/expressionLabels";

// // Marquee component for long text
// const Marquee = ({ children }) => {
//   return (
//     <div className="overflow-hidden w-full">
//       <div className="animate-marquee whitespace-nowrap inline-block">
//         <span className="inline-block pr-8">{children}</span>
//         <span className="inline-block">{children}</span>
//       </div>
//     </div>
//   );
// };

// export default function Expressions({ values }) {
//   // If no values, don't render anything
//   if (!values || Object.keys(values).length === 0) {
//     return null;
//   }

//   // Function to format expression names (handle camelCase, snake_case, etc.)
//   const formatExpressionName = (key) => {
//     if (expressionLabels[key]) {
//       return expressionLabels[key];
//     }
    
//     // Try to format the key if no direct match
//     return key
//       // Convert camelCase to spaces
//       .replace(/([A-Z])/g, ' $1')
//       // Convert snake_case to spaces
//       .replace(/_/g, ' ')
//       // Capitalize first letter
//       .replace(/^./, str => str.toUpperCase());
//   };

//   // Get top 3 expressions by value
//   const top3 = Object.entries(values)
//     .filter(([, value]) => typeof value === 'number') // Only keep numeric values
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 3);

//   if (top3.length === 0) {
//     return null;
//   }

//   return (
//     <div className="text-xs pt-3 w-full border-t border-neutral-700 flex flex-col md:flex-row gap-3">
//       {top3.map(([key, value]) => {
//         const formattedName = formatExpressionName(key);
//         const isLong = formattedName.length > 12; // Adjust threshold as needed

//         return (
//           <div key={key} className="w-full overflow-hidden">
//             <div className="flex items-center justify-between gap-1 pb-1">
//               <div className="font-medium text-zinc-400 w-full">
//                 {isLong ? (
//                   <Marquee>{formattedName}</Marquee>
//                 ) : (
//                   <div className="truncate">{formattedName}</div>
//                 )}
//               </div>
//               <div className="opacity-50 text-zinc-500 ml-2">{value.toFixed(2)}</div>
//             </div>
//             <div 
//               className="relative h-1"
//               style={{
//                 "--expression-color": isExpressionColor(key) 
//                   ? expressionColors[key] 
//                   : "#a9cce1"
//               }}
//             >
//               <div className="absolute top-0 left-0 w-full h-full rounded-full opacity-10 bg-[var(--expression-color)]" />
//               <div
//                 className="absolute top-0 left-0 h-full rounded-full bg-[var(--expression-color)]"
//                 style={{
//                   width: `${Math.min(value * 100, 100)}%`
//                 }}
//               />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

"use client";

import { expressionColors, isExpressionColor } from "@/utils/expressionColors";
import { expressionLabels } from "@/utils/expressionLabels";

// Marquee component for long text
const Marquee = ({ children }) => {
  return (
    <div className="overflow-hidden w-full">
      <div className="animate-marquee whitespace-nowrap inline-block">
        <span className="inline-block pr-8">{children}</span>
        <span className="inline-block">{children}</span>
      </div>
    </div>
  );
};

export default function Expressions({ values }) {
  // If no values, don't render anything
  if (!values || Object.keys(values).length === 0) {
    return null;
  }

  // Function to format expression names (handle camelCase, snake_case, etc.)
  const formatExpressionName = (key) => {
    if (expressionLabels[key]) {
      return expressionLabels[key];
    }
    
    // Try to format the key if no direct match
    return key
      // Convert camelCase to spaces
      .replace(/([A-Z])/g, ' $1')
      // Convert snake_case to spaces
      .replace(/_/g, ' ')
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase());
  };

  // Get top 3 expressions by value
  const top3 = Object.entries(values)
    .filter(([, value]) => typeof value === 'number') // Only keep numeric values
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  return (
    <div className="text-xs pt-3 w-full border-t border-neutral-700 grid grid-cols-3 gap-3">
      {top3.map(([key, value]) => {
        const formattedName = formatExpressionName(key);
        const isLong = formattedName.length > 12; // Adjust threshold as needed

        return (
          <div key={key} className="w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="font-medium text-zinc-400 flex-grow min-w-0">
                {isLong ? (
                  <Marquee>{formattedName}</Marquee>
                ) : (
                  <div className="truncate">{formattedName}</div>
                )}
              </div>
              <div className="text-zinc-500 font-mono text-right w-12">
                {value.toFixed(2)}
              </div>
            </div>
            <div 
              className="relative h-1"
              style={{
                "--expression-color": isExpressionColor(key) 
                  ? expressionColors[key] 
                  : "#a9cce1"
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full rounded-full opacity-10 bg-[var(--expression-color)]" />
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-[var(--expression-color)]"
                style={{
                  width: `${Math.min(value * 100, 100)}%`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}