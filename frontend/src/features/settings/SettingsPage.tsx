import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Settings, User, Bell, Palette, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime || '09:00');
  const [enableTips, setEnableTips] = useState(user?.preferences?.enableTips ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      const updated = await authService.updateProfile({
        name: name.trim(),
        preferences: {
          theme,
          reminderTime,
          enableTips,
        },
      });
      updateUser(updated);
      toast.success('Settings updated', 'Your profile preferences have been saved.');
    } catch (err: any) {
      toast.error('Failed to update', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed out', 'You have been safely signed out.');
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9DED2]">
        <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Settings</h1>
        <p className="text-sm text-[#7C877D] mt-0.5">
          Manage your account profile, preferences, and system defaults.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED2]">
            <User className="w-5 h-5 text-[#526F52]" />
            <h2 className="text-base font-bold text-[#26332C]">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-[#D9DED2] bg-[#EBEFE4]/60 px-3.5 py-2 text-sm text-[#7C877D] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#7C877D] mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED2]">
            <Palette className="w-5 h-5 text-[#526F52]" />
            <h2 className="text-base font-bold text-[#26332C]">Application Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Appearance Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              options={[
                { value: 'light', label: 'Sage & Cream (Default)' },
                { value: 'system', label: 'System Matching' },
              ]}
            />

            <Input
              label="Default Daily Reminder Time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableTips}
                onChange={(e) => setEnableTips(e.target.checked)}
                className="w-4 h-4 rounded text-[#526F52] focus:ring-[#526F52]/30"
              />
              <span className="text-sm font-medium text-[#26332C]">
                Show intelligent departure suggestions and reminders on dashboard
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Account / Session Management */}
      <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED2] text-[#D9534F]">
          <LogOut className="w-5 h-5" />
          <h2 className="text-base font-bold text-[#26332C]">Account & Session</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-[#26332C]">Sign Out</h4>
            <p className="text-xs text-[#7C877D] mt-0.5">
              Securely disconnect this device from your Recall AI account.
            </p>
          </div>
          <Button variant="danger" size="md" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

