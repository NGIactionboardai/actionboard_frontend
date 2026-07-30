import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { initiateOwnershipTransfer } from "@/redux/auth/organizationSlice";

const NEW_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export default function TransferOwnershipModal({ orgId, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [targetEmail, setTargetEmail] = useState("");
  const [optOut, setOptOut] = useState(false);
  const [newRole, setNewRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transferSent, setTransferSent] = useState(false);

  const handleSubmit = async () => {
    if (!targetEmail.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await dispatch(
      initiateOwnershipTransfer({
        orgId,
        targetEmail: targetEmail.trim(),
        initiatorNewRole: optOut ? null : newRole,
      })
    );

    setLoading(false);

    if (initiateOwnershipTransfer.fulfilled.match(result)) {
      setTransferSent(true);
      toast.success(`Ownership transfer request sent to ${targetEmail.trim()}.`);
      onSuccess?.();
    } else {
      const payload = result.payload;
      setError(payload?.message || "Something went wrong. Please try again.");
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
                    Transfer Ownership
                  </Dialog.Title>
                  <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {transferSent ? (
                  <div className="py-6 flex flex-col items-center text-center gap-3">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-gray-800 font-medium">Transfer request sent!</p>
                    <p className="text-sm text-gray-500">
                      <strong>{targetEmail.trim()}</strong> has been notified and must accept before
                      ownership changes. You&rsquo;ll remain the owner until they do.
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
                      <p className="text-sm text-gray-600">
                        The person you transfer to must already have a Nous Meeting account. They will
                        need to accept before ownership actually changes.
                      </p>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          New owner&rsquo;s email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={targetEmail}
                          onChange={(e) => setTargetEmail(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={optOut}
                            onChange={(e) => setOptOut(e.target.checked)}
                          />
                          Leave this organisation completely after the transfer
                        </label>
                      </div>

                      {!optOut && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Your new role after transfer
                          </label>
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            {NEW_ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

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
                        {loading ? "Sending..." : "Send Transfer Request"}
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
