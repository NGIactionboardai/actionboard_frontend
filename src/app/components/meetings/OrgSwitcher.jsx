'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function OrgSwitcher({
  selectedOrg,
  setSelectedOrg,
  organizations,
  organizationId,
}) {
  const options = [
    ...organizations,
    { org_id: 'all-orgs', name: 'All Organizations' }
  ];

  const handleChange = (org) => {
    setSelectedOrg(org.org_id);
    if (org.org_id === 'all-orgs') {
      window.location.href = '/organizations';
    } else if (org.org_id !== organizationId) {
      window.location.href = `/meetings/${org.org_id}`;
    }
  };

  const selected = options.find((org) => org.org_id === selectedOrg);

  if (!selected) return null;

  return (
    <div className="mb-4">
      <Listbox value={selected} onChange={handleChange}>
        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
          Organization
        </Listbox.Label>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <span className="block truncate">{selected?.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black ring-opacity-5 shadow-lg sm:text-sm">
              {options.map((org) => (
                <Listbox.Option
                  key={org.org_id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                  value={org}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {org.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
