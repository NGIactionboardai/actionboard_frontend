'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { getAuthHeaders, makeApiCall } from '@/app/utils/api';
import { toast } from 'react-hot-toast';


export default function SendInviteModal({ isOpen, onClose, onSuccess, orgId, meeting, members = [] }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const authToken = useSelector((state) => state.auth.token);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const allIds = filteredMembers.map((m) => m.id);
    setSelected(allIds);
  };
  
  const handleDeselectAll = () => {
    setSelected([]);
  };
  


  const toggleSelect = (email) => {
    setSelected((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  useEffect(() => {
    if (isOpen) {
      setSelected([]); 
    }
  }, [isOpen]);


  const handleSend = async () => {
    if (selected.length === 0 || !meeting?.id) return;
    setLoading(true);
    try {
      const headers = getAuthHeaders(authToken);
      const res = await makeApiCall(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meetings/send-meeting-invitations/${orgId}/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            member_ids: selected,
            meeting_id: meeting.id,
          }),
        }
      );
  
      if (!res.ok) {
        throw new Error('Failed to send invites');
      }
  
      const result = await res.json();
      console.log(result.detail);
  
      toast.success(result.detail || 'Invites sent successfully!');
      onSuccess?.(); // Close modal
  
    } catch (err) {
      console.error('Failed to send invites:', err);
      toast.error('Failed to send invites. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">

      <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Share Meeting
          </Dialog.Title>

          {/* Join URL + Copy + Join Now */}
          {meeting?.join_url && (
            <div className="mb-4">
              <label className="text-sm text-gray-700 font-medium mb-1 block">Meeting Link</label>
              <div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 text-sm">
                <span
                  className="text-gray-700 truncate max-w-[65%] block"
                  title={meeting.join_url}
                >
                  {meeting.join_url}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.join_url);
                      toast.success('Copied meeting link!');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    Copy
                  </button>
                  {/* <button
                    onClick={() => window.open(meeting.join_url, '_blank', 'noopener,noreferrer')}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Join now
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {/* 🔍 Search Input */}
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* ✅ Select/Deselect All */}
          <div className="flex justify-end gap-3 mb-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-red-600 hover:underline font-medium"
            >
              Deselect All
            </button>
          </div>

          {/* 🧾 Member List */}
          <div className="space-y-3 h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredMembers.map((m) => (
              <label
                key={m.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    className="w-5 h-5 text-blue-600 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-sm text-gray-800">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.email}</p>
                  </div>
                </div>
              </label>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center text-gray-500 p-4 border rounded-lg">
                <p>No matching members found.</p>
                <a
                  href={`/member-list/${orgId}`}
                  className="inline-block mt-2 px-4 py-2 rounded-md bg-black/10 text-sm text-gray-700 hover:bg-black/20 transition"
                >
                  Add Members
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-semibold text-black hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading || selected.length === 0}
              className={`px-4 py-2 rounded-md font-semibold text-white transition 
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
                hover:from-[#080aa8] hover:to-[#6d0668]
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </Dialog.Panel>


      </div>
    </Dialog>
  );
}
