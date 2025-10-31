import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const ADMIN_CREDENTIALS = {
  username: 'fsreklam',
  password: 'SE41ka57'
};

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();
    if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password) {
      // Use session-based auth so direct URL access in new tabs is blocked
      try {
        sessionStorage.setItem('adminAuth', 'true');
        console.log('adminAuth after set:', sessionStorage.getItem('adminAuth'));
        localStorage.removeItem('adminAuth');
        window.location.replace('/admin/dashboard'); // Direct redirect
      } catch {}
    } else {
      setError('Geçersiz kullanıcı adı veya şifre');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f1d] bg-[url('https://images.unsplash.com/photo-1540552965541-cc47d835c36d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-[#0d0f1d]/90 before:backdrop-blur-sm">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Admin Girişi</h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-3 px-10 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                placeholder="Kullanıcı Adı"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-3 px-10 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                placeholder="Şifre"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}