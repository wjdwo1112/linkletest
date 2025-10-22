import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AlertModal({ isOpen, onClose, title, message, confirmText = '확인' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80 bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title || '알림'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
