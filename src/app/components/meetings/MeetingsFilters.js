'use client';

const MeetingsFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  handleDateFilterChange,
  clearFilters,
  uniqueStatuses
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">

          {/* Search input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-40">
            <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              id="status"
              name="status"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="w-full md:w-44">
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={dateFilter.startDate}
              onChange={handleDateFilterChange}
            />
          </div>

          {/* To Date */}
          <div className="w-full md:w-44">
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={dateFilter.endDate}
              onChange={handleDateFilterChange}
            />
          </div>

          {/* Clear Button */}
          <div className="w-full md:w-auto">
            <button
              type="button"
              onClick={clearFilters}
              className="mt-1 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsFilters;
