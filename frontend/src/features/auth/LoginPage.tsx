import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!', 'Successfully signed in to Recall AI');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
      toast.error('Sign in failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      await login({ email: 'demo@recall.ai', password: 'RecallDemo2026!' });
      toast.success('Welcome to Recall AI!', 'Exploring portfolio demo workspace (User: Beulah)');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Demo sign-in failed. Please try again.';
      setError(msg);
      toast.error('Demo sign-in error', msg);
    } finally {
      setIsDemoLoading(false);
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
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-7 shadow-xs">
          {/* Portfolio Showcase Demo Hero Section */}
          <div className="mb-6 p-4 rounded-xl bg-[#F4F6EE] border border-[#C4D5B0] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#183C36] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#526F52]" />
                <span>Portfolio Showcase Demo</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C4D5B0] text-[#183C36]">
                1-Click Access
              </span>
            </div>

            <p className="text-xs text-[#7C877D] leading-relaxed mb-3.5">
              Reviewing this project for portfolio evaluation? Click below to instantly launch the pre-loaded demo account (User: <strong className="text-[#26332C]">Beulah</strong>) with saved memories, reminders, lent items, departure routines, and AI assistant history.
            </p>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full bg-[#183C36] hover:bg-[#204942] text-white font-semibold py-2.5 shadow-xs border-0"
              onClick={handleDemoLogin}
              isLoading={isDemoLoading}
              leftIcon={<Sparkles className="w-4 h-4 text-[#C4D5B0]" />}
            >
              ✨ Launch 1-Click Demo Showcase
            </Button>

            <div className="mt-3 pt-2.5 border-t border-[#D9DED2] flex items-center justify-between text-[11px] text-[#7C877D]">
              <span>
                Demo: <strong className="text-[#26332C]">demo@recall.ai</strong> • <strong className="text-[#26332C]">RecallDemo2026!</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@recall.ai');
                  setPassword('RecallDemo2026!');
                }}
                className="text-[#526F52] font-semibold hover:underline cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-[#D9DED2] w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-[#7C877D] uppercase tracking-wider absolute">
              or sign in with email
            </span>
          </div>

          <h2 className="text-base font-semibold text-[#26332C] mb-1">Standard Sign In</h2>
          <p className="text-xs text-[#7C877D] mb-4">Enter your registered email and password</p>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-[#D9534F]/10 border border-[#D9534F]/20 text-[#D9534F] text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-[#D9DED2]">
            <p className="text-xs text-[#7C877D]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-[#526F52] hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


