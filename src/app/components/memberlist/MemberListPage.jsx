'use client'
import { useEffect, useState } from 'react'
import MemberFormModal from './MemberFormModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import axios from 'axios'
import { useOrgRole } from '@/app/hooks/useOrgRole'
import { Mail, Clock, X } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

const ROLE_LABELS = {
  owner:  { label: 'Owner',  classes: 'bg-purple-100 text-purple-800' },
  admin:  { label: 'Admin',  classes: 'bg-blue-100 text-blue-800' },
  member: { label: 'Member', classes: 'bg-green-100 text-green-800' },
  viewer: { label: 'Viewer', classes: 'bg-gray-100 text-gray-600' },
}

export default function MemberListPage({ orgId }) {
  const [members, setMembers] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [cancellingToken, setCancellingToken] = useState(null)

  const { canManageMembers } = useOrgRole()

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const [membersRes, invitesRes] = await Promise.all([
        axios.get(`${API_BASE}/organisations/${orgId}/members/`),
        canManageMembers
          ? axios.get(`${API_BASE}/organisations/${orgId}/memberships/invite/`)
          : Promise.resolve({ data: { pending_invitations: [] } }),
      ])
      setMembers(membersRes.data.results || membersRes.data.members || [])
      setPendingInvites(invitesRes.data.pending_invitations || [])
    } catch (err) {
      console.error('Failed to fetch members', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [orgId, canManageMembers])

  const handleEdit = (member) => {
    setSelectedMember(member)
    setShowForm(true)
  }

  const handleDelete = (member) => {
    setSelectedMember(member)
    setShowDelete(true)
  }

  const handleCancelInvite = async (token) => {
    setCancellingToken(token)
    try {
      await axios.post(`${API_BASE}/organisations/invitations/${token}/decline/`)
      setPendingInvites((prev) => prev.filter((inv) => inv.token !== token))
    } catch (err) {
      console.error('Failed to cancel invite', err.response?.data || err.message)
    } finally {
      setCancellingToken(null)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Organization Members</h2>
        {canManageMembers && (
          <button
            className="bg-linear-to-r from-[#0A0DC4] to-[#8B0782] text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
            onClick={() => {
              setSelectedMember(null)
              setShowForm(true)
            }}
          >
            + Invite Member
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <>
          {/* Active members */}
          <ul className="divide-y">
            {members.map((member) => {
              const roleMeta = ROLE_LABELS[member.role] ?? { label: member.role, classes: 'bg-gray-100 text-gray-600' }
              const isOwnerRow = member.role === 'owner'

              return (
                <li key={member.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleMeta.classes}`}>
                      {roleMeta.label}
                    </span>
                    {canManageMembers && !isOwnerRow && (
                      <>
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit role
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Pending invitations */}
          {canManageMembers && pendingInvites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Pending Invitations ({pendingInvites.length})
              </h3>
              <ul className="divide-y border rounded-lg overflow-hidden">
                {pendingInvites.map((inv) => (
                  <li key={inv.token} className="py-3 px-4 flex justify-between items-center bg-amber-50">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{inv.email}</p>
                        <p className="text-xs text-gray-500">
                          Invited as{' '}
                          <span className="capitalize font-medium">{inv.role}</span>
                          {' · '}expires{' '}
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                        Invited
                      </span>
                      <button
                        onClick={() => handleCancelInvite(inv.token)}
                        disabled={cancellingToken === inv.token}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Cancel invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {showForm && (
        <MemberFormModal
          orgId={orgId}
          existing={selectedMember}
          onClose={() => setShowForm(false)}
          onSuccess={fetchMembers}
        />
      )}

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
