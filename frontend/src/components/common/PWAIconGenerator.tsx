import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Palette, Smartphone } from 'lucide-react';
import { generateAllPWAIcons, downloadPWAIcons } from '../../utils/pwaUtils';

const PWAIconGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIcons, setGeneratedIcons] = useState<{ [key: string]: string }>({});

  const handleGenerateIcons = async () => {
    setIsGenerating(true);
    try {
      const icons = generateAllPWAIcons();
      setGeneratedIcons(icons);
      
      // Auto-download all icons
      downloadPWAIcons();
      
      console.log('Generated PWA icons:', Object.keys(icons));
    } catch (error) {
      console.error('Failed to generate icons:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const iconSizes = [
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PWA Icon Generator
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          Generate all required PWA icons for your gamified productivity app
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Icon Generation
            </h2>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateIcons}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate & Download Icons</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {iconSizes.map(({ size, name }) => (
            <div
              key={size}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                {generatedIcons[name] ? (
                  <img
                    src={generatedIcons[name]}
                    alt={`Icon ${size}x${size}`}
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <span className="text-white text-2xl">🎮</span>
                )}
              </div>
              
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {size}×{size}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📋 Instructions
        </h3>
        
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>1. Click "Generate & Download Icons" to create all PWA icons</p>
          <p>2. Extract the downloaded icons to <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">/public/icons/</code> folder</p>
          <p>3. The icons will be automatically used by the PWA manifest</p>
          <p>4. Icons include all required sizes for iOS, Android, and desktop</p>
        </div>
      </div>
    </div>
  );
};

export default PWAIconGenerator;
