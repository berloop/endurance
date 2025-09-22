"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Share2,
  Palette,
  PencilLineIcon,
  Waves,
  Award,
  // Music4Icon,
  FileCode2,
  Volume2Icon,
  // Droplets,
  StarsIcon,
  OrbitIcon,
  Maximize2,
  BrainCircuitIcon,
  InfoIcon,
} from "lucide-react";

import TextEditor from "@/components/features/TextEditor";
import ColorPalette from "@/components/features/ColorPalette";
import PhysicsControls from "@/components/features/PhysicsControls";
import TransitionEffects from "@/components/features/TransitionEffects";
import ShareModal from "@/components/features/ShareModal";
import ProductHuntModal from "@/components/features/ProductHuntModal";
import AudioReactiveModal from "@/components/features/AudioReactiveModal";
// import PlaybackControlBar from '@/components/features/PlaybackControlBar';
import ShootingStarsControls from "@/components/features/ShootingStars";
import ImmersiveMode from '@/components/features/ImmersiveMode';

import YuriModal from "@/components/features/YuriModal";
import AboutModal from '@/components/features/AboutModal';
import SourceCodeModal from "@/components/features/SourceCodeModal";


const Sidebar = () => {
  const [isOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Add new states
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [physicsControlsOpen, setPhysicsControlsOpen] = useState(false);
  const [transitionEffectsOpen, setTransitionEffectsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // Add a new state for the ProductHunt modal
  const [productHuntModalOpen, setProductHuntModalOpen] = useState(false);
  const [audioReactiveOpen, setAudioReactiveOpen] = useState(false);
  // const [textRainOpen, setTextRainOpen] = useState(false);
  const [shootingStarsOpen, setShootingStarsOpen] = useState(false);
  const [immersiveModeOpen, setImmersiveModeOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  

    // Add state for Yuri modal
    const [yuriModalOpen, setYuriModalOpen] = useState(false);

    const [sourceCodeOpen, setSourceCodeOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check initial screen size
    checkMobile();

    // Add event listener to check screen size on resize
    window.addEventListener("resize", checkMobile);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render on mobile
  if (isMobile) return null;

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      route: "/",
    },
    {
      icon: OrbitIcon,
      label: "Particles",
      action: () => setPhysicsControlsOpen(true),
    },
    {
      icon: PencilLineIcon,
      label: "Custom Text",
      action: () => setTextEditorOpen(true),
    },

    {
      icon: Palette,
      label: "Color Palette",
      action: () => setColorPaletteOpen(true),
    },
    {
      icon: Waves,
      label: "Transitions",
      action: () => setTransitionEffectsOpen(true),
    },
    // {
    //   icon: Droplets,
    //   label: 'Text Rain',
    //   action: () => setTextRainOpen(true)
    // },
    // Replace the existing Text Rain item with this:
    {
      icon: StarsIcon,
      label: "Shooting Stars",
      action: () => setShootingStarsOpen(true),
    },

    {
      icon: Volume2Icon,
      label: "Audio",
      action: () => setAudioReactiveOpen(true),
    },
    {
      icon: BrainCircuitIcon,
      label: "Yuri (Beta)",
      action: () => setYuriModalOpen(true),
    },
    { 
      icon: Maximize2, 
      label: 'Immersive', 
      action: () => setImmersiveModeOpen(true)
    },
    {
      icon: Share2,
      label: "Share",
      action: () => setShareModalOpen(true),
    },
    {
      icon: Award,
      label: "Product Hunt",
      action: () => setProductHuntModalOpen(true),
    },
    {
      icon: FileCode2,
      label: "Source Code",
      action: () => setSourceCodeOpen(true),
    },
    { 
      icon: InfoIcon, 
      label: 'About', 
      action: () => setAboutModalOpen(true)
    },
  ];

  return (
    <div
      className={` 
        fixed top-1/2 left-6 transform -translate-y-1/2 z-50 
        transition-all duration-300 group
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div
        className="
        bg-neutral-900 text-neutral-400
        rounded-3xl 
        w-24 hover:w-80 
        transition-all duration-300 
        overflow-hidden
      "
      >
        <div className="p-4">
          <nav>
            <ul>
              {menuItems.map((item, index) => {
                const isActive = pathname === item.route;

                // If the item has an action, use a button
                if (item.action) {
                  return (
                    <li
                      key={index}
                      className="
                        flex items-center 
                        py-4 px-3 
                        rounded-2xl 
                        cursor-pointer 
                        transition-colors 
                        group/item
                        relative
                        hover:bg-neutral-800
                      "
                      onClick={item.action}
                    >
                      <item.icon
                        className={`
                          w-8 h-8
                          flex-shrink-0 
                          transition-colors 
                          duration-300
                          ${
                            isActive
                              ? "text-yellow-500"
                              : "group-hover/item:text-yellow-500"
                          }
                        `}
                        strokeWidth={1.5}
                      />
                      <span
                        className={`
                          absolute left-24
                          opacity-100
                          transition-all 
                          duration-300 
                          whitespace-nowrap
                          text-lg
                          ${
                            isActive
                              ? "text-yellow-500"
                              : "text-neutral-300 group-hover/item:text-yellow-500"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    </li>
                  );
                }

                // For route-based items, use Link
                return (
                  <Link key={index} href={item.route} className="block">
                    <li
                      className="
                        flex items-center 
                        py-4 px-3 
                        rounded-2xl 
                        cursor-pointer 
                        transition-colors 
                        group/item
                        relative
                        hover:bg-neutral-800
                      "
                    >
                      <item.icon
                        className={`
                          w-8 h-8
                          flex-shrink-0 
                          transition-colors 
                          duration-300
                          ${
                            isActive
                              ? "text-yellow-500"
                              : "group-hover/item:text-yellow-500"
                          }
                        `}
                        strokeWidth={1.5}
                      />
                      <span
                        className={`
                          absolute left-24
                          opacity-100
                          transition-all 
                          duration-300 
                          whitespace-nowrap
                          text-lg
                          ${
                            isActive
                              ? "text-yellow-500"
                              : "text-neutral-300 group-hover/item:text-yellow-500"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      {/* Add the TextEditor */}
      <TextEditor
        isOpen={textEditorOpen}
        onClose={() => setTextEditorOpen(false)}
      />
      {/* Add the ColorPalette */}
      <ColorPalette
        isOpen={colorPaletteOpen}
        onClose={() => setColorPaletteOpen(false)}
      />

      <PhysicsControls
        isOpen={physicsControlsOpen}
        onClose={() => setPhysicsControlsOpen(false)}
      />
      <TransitionEffects
        isOpen={transitionEffectsOpen}
        onClose={() => setTransitionEffectsOpen(false)}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
      <ProductHuntModal
        isOpen={productHuntModalOpen}
        onClose={() => setProductHuntModalOpen(false)}
      />
      <AudioReactiveModal
        isOpen={audioReactiveOpen}
        onClose={() => setAudioReactiveOpen(false)}
      />
      {/* <TextRainControls 
        isOpen={textRainOpen} 
        onClose={() => setTextRainOpen(false)}
      /> */}
      <ShootingStarsControls
        isOpen={shootingStarsOpen}
        onClose={() => setShootingStarsOpen(false)}
      />
      {/* <PlaybackControlBar /> */}
      <ImmersiveMode 
        isOpen={immersiveModeOpen} 
        onClose={() => setImmersiveModeOpen(false)}
      />

<YuriModal
        isOpen={yuriModalOpen}
        onClose={() => setYuriModalOpen(false)}
      />

<AboutModal 
        isOpen={aboutModalOpen} 
        onClose={() => setAboutModalOpen(false)}
      />
      <SourceCodeModal
  isOpen={sourceCodeOpen}
  onClose={() => setSourceCodeOpen(false)}
/>
    </div>
  );
};

export default Sidebar;
