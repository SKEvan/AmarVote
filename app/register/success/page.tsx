import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-red-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-red-700 mb-6">
          Application Submitted!
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Your law enforcement application has been submitted for admin approval. You will be notified once your account is verified.
        </p>

        {/* Back to Home Button */}
        <Link href="/">
          <button className="bg-red-600 text-white font-semibold py-3.5 px-12 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
