import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
          <h2 className="text-lg font-semibold text-[#26332C] mb-1">Sign In</h2>
          <p className="text-xs text-[#7C877D] mb-6">Enter your details to access your personal memory system</p>

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

          <div className="mt-4 p-3 rounded-xl bg-[#EBEFE4] border border-[#D9DED2] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#26332C]">Demo Credentials</p>
              <p className="text-[11px] text-[#7C877D]">demo@recall.ai • RecallDemo2026!</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@recall.ai');
                setPassword('RecallDemo2026!');
              }}
              className="px-2.5 py-1 text-xs font-semibold text-[#526F52] bg-white border border-[#526F52]/40 rounded-lg hover:bg-[#526F52] hover:text-white transition-colors cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>

          <div className="mt-6 text-center pt-6 border-t border-[#D9DED2]">
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

