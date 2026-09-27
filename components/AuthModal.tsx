import React, { useState } from 'react';
import { X, Mail, Loader2, Cloud, CloudOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps { onClose: () => void; }

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } });
      if (signInError) setError(signInError.message); else setEmailSent(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
          <div className="flex items-center gap-3 mb-2"><Cloud className="w-8 h-8" /><h2 className="text-2xl font-bold font-rounded">Save your family's progress</h2></div>
          <p className="text-green-100 text-sm">Use a secure sign-in link instead of a password.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!emailSent ? <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Parent's Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors" required /></div></div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Sending secure link...</> : 'Email me a secure sign-in link'}</button>
          </> : <div className="rounded-2xl bg-green-50 p-5 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-green-600" /><p className="mt-3 font-semibold text-green-800">Check your email</p><p className="mt-1 text-sm text-green-700">Open the secure link we sent to finish signing in.</p></div>}
        </form>
        <div className="px-6 pb-6"><div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div></div><button onClick={onClose} className="w-full mt-4 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"><CloudOff className="w-5 h-5" />Continue without account</button><p className="text-xs text-gray-400 text-center mt-2">Progress will only be saved on this device</p></div>
      </div>
    </div>
  );
};

export default AuthModal;
