import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Mock submit for now as per instructions
    console.log('Feedback submitted to IT Desk:', feedback);
    
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden">
          <div className="p-4 bg-blue-600 flex justify-between items-center text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> IT Desk Feedback
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4">
            {submitted ? (
              <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 font-medium animate-in zoom-in duration-300">
                Thanks for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what's working or what could be better..."
                  rows={4}
                  className="w-full form-input text-sm resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!feedback.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isOpen 
            ? 'bg-slate-800 text-white dark:bg-slate-700' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
