'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  useGetUserOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useUploadOrganizationLogoMutation,
  useDeleteOrganizationLogoMutation,
  useGetDashboardSummaryQuery,
} from '../../../redux/api/organizationApi';
import { setCurrentOrganizationId } from '../../../redux/auth/orgSelectionSlice';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import withProfileCompletionGuard from '../withProfileCompletionGuard';
import toast from 'react-hot-toast';
import { ORG_COLORS } from '@/app/constants/orgColors';
import OrgLogo, { FALLBACK_COLOR } from './OrgLogo';
import { prepareLogoFile } from './logoValidation';
import CropLogoModal from './CropLogoModal';
import KpiCards from './dashboard/KpiCards';
import { OrgCard, OrgCardSkeleton, OrgListRow } from './dashboard/OrgCards';
import { getFirstName, getGreeting } from './dashboard/format';

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
  description = "Create, edit, and manage your organizations",
  createButtonText = "Add Organization",
  onOrganizationSelect,
  onOrganizationCreate,
  onOrganizationUpdate,
  onOrganizationDelete,
  showSearch = true,
  showActions = true,
  viewMeetingsPath = "/meetings"
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state
  const { data: userOrganizations = [], isLoading: orgsLoading } = useGetUserOrganizationsQuery();
  // Polled so "Upcoming today" and the card stats stay current while the page is open.
  const { data: dashboardSummary, isLoading: summaryLoading } = useGetDashboardSummaryQuery(undefined, {
    pollingInterval: 60000,
  });
  const [createOrganization, { isLoading: creating }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: updating }] = useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: deleting }] = useDeleteOrganizationMutation();
  const [uploadOrganizationLogo] = useUploadOrganizationLogoMutation();
  const [deleteOrganizationLogo] = useDeleteOrganizationLogoMutation();

  const currentUser = useSelector((state) => state.auth?.user);

  // View mode — persisted in localStorage
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nous_org_view_mode') || 'grid';
    }
    return 'grid';
  });

  const setView = (mode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') localStorage.setItem('nous_org_view_mode', mode);
  };

  // Local state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Logo staged for a brand-new org — can't upload until the org exists,
  // so we hold the prepared file + a local preview until create succeeds.
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newLogoPreview, setNewLogoPreview] = useState('');
  const [newLogoError, setNewLogoError] = useState('');
  const [newLogoPreparing, setNewLogoPreparing] = useState(false);

  // Crop step — shared between the create and edit logo flows. `cropTarget`
  // says which flow to resume with the cropped result once the user confirms.
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState('');
  const [cropTarget, setCropTarget] = useState(null); // 'create' | 'edit'

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

    createOrganization({ name: formData.name, color: formData.color })
      .unwrap()
      .then(async (result) => {
        // Success flow
        const newOrgId = result.organization.org_id || result.organization.id;

        if (newLogoFile) {
          try {
            await uploadOrganizationLogo({ orgId: newOrgId, file: newLogoFile }).unwrap();
          } catch (logoErr) {
            toast.error(logoErr?.message || 'Organization created, but the logo failed to upload. You can add one from Edit.');
          }
        }

        resetNewLogo();
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
      const result = await updateOrganization({
        orgId: selectedOrg.org_id || selectedOrg.id,
        updateData: { name: formData.name, color:  formData.color,}
      }).unwrap();
  
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
  
  const resetNewLogo = () => {
    setNewLogoFile(null);
    setNewLogoError('');
    setNewLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  const processNewLogoFile = async (file) => {
    setNewLogoError('');
    setNewLogoPreparing(true);

    const { file: preparedFile, error } = await prepareLogoFile(file);
    setNewLogoPreparing(false);

    if (error) {
      setNewLogoError(error);
      return;
    }

    setNewLogoFile(preparedFile);
    setNewLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(preparedFile);
    });
  };

  const processLogoFile = async (file) => {
    if (!selectedOrg) return;

    setLogoError('');
    setLogoUploading(true);

    const { file: preparedFile, error } = await prepareLogoFile(file);
    if (error) {
      setLogoError(error);
      setLogoUploading(false);
      return;
    }

    try {
      await uploadOrganizationLogo({
        orgId: selectedOrg.org_id || selectedOrg.id,
        file: preparedFile
      }).unwrap();
      toast.success('Logo updated successfully!');
    } catch (error) {
      setLogoError(error?.message || 'Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const openCropModal = (file, target) => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCropTarget(target);
    setCropModalOpen(true);
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setCropTarget(null);
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  const handleCropConfirm = async (croppedBlob) => {
    const target = cropTarget;
    closeCropModal();

    const file = new File([croppedBlob], 'logo.png', { type: 'image/png' });
    if (target === 'create') {
      await processNewLogoFile(file);
    } else if (target === 'edit') {
      await processLogoFile(file);
    }
  };

  // SVGs are vector/scalable, so cropping them raster-style doesn't apply —
  // prepareLogoFile already special-cases SVG to upload as-is.
  const handleNewLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (file.type === 'image/svg+xml') {
      processNewLogoFile(file);
      return;
    }
    openCropModal(file, 'create');
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file || !selectedOrg) return;

    if (file.type === 'image/svg+xml') {
      processLogoFile(file);
      return;
    }
    openCropModal(file, 'edit');
  };

  const handleRemoveLogo = async () => {
    if (!selectedOrg) return;

    setLogoError('');
    setLogoUploading(true);
    try {
      await deleteOrganizationLogo(selectedOrg.org_id || selectedOrg.id).unwrap();
      toast.success('Logo removed.');
    } catch (error) {
      setLogoError(error?.message || 'Failed to remove logo. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;
  
    try {
      await deleteOrganization(selectedOrg.org_id || selectedOrg.id).unwrap();

      toast.success(`Organization "${selectedOrg.name}" deleted successfully!`);
  
      setIsDeleteModalOpen(false);
      setSelectedOrg(null);
  
      if (onOrganizationDelete) {
        onOrganizationDelete(selectedOrg);
      }
    } catch (error) {
      console.error('Delete organization failed:', error);
      toast.error(error?.message || 'Failed to delete organization. Please try again.');
    }
  };

  const openCreateModal = () => {
    setFormError('')
    setFormData({
      name: '',
      color: FALLBACK_COLOR,
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (org) => {
    setFormError('')
    setLogoError('');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      // Orgs saved before a color existed (or created some other way) have
      // color: null, but OrgLogo still renders them with FALLBACK_COLOR — so
      // the picker needs to show that as the current selection, otherwise
      // picking the same swatch back looks like nothing happened.
      color: org.color || FALLBACK_COLOR,
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
    setLogoError('');
    resetNewLogo();
    closeCropModal();
  };

  // The selected org enriched with live logo updates from the store, since
  // selectedOrg is a point-in-time snapshot taken when the edit modal opened.
  const selectedOrgLive = selectedOrg
    ? userOrganizations.find(org =>
        (org.org_id || org.id) === (selectedOrg.org_id || selectedOrg.id)
      ) || selectedOrg
    : null;

  const handleSetCurrentOrg = (org) => {
    dispatch(setCurrentOrganizationId(org.org_id || org.id));

    // Call custom callback if provided
    if (onOrganizationSelect) {
      onOrganizationSelect(org);
    }
  };

  const orgHref = (org) => `${viewMeetingsPath}/${org.org_id || org.id}`;
  const orgStats = (org) => dashboardSummary?.orgs?.[org.org_id || org.id];
  const orgCount = userOrganizations.length;
  const firstName = getFirstName(currentUser);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
      {/* Greeting + search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}{firstName && <>, <span className="text-indigo-600">{firstName}</span></>}
          </h1>
          <p className="mt-1 text-gray-600">
            {orgCount === 0
              ? 'Create an organization to get started'
              : `Here's what's happening across your ${orgCount} ${orgCount === 1 ? 'organization' : 'organizations'}`}
          </p>
        </div>
        {showSearch && (
          <div className="relative w-full lg:w-[480px] xl:w-[570px] shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="block w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Analytics */}
      <KpiCards kpis={dashboardSummary?.kpis} isLoading={summaryLoading} />

      {/* Organizations header */}
      <div className="mt-10 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Organizations</h2>
          <p className="mt-1 text-gray-600">Choose an organization to view its workspace, meetings and insights.</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { mode: 'grid', icon: LayoutGrid, title: 'Grid view' },
            { mode: 'list', icon: List, title: 'List view' },
          ].map(({ mode, icon: Icon, title: label }) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              title={label}
              aria-pressed={viewMode === mode}
              className={`h-11 w-11 flex items-center justify-center rounded-xl border transition ${
                viewMode === mode
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
          {showActions && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5" />
              {createButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Organizations */}
      {orgsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <OrgCardSkeleton key={i} />)}
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-14 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {orgCount === 0 ? 'Create your first organization' : 'No organizations match your search'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {orgCount === 0
              ? 'Organizations hold your meetings, members and insights.'
              : 'Try a different name.'}
          </p>
          {orgCount === 0 && showActions && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              <Plus className="h-5 w-5" />
              {createButtonText}
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrganizations.map((org) => (
            <OrgCard
              key={org.org_id || org.id}
              org={org}
              stats={orgStats(org)}
              href={orgHref(org)}
              onOpen={() => handleSetCurrentOrg(org)}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl divide-y divide-gray-100 [&>*:first-child]:rounded-t-2xl [&>*:last-child]:rounded-b-2xl">
          {filteredOrganizations.map((org) => (
            <OrgListRow
              key={org.org_id || org.id}
              org={org}
              stats={orgStats(org)}
              onOpen={() => {
                handleSetCurrentOrg(org);
                router.push(orgHref(org));
              }}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

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

                      {/* Logo upload */}
                      <div className="mt-4 flex items-center gap-4">
                        <OrgLogo
                          org={{ name: formData.name, color: formData.color, logo_url: newLogoPreview }}
                          size="lg"
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="newOrgLogoInput"
                              className={`px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer ${newLogoPreparing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {newLogoPreparing ? 'Processing...' : newLogoFile ? 'Replace logo' : 'Upload logo'}
                            </label>
                            <input
                              id="newOrgLogoInput"
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              className="hidden"
                              disabled={newLogoPreparing}
                              onChange={handleNewLogoFileChange}
                            />
                            {newLogoFile && (
                              <button
                                type="button"
                                onClick={resetNewLogo}
                                className="px-3 py-1.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">PNG, JPEG, WEBP, or SVG. Any size — we&apos;ll resize it automatically.</p>
                          {newLogoError && <p className="text-sm text-red-500">{newLogoError}</p>}
                        </div>
                      </div>

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
                    disabled={creating || newLogoPreparing || !formData.name.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create'}
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
            >
              
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditOrg}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="edit-modal-title">
                        Edit Organization
                      </h3>

                      {/* Logo upload */}
                      <div className="mt-4 flex items-center gap-4">
                        <OrgLogo org={{ ...selectedOrgLive, color: formData.color }} size="lg" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="orgLogoInput"
                              className={`px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer ${logoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {logoUploading ? 'Uploading...' : selectedOrgLive?.logo_url ? 'Replace logo' : 'Upload logo'}
                            </label>
                            <input
                              id="orgLogoInput"
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              className="hidden"
                              disabled={logoUploading}
                              onChange={handleLogoFileChange}
                            />
                            {selectedOrgLive?.logo_url && (
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                disabled={logoUploading}
                                className="px-3 py-1.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">PNG, JPEG, WEBP, or SVG. Any size — we&apos;ll resize it automatically.</p>
                          {logoError && <p className="text-sm text-red-500">{logoError}</p>}
                        </div>
                      </div>

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
                    disabled={updating || !formData.name.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update'}
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
                  <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
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
                  disabled={deleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
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

      <CropLogoModal
        isOpen={cropModalOpen}
        imageSrc={cropSrc}
        onCancel={closeCropModal}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
};

export default ManageOrganizations;



const ColorSelector = ({ mode, formData, setFormData, userOrganizations }) => {
  const usedColors = userOrganizations.map(org => org.color).filter(Boolean);
  // formData.color is already normalized to a real value at modal-open time
  // (see openCreateModal/openEditModal), so it's the single source of truth
  // for "what does this org currently show as its color."
  const currentColor = formData.color;

  const getAvailableColors = () => {
    if (mode === 'create') {
      // Only unused colors
      return ORG_COLORS.filter(color => !usedColors.includes(color));
    }

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
            color !== currentColor;

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