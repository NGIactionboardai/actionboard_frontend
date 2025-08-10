'use client'
import { useEffect, useState } from 'react'
import MemberFormModal from './MemberFormModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { getAuthHeaders } from '@/utils/auth'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default function MemberListPage({ orgId }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/organisations/${orgId}/members/`);
      setMembers(res.data.results || []);
    } catch (err) {
      console.error('Failed to fetch members', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers()
  }, [orgId])

  const handleEdit = (member) => {
    setSelectedMember(member)
    setShowForm(true)
  }

  const handleDelete = (member) => {
    setSelectedMember(member)
    setShowDelete(true)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Organization Members</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => {
            setSelectedMember(null)
            setShowForm(true)
          }}
        >
          + Add Member
        </button>
      </div>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <ul className="divide-y">
          {members.map((member) => (
            <li key={member.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <MemberFormModal
          orgId={orgId}
          existing={selectedMember}
          onClose={() => setShowForm(false)}
          onSuccess={fetchMembers}
        />
      )}

      {/* Delete Modal */}
      {showDelete && (
        <ConfirmDeleteModal
          member={selectedMember}
          orgId={orgId}
          onClose={() => setShowDelete(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  )
}
