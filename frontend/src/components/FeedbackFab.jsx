import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FeedbackFab = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('FEATURE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    
    try {
      setLoading(true);
      // Mock submit as per instructions
      console.log('Feedback submitted to IT Desk:', { category, notes });
      await new Promise(resolve => setTimeout(resolve, 800));
      setNotes('');
      setIsOpen(false);
      alert('Thanks for your feedback!');
    } catch (error) {
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
            <h3 className="font-semibold text-sm">IT Desk Feedback</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BUG">Report a Bug</option>
                <option value="FEATURE">Feature Request</option>
                <option value="GENERAL">General Feedback</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Feedback</label>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !notes.trim()}
              className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Submit Feedback</>}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquarePlus className="w-6 h-6" />}
      </button>
    </div>
  );
};
