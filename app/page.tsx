import Link from 'next/link';
import Image from 'next/image';
import ShieldIcon from '@/components/ShieldIcon';
import { Shield, Users, UserCheck, FileText, AlertTriangle, Clock, Lock, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mr-4 shadow-lg">
            <Shield className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-bold text-white">
            AmarVote
          </h1>
        </div>

        {/* Subtitle */}
        <h2 className="text-2xl text-gray-300 font-light mb-4">
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden order-2 lg:order-1">
              <Image
                src="/images/automated alert system.jpg"
                alt="Automated Alert System"
                width={600}
                height={400}
                className="w-full h-full object-cover"
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
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl overflow-hidden">
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

      {/* About the Developers Section */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">About the Developers</h2>
          <p className="text-gray-400 mb-16">Meet the team behind AmarVote's secure election monitoring system</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {/* Developer 1 */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Lt Tanvir Ahmed</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed px-2">Focused on building intuitive user interfaces and real-time data visualization dashboards.</p>
              <div className="flex justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Developer 2 */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Lt Tanvirul Islam</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed px-2">Expert in real-time data synchronization, database design, and scalable backend architecture.</p>
              <div className="flex justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Developer 3 */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Lt Sizdatul Karim Evan</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed px-2">Specialized in building secure authentication systems and role-based access control for election monitoring.</p>
              <div className="flex justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Developer 4 */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-8 shadow-xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Tanzid Morshed Shahed</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed px-2">Specialized in application security, audit systems, and ensuring data integrity for elections.</p>
              <div className="flex justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Section */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-8">Technologies Used in AmarVote</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">Next.js</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">React</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">TypeScript</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">Tailwind CSS</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">Node.js</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">PostgreSQL</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">Real-time APIs</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">JWT Authentication</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">Geospatial Systems</span>
              <span className="px-6 py-3 bg-indigo-600/80 text-white rounded-full text-sm font-medium">WebSocket</span>
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
