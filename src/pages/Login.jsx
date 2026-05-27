import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Login failed');
      }
      const user = await response.json();
      setCurrentUser(user);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/worker');
      }
    } catch (err) {
      alert(err.message || 'Unable to sign in.');
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-orchard-overlay relative overflow-hidden" data-alt="cinematic wide shot of a lush apple orchard at sunrise">
      {/* Animated visual texture layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#173416_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="glass-panel p-8 md:p-12 rounded-xl shadow-[0px_20px_40px_rgba(27,28,24,0.12)] border border-white/20">
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-primary text-white p-2.5 rounded-lg mr-3 shadow-lg">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>park</span>
              </div>
              <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">AgroNest</h1>
            </div>
            <h2 className="font-headline font-bold text-3xl text-on-surface">Welcome Back</h2>
            <p className="text-on-surface-variant font-medium mt-2">Access your orchard dashboard</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">alternate_email</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-high border-none rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-surface-tint/20 transition-all outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="agronomist@agronest.farm" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-secondary hover:text-on-secondary-container transition-colors" href="#">Forgot Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-12 py-4 bg-surface-container-high border-none rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-surface-tint/20 transition-all outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            
            {/* Options */}
            <div className="flex items-center">
              <input className="h-5 w-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary focus:ring-offset-0 transition-all" id="remember-me" name="remember-me" type="checkbox"/>
              <label className="ml-3 block text-sm font-medium text-on-surface" htmlFor="remember-me">
                Keep me signed in
              </label>
            </div>
            
            {/* Submit */}
            <button className="w-full flex items-center justify-center py-4 px-6 bg-primary text-white font-headline font-bold rounded-lg shadow-lg hover:bg-primary-container active:scale-[0.98] transition-all duration-150 group" type="submit">
              Sign In
              <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">login</span>
            </button>
          </form>
          
          {/* Status Note */}
          <div className="mt-10 pt-8 border-t border-outline-variant/15 flex flex-col items-center">
            <div className="flex items-center text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest text-center">
              <span className="material-symbols-outlined text-[14px] mr-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              Secure access for authorized farm personnel only
            </div>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-8 flex justify-center space-x-6 text-sm font-medium text-white/70">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 self-center"></span>
          <a className="hover:text-white transition-colors" href="#">Farm Support</a>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 self-center"></span>
          <a className="hover:text-white transition-colors" href="#">Legal Terms</a>
        </div>
      </div>
    </main>
  );
}
