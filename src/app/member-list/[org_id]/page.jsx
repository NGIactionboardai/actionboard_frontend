'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import MemberFormModal from '@/app/components/memberlist/MemberFormModal';
import ConfirmDeleteModal from '@/app/components/memberlist/ConfirmDeleteModal';
import { useSelector } from 'react-redux';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';

function MemberListPage() {
  const router = useRouter();
  const { org_id } = useParams();
  const [members, setMembers] = useState([]);
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const authToken = useSelector((state) => state.auth?.token);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders(authToken);
  
      const res = await makeApiCall(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${org_id}/members/`,
        {
          method: 'GET',
          headers,
        }
      );
  
      if (!res.ok) {
        throw new Error(`Failed to fetch members: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      setMembers(data.members);
      setOrgName(data.organisation_name)
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (org_id) fetchMembers();
  }, [org_id]);

  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/meetings/${org_id}`)}
          className="mb-6 text-blue-600 hover:underline text-sm"
        >
          ← Back to Org Home
        </button>

        {orgName && (
            <h1 className="text-2xl mb-4 font-semibold text-gray-800">Org: {orgName}</h1>
          )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          
          
          <h2 className="text-2xl font-semibold text-gray-800">Member List</h2>
          <button
            onClick={() => {
              setSelectedMember(null);
              setShowFormModal(true);
            }}
            className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white px-4 py-2 rounded-lg  cursor-pointer"
          >
            + Add Member
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No members found in the list.</p>
        ) : (
          <ul className="divide-y">
            {members.map((member) => (
              <li key={member.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowFormModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white hover:bg-red-400 text-sm px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <MemberFormModal
          orgId={org_id}
          authToken={authToken}
          existing={selectedMember}
          onClose={() => setShowFormModal(false)}
          onSuccess={fetchMembers}
        />
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal
          member={selectedMember}
          orgId={org_id}
          authToken={authToken}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={fetchMembers}
        />
      )}
    </main>
  );
}


export default withProfileCompletionGuard(MemberListPage)
