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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${org_id}/members/`);
  
      setMembers(res.data.members);
      setOrgName(res.data.organisation_name);
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
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/meetings/${org_id}`)}
          className="mb-4 sm:mb-6 text-blue-600 hover:underline text-xs sm:text-sm"
        >
          ← Back to Org Home
        </button>
  
        {orgName && (
          <h1 className="text-lg sm:text-2xl mb-3 sm:mb-4 font-semibold text-gray-800 break-words">
            Org: {orgName}
          </h1>
        )}
  
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">Member List</h2>
          <button
            onClick={() => {
              setSelectedMember(null);
              setShowFormModal(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white px-4 py-2 rounded-lg cursor-pointer text-sm sm:text-base"
          >
            + Add Member
          </button>
        </div>
  
        {/* List */}
        {loading ? (
          <p className="text-center text-gray-600 text-sm sm:text-base">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-500 mt-4 text-sm sm:text-base">
            No members found in the list.
          </p>
        ) : (
          <ul className="divide-y">
            {members.map((member) => (
              <li
                key={member.id}
                className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{member.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{member.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    className="flex-1 sm:flex-none bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white px-3 sm:px-4 py-2 rounded-lg cursor-pointer text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowFormModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 sm:flex-none bg-red-600 text-white hover:bg-red-500 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg cursor-pointer"
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
