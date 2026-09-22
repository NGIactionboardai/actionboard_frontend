'use client';

import { useState, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';
import getCroppedImg from './getCroppedImg';

/**
 * Fixed circular mask, draggable/zoomable image underneath — same interaction
 * as Google's avatar cropper. The extracted region is always a square (the
 * circle is just the display mask); callers render it as a circle via CSS.
 */
export default function CropLogoModal({ isOpen, imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setProcessing(false);
  };

  const handleClose = () => {
    resetState();
    onCancel();
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      resetState();
      onConfirm(blob);
    } catch (err) {
      console.error('Crop failed:', err);
      setProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Position your logo
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative w-full h-72 bg-gray-900 rounded-lg overflow-hidden">
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="logoZoom" className="block text-xs font-medium text-gray-500 mb-1">
                    Zoom
                  </label>
                  <input
                    id="logoZoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">Drag to reposition, use the slider to zoom.</p>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={processing || !croppedAreaPixels}
                    className={`px-4 py-2 text-sm text-white rounded-md ${
                      processing || !croppedAreaPixels
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {processing ? 'Processing...' : 'Save'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
