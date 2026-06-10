'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useOrgRole } from '@/app/hooks/useOrgRole';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';
import MemberFormModal from '@/app/components/memberlist/MemberFormModal';

// ---------- tiny inline modals for contacts ----------

function ContactFormModal({ orgId, existing, onClose, onSuccess }) {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [name, setName] = useState(existing?.name || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      if (existing) {
        await axios.patch(`${API}/organisations/${orgId}/members/${existing.id}/`, { name, email });
      } else {
        await axios.post(`${API}/organisations/${orgId}/members/`, { name, email });
      }
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{existing ? 'Edit Contact' : 'Add Contact'}</h3>
        <div className="space-y-3">
          <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full border rounded-md px-3 py-2 text-sm" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} disabled={Boolean(existing)} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] disabled:opacity-50">
            {loading ? 'Saving...' : existing ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRemoveModal({ label, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Confirm Remove</h3>
        <p className="text-sm text-gray-600">Remove <strong>{label}</strong>? This cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- role badge ----------

const ROLE_LABELS = {
  owner:  { label: 'Owner',  cls: 'bg-purple-100 text-purple-800' },
  admin:  { label: 'Admin',  cls: 'bg-blue-100 text-blue-800' },
  member: { label: 'Member', cls: 'bg-green-100 text-green-800' },
  viewer: { label: 'Viewer', cls: 'bg-gray-100 text-gray-600' },
};

// ---------- page ----------

function MemberListPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const { org_id } = useParams();
  const currentUser = useSelector((state) => state.auth?.user);
  const { canManageMembers } = useOrgRole();

  // Platform members (OrganisationMembership)
  const [platformMembers, setPlatformMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Contacts (MemberList)
  const [contacts, setContacts] = useState([]);
  const [orgName, setOrgName] = useState('');
  const [nextUrl, setNextUrl] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(false);

  // Modal state
  const [inviteModal, setInviteModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(null);   // { user_id, role, name, email }
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [contactFormTarget, setContactFormTarget] = useState(null); // null=closed, {} = new, {...} = edit
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);
  const [deletingContact, setDeletingContact] = useState(false);

  // ---- fetch platform members + pending invites ----
  const fetchPlatformMembers = async () => {
    try {
      const res = await axios.get(`${API}/organisations/${org_id}/`);
      setPlatformMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to fetch platform members', err.response?.data);
    }
  };

  const fetchPendingInvites = async () => {
    if (!canManageMembers) return;
    try {
      const res = await axios.get(`${API}/organisations/${org_id}/memberships/invite/`);
      setPendingInvites(res.data.pending_invitations || []);
    } catch (err) {
      console.error('Failed to fetch invitations', err.response?.data);
    }
  };

  // ---- fetch contacts ----
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/organisations/${org_id}/members/`);
      setContacts(res.data.members || []);
      setOrgName(res.data.organisation_name || '');
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error('Failed to fetch contacts', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreContacts = useCallback(async () => {
    if (!nextUrl || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await axios.get(nextUrl);
      setContacts((prev) => [...prev, ...(res.data.members || [])]);
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error('Failed to load more contacts', err.response?.data);
    } finally {
      setIsFetchingMore(false);
    }
  }, [nextUrl, isFetchingMore]);

  const refreshAll = () => {
    fetchPlatformMembers();
    fetchPendingInvites();
    fetchContacts();
  };

  useEffect(() => {
    if (org_id) refreshAll();
  }, [org_id, canManageMembers]);

  // Infinite scroll for contacts
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isFetchingMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMoreContacts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore, loadMoreContacts]);

  // ---- remove platform member ----
  const handleRemoveMember = async () => {
    if (!removeMemberTarget) return;
    setRemovingMember(true);
    try {
      await axios.delete(`${API}/organisations/${org_id}/memberships/${removeMemberTarget.user_id}/`);
      setRemoveMemberTarget(null);
      fetchPlatformMembers();
    } catch (err) {
      console.error('Failed to remove member', err.response?.data);
    } finally {
      setRemovingMember(false);
    }
  };

  // ---- delete contact ----
  const handleDeleteContact = async () => {
    if (!deleteContactTarget) return;
    setDeletingContact(true);
    try {
      await axios.delete(`${API}/organisations/${org_id}/members/${deleteContactTarget.id}/`);
      setDeleteContactTarget(null);
      fetchContacts();
    } catch (err) {
      console.error('Failed to delete contact', err.response?.data);
    } finally {
      setDeletingContact(false);
    }
  };

  // ---- cancel pending invite ----
  const handleCancelInvite = async (token) => {
    try {
      await axios.post(`${API}/organisations/invitations/${token}/decline/`);
      setPendingInvites((prev) => prev.filter((i) => i.token !== token));
    } catch (err) {
      console.error('Failed to cancel invite', err.response?.data);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        <button onClick={() => router.push(`/meetings/${org_id}`)} className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to Org Home
        </button>

        {orgName && (
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{orgName}</h1>
            <p className="text-base text-gray-500 mt-1">Manage members and contacts for this organisation.</p>
          </div>
        )}

        {/* ===== Platform Members ===== */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Platform Members</h2>
            </div>
            {canManageMembers && (
              <button
                onClick={() => setInviteModal(true)}
                className="px-4 py-1.5 text-sm font-medium rounded-full text-white shadow bg-linear-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668]"
              >
                + Invite Member
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl divide-y">
            {platformMembers.length === 0 && (
              <p className="py-5 px-5 text-base text-gray-500 text-center">No platform members yet.</p>
            )}
            {platformMembers.map((m) => {
              const roleMeta = ROLE_LABELS[m.role] ?? { label: m.role, cls: 'bg-gray-100 text-gray-600' };
              const isCurrentUser = m.user_id === currentUser?.id;
              const isOwner = m.role === 'owner';
              return (
                <div key={m.user_id} className="flex items-center justify-between px-5 py-5">
                  <div>
                    <p className="text-base md:text-lg font-semibold text-gray-900">
                      {m.name}
                      {isCurrentUser && <span className="ml-2 text-sm text-gray-400 font-normal">(you)</span>}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${roleMeta.cls}`}>{roleMeta.label}</span>
                    {canManageMembers && !isOwner && !isCurrentUser && (
                      <>
                        <button onClick={() => setEditMemberModal(m)} className="px-3 py-1.5 text-sm font-medium rounded-full border hover:bg-gray-100">Edit role</button>
                        <button onClick={() => setRemoveMemberTarget(m)} className="px-3 py-1.5 text-sm font-medium rounded-full text-white bg-red-500 hover:bg-red-600">Remove</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending invitations */}
          {canManageMembers && pendingInvites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending Invitations</h3>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl divide-y">
                {pendingInvites.map((inv) => (
                  <div key={inv.token} className="flex items-center justify-between px-5 py-5">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{inv.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Invited as <span className="capitalize">{inv.role}</span> · expires {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Invited</span>
                      <button onClick={() => handleCancelInvite(inv.token)} className="px-3 py-1.5 text-sm font-medium rounded-full border hover:bg-gray-100 text-gray-600">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== Contacts ===== */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contacts</h2>
            </div>
            {canManageMembers && (
              <button
                onClick={() => setContactFormTarget({})}
                className="px-3 py-1.5 text-sm font-medium rounded-full border hover:bg-gray-100"
              >
                + Add Contact
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-center text-gray-500 text-base">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <p className="text-center text-gray-400 text-base mt-2">No contacts yet.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl divide-y">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-5">
                  <div>
                    <p className="text-base md:text-lg font-semibold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{c.email}</p>
                  </div>
                  {canManageMembers && (
                    <div className="flex gap-2">
                      <button onClick={() => setContactFormTarget(c)} className="px-3 py-1.5 text-sm font-medium rounded-full border hover:bg-gray-100">Edit</button>
                      <button onClick={() => setDeleteContactTarget(c)} className="px-3 py-1.5 text-sm font-medium rounded-full text-white bg-red-500 hover:bg-red-600">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isFetchingMore && <p className="text-center mt-3 text-base text-gray-500">Loading more...</p>}
        </section>

      </div>

      {/* ===== Modals ===== */}

      {/* Invite platform member */}
      {inviteModal && (
        <MemberFormModal
          orgId={org_id}
          existing={null}
          onClose={() => setInviteModal(false)}
          onSuccess={() => { fetchPlatformMembers(); fetchPendingInvites(); }}
        />
      )}

      {/* Edit platform member role */}
      {editMemberModal && (
        <MemberFormModal
          orgId={org_id}
          existing={{ id: editMemberModal.user_id, email: editMemberModal.email, name: editMemberModal.name, role: editMemberModal.role }}
          onClose={() => setEditMemberModal(null)}
          onSuccess={() => { setEditMemberModal(null); fetchPlatformMembers(); }}
        />
      )}

      {/* Remove platform member */}
      {removeMemberTarget && (
        <ConfirmRemoveModal
          label={removeMemberTarget.name || removeMemberTarget.email}
          loading={removingMember}
          onConfirm={handleRemoveMember}
          onClose={() => setRemoveMemberTarget(null)}
        />
      )}

      {/* Add / edit contact */}
      {contactFormTarget !== null && (
        <ContactFormModal
          orgId={org_id}
          existing={Object.keys(contactFormTarget).length > 0 ? contactFormTarget : null}
          onClose={() => setContactFormTarget(null)}
          onSuccess={fetchContacts}
        />
      )}

      {/* Delete contact */}
      {deleteContactTarget && (
        <ConfirmRemoveModal
          label={deleteContactTarget.name || deleteContactTarget.email}
          loading={deletingContact}
          onConfirm={handleDeleteContact}
          onClose={() => setDeleteContactTarget(null)}
        />
      )}
    </main>
  );
}

export default withProfileCompletionGuard(MemberListPage);
