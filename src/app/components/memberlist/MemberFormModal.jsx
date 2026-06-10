import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, CheckCircle } from "lucide-react";
import axios from "axios";

const ASSIGNABLE_ROLES = [
  { value: "admin",  label: "Admin"  },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export default function MemberFormModal({ orgId, existing, onClose, onSuccess }) {
  const [email, setEmail] = useState(existing?.email || "");
  const [role, setRole]   = useState(existing?.role || "member");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const isEdit = Boolean(existing);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/memberships/${existing.id}/`,
          { role }
        );
        onSuccess();
        onClose();
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/memberships/invite/`,
          { email, role }
        );
        // Don't close immediately — show confirmation, then refresh pending invites
        setInviteSent(true);
        onSuccess();
      }
    } catch (err) {
      const data = err.response?.data;
      if (typeof data?.detail === "string") {
        setError(data.detail);
      } else if (data?.email) {
        setError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else if (data?.role) {
        setError(Array.isArray(data.role) ? data.role[0] : data.role);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    {isEdit ? "Change Role" : "Invite Member"}
                  </Dialog.Title>
                  <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {inviteSent ? (
                  <div className="py-6 flex flex-col items-center text-center gap-3">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-gray-800 font-medium">Invitation sent!</p>
                    <p className="text-sm text-gray-500">
                      An email has been sent to <strong>{email}</strong>. They will appear as
                      &ldquo;Invited&rdquo; until they accept.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {!isEdit && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}

                      {isEdit && (
                        <p className="text-sm text-gray-600">
                          Changing role for <strong>{existing.name || existing.email}</strong>
                        </p>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-4 py-2 text-sm text-white rounded-md ${
                          loading
                            ? "bg-indigo-300 cursor-not-allowed"
                            : "bg-linear-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668]"
                        }`}
                      >
                        {loading ? "Sending..." : isEdit ? "Save" : "Send Invite"}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
