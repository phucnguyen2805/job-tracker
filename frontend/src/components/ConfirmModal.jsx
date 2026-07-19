import { AlertTriangle, X } from 'lucide-react';

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            danger ? 'bg-red-50 dark:bg-red-950' : 'bg-indigo-50 dark:bg-indigo-950'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500 dark:text-red-400' : 'text-indigo-500 dark:text-indigo-400'}`} />
          </div>
          <button onClick={onCancel} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;