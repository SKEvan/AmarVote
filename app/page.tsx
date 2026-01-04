import Link from 'next/link';
import Image from 'next/image';
import { Shield, Users, UserCheck, FileText, AlertTriangle, Clock, Lock, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0d111f] to-[#111827] scroll-smooth">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mr-4 sm:mr-5 animate-float">
            <Image
              src="/images/logo-AmarVote.png"
              alt="AmarVote logo"
              width={80}
              height={80}
              className="w-full h-full rounded-2xl shadow-2xl shadow-emerald-500/30 object-cover"
              priority
            />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
            Amar<span className="text-emerald-400">Vote</span>
          </h1>
        </div>

        {/* Subtitle */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-medium mb-6 tracking-wide">
          Secure Election Monitoring & Management System
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto mb-20 leading-relaxed">
          Real-time incident tracking, vote management, and automated alerts for<br className="hidden sm:block" />
          transparent elections in Bangladesh
        </p>
      </div>

      {/* Role Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* BEC Admin Card - Green */}
          <div className="group bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 text-center animate-card-1 hover-lift border border-emerald-500/20">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-900/50 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
              BEC Admin
            </h3>
            <p className="text-white/90 text-sm mb-8 leading-relaxed">
              Full system access, user management,<br />
              and monitoring
            </p>
            <Link href="/login?role=admin">
              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </button>
            </Link>
          </div>

          {/* Presiding Officer Card - Blue */}
          <div className="group bg-gradient-to-br from-blue-600/90 to-blue-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 text-center animate-card-2 hover-lift border border-blue-500/20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-900/50 group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
              Presiding Officer
            </h3>
            <p className="text-white/90 text-sm mb-8 leading-relaxed">
              Report incidents and submit vote counts
            </p>
            <Link href="/login?role=officer">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mb-3 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Officer Login
              </button>
            </Link>
            <Link href="/register/officer">
              <button className="w-full bg-blue-600/60 backdrop-blur-sm text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-600/80 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500/30 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Apply Now
              </button>
            </Link>
          </div>

          {/* Law Enforcement Card - Purple */}
          <div className="group bg-gradient-to-br from-purple-600/90 to-purple-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 text-center animate-card-3 hover-lift border border-purple-500/20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-900/50 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
              Law Enforcement
            </h3>
            <p className="text-white/90 text-sm mb-8 leading-relaxed">
              Receive alerts and respond to incidents
            </p>
            <Link href="/login?role=police">
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mb-3 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Enforcement Login
              </button>
            </Link>
            <Link href="/register">
              <button className="w-full bg-purple-600/60 backdrop-blur-sm text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-purple-600/80 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 border border-purple-500/30 active:scale-95">
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
      <div className="bg-gradient-to-b from-[#0d111f] to-[#111827] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Incident Tracking System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center animate-fade-in">
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden animate-slide-right image-zoom">
              <Image
                src="/images/incident tracking.webp"
                alt="Incident Tracking System"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Automated Alert System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center animate-fade-in">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden order-2 lg:order-1 animate-slide-left image-zoom">
              <Image
                src="/images/automated alert system.jpg"
                alt="Automated Alert System"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center mb-6">
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
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-3xl p-12 shadow-2xl mb-20">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                🔒 Secure Role-Based Access Control
              </h2>
              <p className="text-emerald-100 text-sm max-w-3xl mx-auto">
                Ensure election integrity with multi-tiered access control. Only authorized personnel<br />
                have access to sensitive data, and every action is logged and monitored to ensure<br />
                complete transparency in the election process.
              </p>
            </div>
            
            {/* Role Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-emerald-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-emerald-500/30">
                <User className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Voter</h3>
                <p className="text-emerald-100 text-sm">Cast Vote</p>
              </div>
              <div className="bg-emerald-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-emerald-500/30">
                <FileText className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Real-Time</h3>
                <p className="text-emerald-100 text-sm">Track Incidents</p>
              </div>
              <div className="bg-emerald-600/50 backdrop-blur-sm rounded-xl p-6 text-center border border-emerald-500/30">
                <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Complete</h3>
                <p className="text-emerald-100 text-sm">Full Access</p>
              </div>
            </div>
          </div>

          {/* Vote Submission with Locking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 animate-fade-in">
            <div>
              <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-6">
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden animate-slide-right image-zoom">
              <Image
                src="/images/vote submission with locking.jpg"
                alt="Vote Submission with Locking"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0a0e1a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Image src="/images/logo-AmarVote.png" alt="AmarVote" width={28} height={28} className="rounded-md" />
              <span>AmarVote</span>
              <span className="ml-4">© 2026 AmarVote. All rights reserved.</span>
            </div>
            <div className="hidden md:flex gap-6">
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
