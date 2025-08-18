'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Check, ChevronDown } from 'lucide-react';

const platforms = [
    'Chrome',
    'Firefox',
    'Safari',
    'Edge',
    'Opera',
    'Brave',
  ];
const categories = ['Crash', 'Login', 'Calendar', 'Meeting', 'Other'];
const severities = ['Low', 'Medium', 'High', 'Critical'];

export default function BugReportModal({ isOpen, onClose }) {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedSeverity, setSelectedSeverity] = useState(severities[0]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>

        {/* Center Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Report a Bug
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Bug Form */}
                <form className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full border rounded-md px-3 py-2 text-sm" />
                  <input type="email" placeholder="Email" className="w-full border rounded-md px-3 py-2 text-sm" />

                  {/* Platform Dropdown */}
                  <Listbox value={selectedPlatform} onChange={setSelectedPlatform}>
                    <div className="relative">
                      <Listbox.Button className="w-full border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-white">
                        {selectedPlatform}
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white border shadow-lg z-50">
                          {platforms.map((platform, idx) => (
                            <Listbox.Option
                              key={idx}
                              value={platform}
                              className={({ active }) =>
                                `cursor-pointer select-none px-3 py-2 text-sm ${
                                  active ? 'bg-indigo-100' : 'text-gray-700'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex justify-between items-center">
                                  <span>{platform}</span>
                                  {selected && <Check className="h-4 w-4 text-indigo-600" />}
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <input type="datetime-local" className="w-full border rounded-md px-3 py-2 text-sm" />

                  {/* Bug Category Dropdown */}
                  <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                    <div className="relative">
                      <Listbox.Button className="w-full border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-white">
                        {selectedCategory}
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white border shadow-lg z-50">
                          {categories.map((cat, idx) => (
                            <Listbox.Option
                              key={idx}
                              value={cat}
                              className={({ active }) =>
                                `cursor-pointer select-none px-3 py-2 text-sm ${
                                  active ? 'bg-indigo-100' : 'text-gray-700'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex justify-between items-center">
                                  <span>{cat}</span>
                                  {selected && <Check className="h-4 w-4 text-indigo-600" />}
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <textarea placeholder="Description of the issue" rows="3" className="w-full border rounded-md px-3 py-2 text-sm"></textarea>
                  <textarea placeholder="Steps to reproduce (if possible)" rows="3" className="w-full border rounded-md px-3 py-2 text-sm"></textarea>

                  <input type="file" className="w-full border rounded-md px-3 py-2 text-sm" />

                  {/* Severity Dropdown */}
                  <Listbox value={selectedSeverity} onChange={setSelectedSeverity}>
                    <div className="relative">
                      <Listbox.Button className="w-full border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-white">
                        {selectedSeverity}
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white border shadow-lg z-50">
                          {severities.map((sev, idx) => (
                            <Listbox.Option
                              key={idx}
                              value={sev}
                              className={({ active }) =>
                                `cursor-pointer select-none px-3 py-2 text-sm ${
                                  active ? 'bg-indigo-100' : 'text-gray-700'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <div className="flex justify-between items-center">
                                  <span>{sev}</span>
                                  {selected && <Check className="h-4 w-4 text-indigo-600" />}
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700"
                    >
                      Submit Bug
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
