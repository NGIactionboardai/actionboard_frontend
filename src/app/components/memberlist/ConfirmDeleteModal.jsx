import { getAuthHeaders, makeApiCall } from '@/app/utils/api'
import axios from 'axios'

export default function ConfirmDeleteModal({ member, orgId, onClose, onSuccess, authToken }) {
    const handleDelete = async () => {
        try {
          const headers = getAuthHeaders(authToken);
      
          const res = await makeApiCall(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/members/${member.id}/`,
            {
              method: 'DELETE',
              headers,
            }
          );
      
          if (!res.ok) {
            throw new Error(`Failed to delete member: ${res.status} ${res.statusText}`);
          }
      
          onSuccess();
          onClose();
        } catch (err) {
          console.error('Failed to delete member', err);
        }
    };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete <strong>{member.name}</strong>?</p>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
