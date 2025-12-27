import Link from 'next/link';
import Image from 'next/image';
import ShieldIcon from '@/components/ShieldIcon';
import { Shield, Users, UserCheck, FileText, AlertTriangle, Clock, Lock, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-blue-200">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mr-4 shadow-lg">
            <Shield className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-bold text-gray-600">
            AmarVote
          </h1>
        </div>

        {/* Subtitle */}
        <h2 className="text-2xl text-gray-400 font-light mb-4">
          Secure Election Monitoring & Management System
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-base max-w-3xl mx-auto mb-16">
          Real-time incident tracking, vote management, and automated alerts for<br />
          transparent elections in Bangladesh
        </p>
      </div>

      {/* Role Cards Section */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* BEC Admin Card - Green */}
          <div className="bg-gradient-to-br from-teal-600/90 to-emerald-700/90 rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold text-white drop-shadow-lg mb-3">
              BEC Admin
            </h3>
            <p className="text-white/95 text-sm mb-8 leading-relaxed">
              Full system access, user management,<br />
              and monitoring
            </p>
            <Link href="/login?role=admin">
              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </button>
            </Link>
          </div>

          {/* Presiding Officer Card - Blue */}
          <div className="bg-gradient-to-br from-indigo-600/90 to-blue-700/90 rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <UserCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold text-white drop-shadow-lg mb-3">
              Presiding Officer
            </h3>
            <p className="text-white/95 text-sm mb-8 leading-relaxed">
              Report incidents and submit vote counts
            </p>
            <Link href="/login?role=officer">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Officer Login
              </button>
            </Link>
            <Link href="/register">
              <button className="w-full bg-indigo-700/60 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-indigo-700/80 transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Apply Now
              </button>
            </Link>
          </div>

          {/* Law Enforcement Card - Red */}
          <div className="bg-gradient-to-br from-rose-600/90 to-pink-700/90 rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-semibold text-white drop-shadow-lg mb-3">
              Law Enforcement
            </h3>
            <p className="text-white/95 text-sm mb-8 leading-relaxed">
              Receive alerts and respond to incidents
            </p>
            <Link href="/login?role=police">
              <button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Enforcement Login
              </button>
            </Link>
            <Link href="/register">
              <button className="w-full bg-rose-700/60 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-rose-700/80 transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Apply Now
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* Features Section - Dark Navy Background */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Incident Tracking System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Incident Tracking System and<br />Interactive Map
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Effortlessly monitor and document election-related incidents in real-time with<br />
                our interactive map. Get instant visibility across all polling stations to ensure<br />
                alongside real-time visualization.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-xl min-h-[280px] flex items-center justify-center">
              <Image
                src="/images/incident tracking system and interactive map.png"
                alt="Incident Tracking System"
                width={400}
                height={240}
                className="rounded-lg object-contain"
              />
            </div>
          </div>

          {/* Automated Alert System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-xl min-h-[280px] flex items-center justify-center order-2 lg:order-1">
              <Image
                src="/images/automated alert system.jpg"
                alt="Automated Alert System"
                width={400}
                height={240}
                className="rounded-lg object-contain"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-6">
                <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Automated Alert System
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Intelligent real-time notifications ensure that law enforcement and election<br />
                officials are immediately alerted to critical incidents. Our system prioritizes alerts<br />
                based on severity and location to support rapid incident resolution.
              </p>
            </div>
          </div>

          {/* Secure Role-Based Access Control */}
          <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-3xl p-12 shadow-2xl mb-20">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                🔒 Secure Role-Based Access Control
              </h2>
              <p className="text-amber-100 text-sm max-w-3xl mx-auto">
                Ensure election integrity with multi-tiered access control. Only authorized personnel<br />
                have access to sensitive data, and every action is logged and monitored to ensure<br />
                complete transparency in the election process.
              </p>
            </div>
            
            {/* Role Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-amber-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-500/30">
                <User className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Voter</h3>
                <p className="text-amber-100 text-sm">Cast Vote</p>
              </div>
              <div className="bg-amber-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-500/30">
                <FileText className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Real-Time</h3>
                <p className="text-amber-100 text-sm">Track Incidents</p>
              </div>
              <div className="bg-amber-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-500/30">
                <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Complete</h3>
                <p className="text-amber-100 text-sm">Full Access</p>
              </div>
            </div>
          </div>

          {/* Vote Submission with Locking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="w-14 h-14 rounded-xl bg-cyan-500 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Vote Submission with Locking
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Ensure the integrity of submitted votes with our secure locking mechanism. Once<br />
                votes are submitted and locked by presiding officers, they cannot be altered,<br />
                ensuring tamper-proof recording.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-xl min-h-[280px] flex items-center justify-center">
              <Image
                src="/images/vote submission with locking.jpg"
                alt="Vote Submission with Locking"
                width={400}
                height={240}
                className="rounded-lg object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* About the Developers Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">About the Developers</h2>
          <p className="text-gray-400 mb-16">Meet the team behind AmarVote's world-class monitoring system</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Developer 1 */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Lt Syed Ahmed</h3>
              <p className="text-gray-400 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs">git</span>
                </div>
              </div>
            </div>

            {/* Developer 2 */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Lt Tawkir Islam</h3>
              <p className="text-gray-400 text-sm mb-4">Backend Developer</p>
              <div className="flex justify-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs">git</span>
                </div>
              </div>
            </div>

            {/* Developer 3 */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Lt Shazdul Karim Evan</h3>
              <p className="text-gray-400 text-sm mb-4">Frontend Developer</p>
              <div className="flex justify-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs">git</span>
                </div>
              </div>
            </div>

            {/* Developer 4 */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Mehdi Mohmed Shahed</h3>
              <p className="text-gray-400 text-sm mb-4">UI/UX Designer</p>
              <div className="flex justify-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs">git</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span>AmarVote</span>
              <span className="ml-4">© 2024 AmarVote. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
