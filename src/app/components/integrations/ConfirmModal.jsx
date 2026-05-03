export default function ConfirmModal({
    title,
    description,
    confirmText = "Continue",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    danger = false
  }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-[420px] max-w-full rounded-2xl shadow-2xl p-6">
  
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h2>
  
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>
  
          <div className="flex justify-end gap-3">
  
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
            >
              {cancelText}
            </button>
  
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-full text-white text-sm shadow ${
                danger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668]"
              }`}
            >
              {confirmText}
            </button>
  
          </div>
        </div>
      </div>
    );
  }