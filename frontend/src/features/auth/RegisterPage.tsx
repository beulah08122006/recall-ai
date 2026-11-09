import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      toast.success('Account created', 'Welcome to Recall AI! Your memory workspace is ready.');
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
      toast.error('Registration error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8D8] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#526F52] text-white shadow-sm mb-3">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Recall AI</h1>
          <p className="text-sm text-[#7C877D] mt-1">Your life, remembered.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-8 shadow-xs">
          {/* Portfolio Demo Banner */}
          <div className="mb-5 p-3 rounded-xl bg-[#F4F6EE] border border-[#C4D5B0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#526F52] shrink-0" />
              <span className="text-xs text-[#26332C]">
                Here for a portfolio showcase?
              </span>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#183C36] bg-[#C4D5B0] hover:bg-[#b5c79e] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
            >
              1-Click Demo →
            </Link>
          </div>

          <h2 className="text-lg font-semibold text-[#26332C] mb-1">Create Account</h2>
          <p className="text-xs text-[#7C877D] mb-6">Set up your secure personal memory system</p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-[#D9534F]/10 border border-[#D9534F]/20 text-[#D9534F] text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-[#D9DED2]">
            <p className="text-xs text-[#7C877D]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#526F52] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

