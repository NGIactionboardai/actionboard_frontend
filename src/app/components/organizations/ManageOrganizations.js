'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getUserOrganizations,
  setCurrentOrganization,
  clearMessages,
  selectUserOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
  selectOrganizationSuccessMessage,
  selectCurrentOrganization
} from '../../../redux/auth/organizationSlice'; // Adjust import path as needed
import { Popover } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import withProfileCompletionGuard from '../withProfileCompletionGuard';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ORG_COLORS } from '@/app/constants/orgColors';



/**
 * ManageOrganizations Component
 * 
 * A comprehensive organization management component that provides:
 * - List view of user's organizations
 * - Create new organizations
 * - Edit existing organizations
 * - Delete organizations
 * - Set current organization
 * - Search and filter functionality
 * 
 * @param {Object} props - Component props
 * @param {string} [props.title] - Custom title for the page
 * @param {string} [props.description] - Custom description for the page
 * @param {string} [props.createButtonText] - Custom text for create button
 * @param {Function} [props.onOrganizationSelect] - Callback when organization is selected
 * @param {Function} [props.onOrganizationCreate] - Callback when organization is created
 * @param {Function} [props.onOrganizationUpdate] - Callback when organization is updated
 * @param {Function} [props.onOrganizationDelete] - Callback when organization is deleted
 * @param {boolean} [props.showSearch] - Whether to show search functionality
 * @param {boolean} [props.showActions] - Whether to show action buttons
 * @param {string} [props.viewMeetingsPath] - Custom path for view meetings link
 */
