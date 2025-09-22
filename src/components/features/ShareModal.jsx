"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Share2, 
  XCircleIcon, 
  CheckCheckIcon, 
  CopyIcon, 
  ImageUpIcon,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

const ShareModal = ({ isOpen, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const generateShareableLink = async () => {
    if (!window.createParticlesInstance) {
      toast.error('Cannot access particle instance');
      return;
    }
    
    // Set loading state to true
    setIsGenerating(true);
    
    // Collect current configuration from the instance
    const currentConfig = {
      text: window.createParticlesInstance.currentText || 'Break Me',
      colorMode: window.createParticlesInstance.data?.colorMode || 'static',
      color: window.createParticlesInstance.data?.particleColor?.primary?.hex || '#FFFFFF',
      particleSize: window.createParticlesInstance.data?.particleSize || 1,
      transitionType: window.createParticlesInstance.transitionType || 'direct',
      spaceArea: window.createParticlesInstance.data?.area || 400,
      returnSpeed: window.createParticlesInstance.data?.ease || 0.09
    };
  
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 10);
  
    try {
      // Generate preview image
      const renderer = window.createParticlesInstance.renderer;
      const scene = window.createParticlesInstance.scene;
      const camera = window.createParticlesInstance.camera;
      
      // Do a final render to ensure the current state is captured
      renderer.render(scene, camera);
      
      // Get the image data for preview
      const previewDataURL = renderer.domElement.toDataURL('image/png');
      setPreviewImage(previewDataURL);
      
      // Save configuration to database
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          config: currentConfig, 
          shareId 
        })
      });

      const result = await response.json();

      if (result.success) {
        // Generate shareable URL
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        setShareUrl(shareUrl);

        // Success toast
        toast.success('Link generated successfully!', {
          duration: 1000,
          position: 'top-center',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      
      // Error toast
      toast.error('Failed to generate share link. Please try again.', {
        duration: 1000,
        position: 'top-center',
      });
    } finally {
      // Set loading state back to false regardless of success/failure
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Link copied to clipboard!', {
          duration: 1000,
          position: 'top-center',
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const exportImage = async () => {
    if (!window.createParticlesInstance) {
      toast.error('Cannot access particle instance for export', {
        duration: 1000,
        position: 'top-center',
      });
      return;
    }
    
    // Set exporting state to true
    setIsExporting(true);
    
    try {
      // Get the current renderer
      const renderer = window.createParticlesInstance.renderer;
      const scene = window.createParticlesInstance.scene;
      const camera = window.createParticlesInstance.camera;
      
      // Do a final render to ensure the current state is captured
      renderer.render(scene, camera);
      
      // Get the image data directly from the renderer's canvas
      const imageDataURL = renderer.domElement.toDataURL('image/png');
      
      // Add a small delay to make the loading state more noticeable (optional)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a download link
      const link = document.createElement('a');
      link.href = imageDataURL;
      link.download = `break-me-${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image exported successfully!', {
        duration: 1000,
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Could not export image. Please try again.', {
        duration: 1000,
        position: 'top-center',
      });
    } finally {
      // Set exporting state back to false regardless of success/failure
      setIsExporting(false);
    }
  };

  // Handle escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="
        fixed 
        top-1/2 
        left-32 
        transform 
        -translate-y-1/2 
        z-50 
        transition-all 
        duration-300
      "
    >
      <div 
        className="
          bg-neutral-900 
          text-neutral-400 
          rounded-3xl 
          w-80 
          shadow-2xl 
          border 
          border-neutral-800
        "
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 
              className="
                text-zinc-300
                text-xl 
                font-medium
                flex 
                items-center 
                gap-2
              "
            >
              <Share2 size={18} strokeWidth={1.5} />
              Share & Export
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  text-neutral-400 
                  hover:text-white 
                  transition-colors
                "
              >
                <XCircleIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Preview Image */}
            {previewImage && (
              <div className="mb-4 relative w-full h-40 rounded-xl border border-neutral-700 overflow-hidden">
                <Image
                  src={previewImage} 
                  alt="Preview" 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              </div>
            )}
           
            <div>
              {/* Share Link Generation with Loading State */}
              <button
                onClick={generateShareableLink}
                disabled={isGenerating}
                className={`
                  w-full 
                  ${isGenerating ? 'bg-neutral-600' : 'bg-neutral-700 hover:bg-yellow-500 hover:text-black'} 
                  text-white 
                  rounded-xl 
                  px-4 
                  py-2 
                  flex 
                  items-center 
                  justify-center
                  gap-2 
                  transition-colors
                  ${isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 size={12} strokeWidth={1.5} />
                    Generate Shareable Link
                  </>
                )}
              </button>
              <span className='text-xs text-center p-2 block'>
                A cosmic message to share with loved ones.
              </span>
            </div>

            {/* Shared Link Display */}
            {shareUrl && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="
                    w-full 
                    p-2 
                    bg-neutral-800 
                    text-white 
                    rounded-xl 
                    border 
                    border-neutral-700
                    truncate
                  "
                />
                <button
                  onClick={copyToClipboard}
                  className="
                    bg-neutral-700 
                    hover:bg-yellow-500 
                    text-white 
                    rounded-xl 
                    p-2 
                    transition-colors 
                    hover:text-black
                  "
                >
                  {isCopied ? (
                    <CheckCheckIcon size={12} strokeWidth={1.5} />
                  ) : (
                    <CopyIcon size={12} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            )}

            {/* Image Export with Loading State */}
            <div>
              <button
                onClick={exportImage}
                disabled={isExporting}
                className={`
                  w-full 
                  ${isExporting ? 'bg-neutral-600' : 'bg-neutral-700 hover:bg-yellow-500 hover:text-black'} 
                  text-white 
                  rounded-xl 
                  px-4 
                  py-2 
                  flex 
                  items-center 
                  justify-center
                  gap-2 
                  transition-colors
                  ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ImageUpIcon size={16} strokeWidth={1.5} />
                    Export Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;