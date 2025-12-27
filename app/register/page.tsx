'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Upload, X, Eye, Download } from 'lucide-react';

// Bangladesh Districts and Thanas
const districtThanaMap: Record<string, string[]> = {
  'Dhaka': ['Adabor', 'Badda', 'Banani', 'Bangshal', 'Cantonment', 'Chackbazar', 'Darussalam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan', 'Hazaribagh', 'Jatrabari', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Mugda', 'New Market', 'Pallabi', 'Paltan', 'Ramna', 'Rampura', 'Sabujbagh', 'Shah Ali', 'Shahbag', 'Shahjahanpur', 'Sher-e-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon', 'Tejgaon I/A', 'Turag', 'Uttara', 'Uttar Khan', 'Vatara', 'Wari'],
  'Chittagong': ['Akbarshah', 'Bandar', 'Bayezid', 'Chandgaon', 'Chawkbazar', 'Double Mooring', 'EPZ', 'Halisohor', 'Khulshi', 'Kotwali', 'Kulshi', 'Panchlaish', 'Pahartali', 'Patenga', 'Sadarghat'],
  'Rajshahi': ['Boalia', 'Chandrima', 'Motihar', 'Rajpara', 'Shah Makhdum'],
  'Khulna': ['Aranghata', 'Daulatpur', 'Khalishpur', 'Khan Jahan Ali', 'Kotwali', 'Labanchora', 'Sonadanga'],
  'Sylhet': ['Airport', 'Jalalabad', 'Kotwali', 'Moglabazar', 'Osmani Nagar', 'South Surma'],
  'Barisal': ['Barisal Kotwali', 'Airport', 'Bandartila', 'Kawnia', 'Nathullabad'],
  'Rangpur': ['Kotwali', 'Mithapukur', 'Pirganj', 'Rangpur Sadar'],
  'Mymensingh': ['Kotwali', 'Muktagacha', 'Mymensingh Sadar'],
  'Comilla': ['Comilla Adarsha Sadar', 'Comilla Kotwali', 'Laksam', 'Daudkandi'],
  'Gazipur': ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi'],
  'Narayanganj': ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Siddirganj', 'Sonargaon'],
  'Tangail': ['Tangail Sadar', 'Basail', 'Delduar', 'Ghatail', 'Kalihati', 'Madhupur'],
};

// Law Enforcement Ranks
const lawEnforcementRanks = {
  'Police': ['Constable', 'Naik', 'Sergeant', 'Sub-Inspector (SI)', 'Inspector', 'Additional Superintendent (ASP)', 'Superintendent (SP)', 'Additional Deputy Inspector General (Addl. DIG)', 'Deputy Inspector General (DIG)', 'Additional Inspector General (Addl. IG)', 'Inspector General (IG)'],
  'Army': ['Sepoy', 'Lance Naik', 'Naik', 'Havildar', 'Naib Subedar', 'Subedar', 'Subedar Major', 'Second Lieutenant', 'Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 'Colonel', 'Brigadier General', 'Major General', 'Lieutenant General', 'General'],
  'Navy': ['Seaman', 'Leading Seaman', 'Petty Officer', 'Chief Petty Officer', 'Master Chief Petty Officer', 'Sub-Lieutenant', 'Lieutenant', 'Lieutenant Commander', 'Commander', 'Captain', 'Commodore', 'Rear Admiral', 'Vice Admiral', 'Admiral'],
  'Air Force': ['Aircraftman', 'Leading Aircraftman', 'Corporal', 'Sergeant', 'Flight Sergeant', 'Warrant Officer', 'Pilot Officer', 'Flying Officer', 'Flight Lieutenant', 'Squadron Leader', 'Wing Commander', 'Group Captain', 'Air Commodore', 'Air Vice Marshal', 'Air Marshal', 'Air Chief Marshal'],
  'Ansar': ['Ansar Member', 'Naik', 'Sergeant', 'Platoon Commander', 'Company Commander', 'Battalion Commander', 'Deputy Director', 'Director'],
  'BGB (Border Guard Bangladesh)': ['Sepoy', 'Naik', 'Havildar', 'Naib Subedar', 'Subedar', 'Subedar Major', 'Second Lieutenant', 'Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 'Colonel', 'Brigadier General', 'Major General', 'Lieutenant General', 'Director General']
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceId: '',
    postedStation: '',
    district: '',
    rank: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });
  const [showCustomThana, setShowCustomThana] = useState(false);
  const [customThana, setCustomThana] = useState('');

  // Get available thanas based on selected district
  const availableThanas = useMemo(() => {
    return formData.district ? districtThanaMap[formData.district] || [] : [];
  }, [formData.district]);

  // Get all ranks from all forces
  const allRanks = useMemo(() => {
    const ranks: string[] = [];
    Object.entries(lawEnforcementRanks).forEach(([force, rankList]) => {
      rankList.forEach(rank => {
        ranks.push(`${force} - ${rank}`);
      });
    });
    return ranks;
  }, []);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    
    // Check if email contains @
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }
    
    // Additional checks for common mistakes
    if (email.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }
    
    if (email.startsWith('.') || email.includes('@.')) {
      return 'Email cannot start with a dot or have dot immediately after @';
    }
    
    if (email.startsWith('@')) {
      return 'Email must have username before @ symbol';
    }
    
    const [username, domain] = email.split('@');
    
    if (!username || username.length < 1) {
      return 'Email must have username before @ symbol';
    }
    
    if (!domain || domain.length < 3) {
      return 'Please enter a valid email domain (e.g., gmail.com)';
    }
    
    if (!/^[a-zA-Z0-9]/.test(username)) {
      return 'Email must start with a letter or number';
    }
    
    // Check if domain has a dot
    if (!domain.includes('.')) {
      return 'Email domain must contain a dot (e.g., gmail.com)';
    }
    
    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., user123@gmail.com)';
    }
    
    // Check domain extension length (at least 2 characters after last dot)
    const domainParts = domain.split('.');
    const extension = domainParts[domainParts.length - 1];
    
    if (extension.length < 2) {
      return 'Email domain extension must be at least 2 characters (e.g., .com, .bd)';
    }
    
    return '';
  };

  const validatePhone = (phone: string) => {
    // Remove any non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      return 'Phone number is required';
    }
    
    if (cleanPhone.length !== 11) {
      return 'Phone number must be exactly 11 digits';
    }
    
    // Bangladesh mobile operator prefixes
    const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
    const prefix = cleanPhone.substring(0, 3);
    
    if (!validPrefixes.includes(prefix)) {
      return 'Please enter a valid Bangladesh mobile number (013, 014, 015, 016, 017, 018, or 019)';
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If district changes, reset posted station and custom thana
      if (name === 'district') {
        newData.postedStation = '';
        setShowCustomThana(false);
        setCustomThana('');
      }
      
      // If posted station is "Other", show custom input
      if (name === 'postedStation') {
        if (value === 'Other') {
          setShowCustomThana(true);
          newData.postedStation = '';
        } else {
          setShowCustomThana(false);
          setCustomThana('');
        }
      }
      
      return newData;
    });

    // Real-time validation
    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    }
    
    if (name === 'phone') {
      const phoneError = validatePhone(value);
      setErrors(prev => ({ ...prev, phone: phoneError }));
    }
  };

  const handleCustomThanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomThana(value);
    setFormData(prev => ({ ...prev, postedStation: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        setSelectedFile(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        alert('File size must be less than 5MB');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDownloadFile = () => {
    if (selectedFile && previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = selectedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      alert('Please fix the errors before submitting');
      return;
    }
    
    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors(prev => ({ ...prev, phone: phoneError }));
      alert('Please fix the errors before submitting');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!selectedFile) {
      alert('Please upload your service identity card');
      return;
    }

    // Handle form submission and redirect to success page
    router.push('/register/success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-white hover:text-red-100 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Header Section */}
      <div className="pt-16 pb-8 text-center">
        <div className="w-24 h-24 bg-red-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
          <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Law Enforcement Registration</h1>
        <p className="text-red-100 text-lg">Apply for incident response access</p>
      </div>

      {/* Registration Form */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Information Section */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6 pb-3 border-b-2 border-red-200">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-red-500'
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                      <span className="text-red-600 font-bold">⚠</span>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-red-500'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                      <span className="text-red-600 font-bold">⚠</span>
                      {errors.phone}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Valid operators: 013, 014, 015, 016, 017, 018, 019
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Service Identity Card <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    placeholder="Enter your service ID"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Service Information Section */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6 pb-3 border-b-2 border-red-200 flex items-center">
                <span className="w-6 h-6 rounded-full border-2 border-red-700 inline-flex items-center justify-center mr-2 text-sm"></span>
                Service Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    District <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select District</option>
                    {Object.keys(districtThanaMap).sort().map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Posted Station (Thana) <span className="text-red-600">*</span>
                  </label>
                  {!showCustomThana ? (
                    <>
                      <select
                        name="postedStation"
                        value={formData.postedStation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                        disabled={!formData.district}
                      >
                        <option value="">
                          {formData.district ? 'Select Thana' : 'Select District First'}
                        </option>
                        {availableThanas.map((thana) => (
                          <option key={thana} value={thana}>
                            {thana}
                          </option>
                        ))}
                        {formData.district && (
                          <option value="Other" className="font-semibold text-blue-600">
                            ✏️ Other (Type Manually)
                          </option>
                        )}
                      </select>
                      {!formData.district && (
                        <p className="mt-1 text-xs text-gray-500">
                          Please select a district first
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customThana}
                        onChange={handleCustomThanaChange}
                        placeholder="Enter your thana name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomThana(false);
                          setCustomThana('');
                          setFormData(prev => ({ ...prev, postedStation: '' }));
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Back to dropdown
                      </button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Rank <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="rank"
                    value={formData.rank}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Your Rank</option>
                    {Object.entries(lawEnforcementRanks).map(([force, ranks]) => (
                      <optgroup key={force} label={force}>
                        {ranks.map((rank) => (
                          <option key={`${force}-${rank}`} value={`${force} - ${rank}`}>
                            {rank}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Account Credentials Section */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6 pb-3 border-b-2 border-red-200">
                Account Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-6 pb-3 border-b-2 border-red-200">
                Document Upload
              </h2>
              
              {!selectedFile ? (
                <div className="border-2 border-red-300 rounded-2xl p-8 text-center bg-red-50">
                  <div className="mb-4">
                    <Upload className="w-12 h-12 text-red-600 mx-auto mb-4" strokeWidth={2} />
                    <p className="text-gray-700 font-semibold mb-2">
                      Upload Service Identity Card <span className="text-red-600">*</span>
                    </p>
                    <p className="text-gray-500 text-sm mb-4">PDF, JPG, or PNG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="fileUpload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="fileUpload"
                    className="inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="border-2 border-green-300 rounded-2xl p-6 bg-green-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold">File Uploaded Successfully</p>
                        <p className="text-gray-600 text-sm">{selectedFile.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Preview Section */}
                  <div className="mt-4 border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Document Preview</p>
                    </div>
                    <div className="p-4">
                      {previewUrl && selectedFile.type.startsWith('image/') ? (
                        <img 
                          src={previewUrl} 
                          alt="Document preview" 
                          className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md"
                        />
                      ) : selectedFile.type === 'application/pdf' ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-700 font-medium">PDF Document</p>
                          <p className="text-gray-500 text-sm mt-1">{selectedFile.name}</p>
                          <p className="text-gray-400 text-xs mt-2">Preview not available for PDF files</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      className="inline-flex items-center justify-center bg-green-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </button>
                    <input
                      type="file"
                      id="fileUploadReplace"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUploadReplace"
                      className="inline-flex items-center justify-center bg-white border-2 border-red-600 text-red-600 font-semibold py-2 px-6 rounded-xl hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                    >
                      Change File
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit and Login Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Link
                href="/login?role=police"
                className="text-center border-2 border-gray-300 text-gray-600 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Already have an account?
              </Link>
              <button
                type="submit"
                className="bg-red-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