const ManageOrganizations = ({
  title = "Please Choose Your Organization",
  description = "Create, edit, and manage your organizations",
  createButtonText = "Create Organization",
  onOrganizationSelect,
  onOrganizationCreate,
  onOrganizationUpdate,
  onOrganizationDelete,
  showSearch = true,
  showActions = true,
  viewMeetingsPath = "/meetings"
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const userOrganizations = useSelector(selectUserOrganizations);
  const loading = useSelector(selectOrganizationLoading);
  const error = useSelector(selectOrganizationError);
  const successMessage = useSelector(selectOrganizationSuccessMessage);
  const currentOrganization = useSelector(selectCurrentOrganization);

  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');

  // const ORG_COLORS = [
  //   '#4F46E5', // Indigo
  //   '#10B981', // Emerald
  //   '#F59E0B', // Amber
  //   '#EF4444', // Red
  //   '#3B82F6', // Blue
  //   '#8B5CF6', // Violet
  //   '#EC4899', // Pink
  //   '#14B8A6', // Teal
  //   '#F97316', // Orange
  //   '#84CC16', // Lime
  //   '#6366F1', // Indigo Light
  //   '#06B6D4', // Cyan
  // ];

  // const usedColors = userOrganizations.map(org => org.color);
  // const availableColors = ORG_COLORS.filter(c => !usedColors.includes(c));


  // Load organizations on component mount
  useEffect(() => {
    dispatch(getUserOrganizations());
  }, [dispatch]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  // Filter organizations based on search term
  // const filteredOrganizations = userOrganizations?.filter(org =>
  //   org?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  // ) || [];

  const filteredOrganizations =
  (userOrganizations || [])
    .filter(org =>
      org?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const term = searchTerm.toLowerCase();
      const aName = a?.name?.toLowerCase() || "";
      const bName = b?.name?.toLowerCase() || "";

      const aStarts = aName.startsWith(term);
      const bStarts = bName.startsWith(term);

      if (aStarts && !bStarts) return -1; // a first
      if (!aStarts && bStarts) return 1;  // b first
      return 0; // keep original order for same priority
    });

  const handleCreateOrg = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors
  
    if (!formData.name.trim()) return;
  
    dispatch(createOrganization({ name: formData.name, color: formData.color }))
      .unwrap()
      .then((result) => {
        // Success flow
        setIsCreateModalOpen(false);
        setFormData({ name: '' });
        toast.success(`Organization "${result.organization.name}" created successfully!`);
  
        if (onOrganizationCreate) {
          onOrganizationCreate(result.organization);
        }
      })
      .catch((error) => {
        // The error here is exactly what rejectWithValue returned from the thunk
        console.log('Create organization failed:', error);
  
        const errorMsg =
          error?.fieldErrors?.name?.[0] || 
          error?.message ||                
          error?.error ||                  
          'Failed to create organization. Please try again.';
  
        setFormError(errorMsg); // Inline error
        // toast.error(errorMsg); // Optional toast
      });
  };
  
  
  const handleEditOrg = async (e) => {
    e.preventDefault();
    setFormError('');
  
    if (!selectedOrg || !formData.name.trim()) return;
  
    try {
      const result = await dispatch(updateOrganization({
        orgId: selectedOrg.org_id || selectedOrg.id,
        updateData: { name: formData.name, color:  formData.color,}
      })).unwrap();
  
      setIsEditModalOpen(false);
      setSelectedOrg(null);
      setFormData({ name: '' });
      toast.success(`Organization "${result.organization.name}" updated successfully!`);
      if (onOrganizationUpdate) {
        onOrganizationUpdate(result.organization);
      }
    } catch (error) {
      console.log('Update organization failed:', error);
  
        const errorMsg =
          error?.fieldErrors?.name?.[0] || 
          error?.message ||                
          error?.error ||                  
          'Failed to create organization. Please try again.';
  
        setFormError(errorMsg); 
      // toast.error(errorMsg);
    }
  };
  
  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;
  
    try {
      await dispatch(deleteOrganization(selectedOrg.org_id || selectedOrg.id)).unwrap();
  
      toast.success(`Organization "${selectedOrg.name}" deleted successfully!`);
  
      setIsDeleteModalOpen(false);
      setSelectedOrg(null);
  
      if (onOrganizationDelete) {
        onOrganizationDelete(selectedOrg);
      }
    } catch (error) {
      console.error('Delete organization failed:', error);
      toast.error('Failed to delete organization. Please try again.');
    }
  };

  const openCreateModal = () => {
    setFormError('')
    setFormData({
      name: '',
      color: '#4F46E5',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (org) => {
    setFormError('')
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      color: org.color || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (org) => {
    setSelectedOrg(org);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedOrg(null);
    setFormData({ name: '' });
  };

  const handleSetCurrentOrg = (org) => {
    dispatch(setCurrentOrganization(org));
    
    // Call custom callback if provided
    if (onOrganizationSelect) {
      onOrganizationSelect(org);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
        <h2 className="pb-1 mb-3 sm:mb-5 flex items-center gap-1">
          <span className="text-4xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#0A0DC4] via-[#5A0DB4] to-[#8B0782] bg-clip-text text-transparent">
            Welcome to
          </span>
          <Image
            src="/nous-text.png"
            alt="nous meeting"
            width={100}   // default mobile width
            height={45}
            className="object-contain sm:w-[140px] sm:h-[60px] lg:w-[180px] lg:h-[75px]"
            priority
          />
        </h2>
        {/* <h2 className="text-2xl sm:text-3xl font-bold pb-1 mb-3 sm:mb-5 flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#0A0DC4] via-[#5A0DB4] to-[#8B0782] bg-clip-text text-transparent">
            Welcome to
          </span>
          <span className="bg-gradient-to-r from-[#8B0782] via-pink-600 to-purple-800 bg-clip-text text-transparent lowercase">
            nous meeting
          </span>
        </h2> */}
          
        </div>
        {/* <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {createButtonText}
          </button>
        </div> */}
      </div>

      {/* Success/Error Messages */}
      {/* {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Search */}
      {showSearch && (
        <div className="mb-6">
          <div className="max-w-md">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-6">
        <h4 className="text-lg sm:text-xl font-bold pb-1 leading-snug text-gray-900">
          <span className="bg-gradient-to-r from-[#0A0DC4] via-[#5A0DB4] to-[#8B0782] bg-clip-text text-transparent">
            {filteredOrganizations.length === 0
              ? "Create your first organization"
              : title}
          </span>
          {/* {filteredOrganizations.length === 0
            ? "Create your first organization"
            : title} */}
        </h4>
      </div>

      {/* Organizations List */}
      <div className="sm:rounded-lg">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Repeat placeholder skeletons */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 p-4 rounded-xl shadow-md border border-gray-200 bg-gray-100 animate-pulse"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {/* Add Organization Card */}
              <div
                onClick={openCreateModal}
                className="flex flex-col justify-center items-center p-6 rounded-lg border border-gray-300 shadow hover:shadow-md cursor-pointer transition bg-white"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white text-2xl font-bold">
                  +
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">Add Organization</p>
              </div>

              {/* Organization Cards */}
              {filteredOrganizations.map((org) => (
                <div key={org.org_id || org.id} className="relative group">
                  {/* Card clickable area */}
                  <Link
                    href={`${viewMeetingsPath}/${org.org_id || org.id}`}
                    className="block h-40 p-4 rounded-xl shadow-md bg-white border border-gray-200 hover:shadow-xl hover:scale-[1.015] transition-transform duration-200 ease-in-out"
                  >
                    <div className="flex items-center justify-center h-full">
                      <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]">
                        {org.name}
                      </h3>
                    </div>
                  </Link>

                  {/* Popover menu */}
                  <Popover className="absolute top-2 right-2 z-10">
                    <Popover.Button
                      className="bg-white p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
                    </Popover.Button>
                    <Popover.Panel className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1 text-sm text-gray-700">
                        {/* <button
                          onClick={() => handleSetCurrentOrg(org)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Set as Current
                        </button> */}
                        <button
                          onClick={() => openEditModal(org)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(org)}
                          className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </Popover.Panel>
                  </Popover>
                </div>
              ))}
            </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateOrg}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create New Organization
                      </h3>
                      <div className="mt-4">
                        <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          id="orgName"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter organization name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          autoFocus
                        />
                        {formError && (
                          <p className="text-sm text-red-500 mt-1">{formError}</p>
                        )}
                      </div>
                      <ColorSelector
                        mode="create"
                        formData={formData}
                        setFormData={setFormData}
                        userOrganizations={userOrganizations}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="edit-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditOrg}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="edit-modal-title">
                        Edit Organization
                      </h3>
                      <div className="mt-4">
                        <label htmlFor="editOrgName" className="block text-sm font-medium text-gray-700">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          id="editOrgName"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter organization name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          autoFocus
                        />
                        {formError && (
                          <p className="text-sm text-red-500 mt-1">{formError}</p>
                        )}
                      </div>

                      <ColorSelector
                        mode="edit"
                        formData={formData}
                        setFormData={setFormData}
                        userOrganizations={userOrganizations}
                        selectedOrg={selectedOrg}
                      />

                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" 
              aria-hidden="true"
              onClick={closeModals}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="delete-modal-title">
                      Delete Organization
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{selectedOrg.name}"? This action cannot be undone and will remove all associated data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteOrg}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrganizations;



const ColorSelector = ({ mode, formData, setFormData, userOrganizations, selectedOrg }) => {
  const usedColors = userOrganizations.map(org => org.color).filter(Boolean);

  const getAvailableColors = () => {
    if (mode === 'create') {
      // Only unused colors
      return ORG_COLORS.filter(color => !usedColors.includes(color));
    }

    // Edit mode
    const currentColor = selectedOrg?.color || formData.color;

    if (!currentColor) {
      // Org has no color — behave like create
      return ORG_COLORS.filter(color => !usedColors.includes(color));
    }

    // Show all colors, but disable ones used by others
    return ORG_COLORS;
  };

  const availableColors = getAvailableColors();

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Organization Color
      </label>
      <div className="flex flex-wrap gap-3">
        {availableColors.map((color) => {
          const isUsedByOther =
            mode === 'edit' &&
            usedColors.includes(color) &&
            color !== selectedOrg?.color;

          return (
            <button
              key={color}
              type="button"
              disabled={isUsedByOther}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                formData.color === color
                  ? 'border-gray-800 scale-110'
                  : 'border-gray-200 hover:scale-105'
              } ${isUsedByOther ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => !isUsedByOther && setFormData({ ...formData, color })}
            />
          );
        })}
      </div>
    </div>
  );
};