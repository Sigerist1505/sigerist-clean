import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveEmbroideryPreviewProps {
  bagImageUrl: string;
  embroideredTextUrl: string;
  onPositionChange?: (position: { x: number; y: number; scale: number }) => void;
}

const InteractiveEmbroideryPreview: React.FC<InteractiveEmbroideryPreviewProps> = ({
  bagImageUrl,
  embroideredTextUrl,
  onPositionChange
}) => {
  const [position, setPosition] = useState({ x: 200, y: 300 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setPosition(newPosition);
    onPositionChange?.({ ...newPosition, scale });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (newScale: number[]) => {
    const scaleValue = newScale[0];
    setScale(scaleValue);
    onPositionChange?.({ ...position, scale: scaleValue });
  };

  const resetPosition = () => {
    const newPosition = { x: 200, y: 300 };
    const newScale = 1;
    setPosition(newPosition);
    setScale(newScale);
    onPositionChange?.({ ...newPosition, scale: newScale });
  };

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Base bag image */}
        <img
          src={bagImageUrl}
          alt="Base bag"
          className="w-full h-full object-contain"
          draggable={false}
        />
        
        {/* Draggable embroidered text */}
        <img
          src={embroideredTextUrl}
          alt="Embroidered text"
          className={`absolute cursor-move transition-transform ${isDragging ? 'scale-105' : ''}`}
          style={{
            left: position.x,
            top: position.y,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            maxWidth: '200px',
            height: 'auto',
            filter: 'contrast(1.2) saturate(1.1) drop-shadow(1px 1px 2px rgba(0,0,0,0.2))',
            mixBlendMode: 'multiply',
            backgroundColor: 'transparent'
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
        
        {/* Position indicator */}
        <div 
          className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none"
          style={{
            left: position.x - 4,
            top: position.y - 4
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <Move className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Arrastra el bordado para moverlo</span>
        </div>
        
        {/* Scale Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Tamaño:</span>
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </div>
          <Slider
            value={[scale]}
            onValueChange={handleScaleChange}
            min={0.3}
            max={2}
            step={0.1}
            className="flex-1"
          />
          <div className="text-xs text-gray-500 text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetPosition}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetear Posición
        </Button>

        {/* Position Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Posición: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</div>
          <div>Tamaño: {Math.round(scale * 100)}%</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEmbroideryPreview;