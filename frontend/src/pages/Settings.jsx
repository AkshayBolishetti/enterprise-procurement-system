import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, ArrowLeft, User, ShieldCheck, Building2, Bell, Check, Monitor } from 'lucide-react';
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

import { Trash2, Plus } from 'lucide-react';

const PaymentSettings = () => {
  const [cards, setCards] = useState([]);
  const [hasMpin, setHasMpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // MPIN State
  const [currentMpin, setCurrentMpin] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');

  // Card State
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardPin, setCardPin] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payment-settings');
      setCards(res.data?.data?.savedCards || res.data?.savedCards || []);
      setHasMpin(res.data?.data?.hasMpin || res.data?.hasMpin || false);
    } catch (err) {
      console.error(err);
      setError('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveMpin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newMpin !== confirmMpin) {
      return setError('New MPINs do not match.');
    }
    if (newMpin.length !== 4) {
      return setError('MPIN must be 4 digits.');
    }
    try {
      await api.post('/admin/payment-settings/mpin', { mpin: newMpin, currentMpin: hasMpin ? currentMpin : undefined });
      setSuccess('MPIN saved successfully.');
      setCurrentMpin(''); setNewMpin(''); setConfirmMpin('');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to save MPIN.');
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (cardPin.length !== 4) return setError('Card PIN must be 4 digits.');
    if (cardNumber.length < 12) return setError('Invalid card number.');
    try {
      await api.post('/admin/payment-settings/cards', { cardholderName: cardName, cardNumber, pin: cardPin });
      setSuccess('Card added successfully.');
      setShowAddCard(false);
      setCardName(''); setCardNumber(''); setCardPin('');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to add card.');
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Delete this card?')) return;
    setError(''); setSuccess('');
    try {
      await api.delete(`/admin/payment-settings/cards/${id}`);
      setSuccess('Card deleted.');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to delete card.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs mt-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Payment Configurations</h2>
      </div>

      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-8">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2"><Check className="w-4 h-4" /> {success}</div>}
          
          {/* MPIN Section */}
          <div>
            <h3 className="text-sm font-semibold mb-2">MPIN Settings</h3>
            <p className="text-xs text-slate-500 mb-4">Required for processing UPI and Net Banking simulated payments.</p>
            <form onSubmit={handleSaveMpin} className="space-y-3 max-w-sm">
              {hasMpin && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current MPIN</label>
                  <input type="password" maxLength={4} required value={currentMpin} onChange={e => setCurrentMpin(e.target.value.replace(/\D/g, ''))} className="form-input text-center tracking-widest font-mono" placeholder="••••" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{hasMpin ? 'New MPIN' : 'Set MPIN'}</label>
                <input type="password" maxLength={4} required value={newMpin} onChange={e => setNewMpin(e.target.value.replace(/\D/g, ''))} className="form-input text-center tracking-widest font-mono" placeholder="••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm MPIN</label>
                <input type="password" maxLength={4} required value={confirmMpin} onChange={e => setConfirmMpin(e.target.value.replace(/\D/g, ''))} className="form-input text-center tracking-widest font-mono" placeholder="••••" />
              </div>
              <button type="submit" className="w-full btn-primary py-2 text-sm">Save MPIN</button>
            </form>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Cards Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-semibold">Saved Cards</h3>
                <p className="text-xs text-slate-500">Manage saved cards for card checkouts.</p>
              </div>
              <button onClick={() => setShowAddCard(!showAddCard)} className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
            </div>

            {showAddCard && (
              <form onSubmit={handleAddCard} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4 space-y-3 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-medium mb-1">Cardholder Name</label>
                  <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)} className="form-input text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Card Number</label>
                  <input type="text" maxLength={16} required value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))} className="form-input font-mono text-sm tracking-wider" placeholder="1234567890123456" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">4-Digit PIN</label>
                  <input type="password" maxLength={4} required value={cardPin} onChange={e => setCardPin(e.target.value.replace(/\D/g, ''))} className="form-input font-mono text-sm tracking-widest text-center max-w-[150px]" placeholder="••••" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddCard(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
                  <button type="submit" className="btn-primary text-xs py-1.5">Save Card</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {cards.length === 0 ? (
                <p className="text-sm italic text-slate-400">No saved cards found.</p>
              ) : (
                cards.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{c.cardholderName}</span>
                        <span className="text-xs text-slate-500 font-mono">{c.maskedNumber}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCard(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    requestUpdates: true,
    weeklyReport: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const dashboardPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">


      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System & Account Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your preferences, appearance themes, and account details.</p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-md">
              <Check className="w-4 h-4" /> Preferences saved!
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Appearance & Theme Preference</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Dark Mode</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle dark theme across the entire application interface. Preference is saved automatically.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    isDark ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isDark}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs ${
                      isDark ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {isDark ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  </span>
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[50px]">
                  {isDark ? 'Dark On' : 'Light On'}
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">User Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.email || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Employee ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.employeeId || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Assigned Role</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">{user?.role || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60 md:col-span-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.departmentName || 'Global / Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Email Alerts</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive email updates on status changes for procurement requests.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Request Updates</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">In-app notifications when an admin reviews your items.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.requestUpdates}
                  onChange={(e) => setNotifications({ ...notifications, requestUpdates: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-xs transition"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs mt-6 flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Sign Out</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Securely end your current session.</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2"
            >
              Sign Out
            </button>
          </div>

          {/* Admin Payment Settings */}
          {user?.role === 'ADMIN' && (
            <PaymentSettings />
          )}

        </div>
      </main>
    </div>
  );
};
