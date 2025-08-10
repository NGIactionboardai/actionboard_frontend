import { useState } from 'react'
import axios from 'axios'
import { getAuthHeaders, makeApiCall } from '@/app/utils/api'

export default function MemberFormModal({ orgId, existing, onClose, onSuccess, authToken }) {
  const [name, setName] = useState(existing?.name || '')
  const [email, setEmail] = useState(existing?.email || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { name, email };
  
      const url = existing
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/members/${existing.id}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/members/`;
  
      if (existing) {
        await axios.patch(url, payload);
      } else {
        await axios.post(url, payload);
      }
  
      onSuccess();
      onClose();
    } catch (err) {
      console.error(
        `Failed to ${existing ? 'update' : 'create'} member`,
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {existing ? 'Edit Member' : 'Add Member'}
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="text-gray-600" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white px-4 py-2 rounded-lg  cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : existing ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
