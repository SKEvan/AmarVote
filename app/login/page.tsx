'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ShieldIcon from '@/components/ShieldIcon';
import { User, Lock, ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { authenticateUser } from '@/data/mockData';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Use the new authentication system
    const result = authenticateUser(username, password, role as 'admin' | 'officer' | 'police');
    
    if (result.success && result.user) {
      // Successful login - persist minimal user info and redirect
      try {
        const displayRole = role === 'admin' ? 'BEC Admin' : role === 'police' ? 'Law Enforcement' : 'Presiding Officer';
        localStorage.setItem('user', JSON.stringify({ 
          name: result.user.name, 
          role: displayRole, 
          avatar: '',
          userId: result.user.id
        }));
      } catch (e) {
        // ignore storage errors
      }

      const redirectMap = {
        admin: '/dashboard/admin',
        officer: '/dashboard/officer',
        police: '/dashboard/police'
      };

      router.push(redirectMap[role as keyof typeof redirectMap] || '/');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  // Law Enforcement Portal Design
  if (role === 'police') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Law Enforcement Portal Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Icon and Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-red-700 mb-2">Law Enforcement Portal</h1>
              <p className="text-gray-600">Incident Response & Alert Management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service ID / Username Field */}
              <div>
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                  Service ID / Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rahman"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="rahman123"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                Login to Law Enforcement Portal
              </button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}
            </form>

            {/* Not Registered Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Not registered?</p>
              <Link href="/register">
                <button className="w-full border-2 border-red-600 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-50 transition-all duration-200">
                  Apply for Law Enforcement Portal Access
                </button>
              </Link>
            </div>

            {/* Emergency Response Access */}
            <div className="mt-6 text-center">
              <Link href="#" className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Response Access
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Login Design (Admin & Officer)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShieldIcon className="w-10 h-10 mr-2" color="#10b981" />
            <h1 className="text-4xl font-bold text-primary-green">AmarVote</h1>
          </div>
          <h2 className="text-xl text-gray-600">Secure Login</h2>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent bg-white"
                required
              >
                <option value="">Select role...</option>
                <option value="admin">BEC Admin</option>
                <option value="officer">Presiding Officer</option>
                <option value="police">Law Enforcement</option>
              </select>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-primary-green text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200"
            >
              Login
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}
          </form>

          {/* RBAC Notice */}
          <div className="mt-6 bg-warning-bg border border-yellow-300 rounded-lg p-3">
            <p className="text-xs text-warning-text text-center">
              <span className="mr-1">🔒</span>
              <strong>This system uses Role-Based Access Control (RBAC).</strong>
              <br />
              All login attempts are logged and monitored.
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-green transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
