'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, UserPlus, Eye, EyeOff, FileText, Download } from 'lucide-react';
import { ValidationUtils } from '@/lib/validation';
import { useNotification } from '@/lib/useNotification';
import NotificationBanner from '@/components/NotificationBanner';

// Bangladesh Divisions and Districts
const divisionDistrictMap: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  'Chittagong': ['Chittagong', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Comilla', 'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  'Rajshahi': ['Rajshahi', 'Bogra', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Sirajganj'],
  'Khulna': ['Khulna', 'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  'Barisal': ['Barisal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  'Sylhet': ['Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj'],
  'Rangpur': ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
  'Mymensingh': ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
};

// District-wise Police Stations/Thanas
const districtThanaMap: Record<string, string[]> = {
  'Dhaka': ['Adabor', 'Badda', 'Banani', 'Bangshal', 'Biman Bandar', 'Cantonment', 'Chak Bazar', 'Darus Salam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan', 'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur Model', 'Mohammadpur', 'Motijheel', 'Mugda', 'New Market', 'Pallabi', 'Paltan', 'Ramna', 'Rampura', 'Sabujbagh', 'Savar', 'Shah Ali', 'Shahbagh', 'Shahjahanpur', 'Sher-E-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon', 'Tejgaon Industrial', 'Turag', 'Uttara East', 'Uttara West', 'Vatara', 'Wari'],
  'Faridpur': ['Faridpur Sadar', 'Alfadanga', 'Boalmari', 'Char Bhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'],
  'Gazipur': ['Gazipur Sadar', 'Bhawal', 'Joydebpur', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Monnunagar', 'Sreepur', 'Tongi East', 'Tongi West'],
  // ... (continuing with all the district/thana mappings from original)
  'Sherpur': ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'],
};

export default function OfficerRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nid: '',
    pollingCenterName: '',
    pollingCenterId: '',
    division: '',
    district: '',
    thana: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { notification, showError, showSuccess, clearNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Get available districts based on selected division
  const availableDistricts = formData.division ? divisionDistrictMap[formData.division] || [] : [];
  
  // Get available thanas based on selected district
  const availableThanas = formData.district ? districtThanaMap[formData.district] || [] : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear notification when user starts making changes
    if (notification) {
      clearNotification();
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset dependent fields when parent changes
      if (name === 'division') {
        return { ...newData, district: '', thana: '' };
      }
      if (name === 'district') {
        return { ...newData, thana: '' };
      }
      
      return newData;
    });
    
    // Clear related errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear any previous notifications
      clearNotification();
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showError('Only PDF, JPG, or PNG files are allowed');
        return;
      }
      
      // Create preview URL for images and PDFs
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
      
      setSelectedFile(file);
      showSuccess(`File "${file.name}" uploaded successfully!`);
    }
  };

  const removeFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setSelectedFile(null);
    clearNotification();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s.]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters, spaces, and dots';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = ValidationUtils.validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Invalid email format';
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneValidation = ValidationUtils.validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || 'Invalid phone number';
      }
    }

    // NID validation
    if (!formData.nid.trim()) {
      newErrors.nid = 'NID is required';
    } else {
      const nidValidation = ValidationUtils.validateNID(formData.nid);
      if (!nidValidation.isValid) {
        newErrors.nid = nidValidation.error || 'Invalid NID';
      }
    }
    
    if (!formData.pollingCenterName.trim()) newErrors.pollingCenterName = 'Polling center name is required';
    if (!formData.pollingCenterId.trim()) newErrors.pollingCenterId = 'Polling center ID is required';
    if (!formData.division) newErrors.division = 'Division is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.thana) newErrors.thana = 'Police station/Thana is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = ValidationUtils.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error || 'Invalid password';
      }
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!selectedFile) newErrors.file = 'NID copy is required';
    
    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      showError('Please fix the errors below and try again.');
    }
    
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous notifications
    clearNotification();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      // Convert file to base64
      let nidDocumentBase64 = '';
      if (selectedFile) {
        try {
          const reader = new FileReader();
          nidDocumentBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }
      
      // Register via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: formData.fullName,
          phone: formData.phone,
          nid: formData.nid,
          role: 'Officer',
          pollingCenterName: formData.pollingCenterName,
          pollingCenterId: formData.pollingCenterId,
          location: `${formData.district} - ${formData.thana}`,
          thana: formData.thana,
          nidDocument: nidDocumentBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration failed:', response.status, data);
        
        if (data.error) {
          if (data.error.includes('Username or email already exists') || data.error.includes('already registered')) {
            setErrors(prev => ({ 
              ...prev, 
              username: data.error
            }));
          } else if (data.error.includes('email')) {
            setErrors(prev => ({ 
              ...prev, 
              email: data.error
            }));
          } else if (data.error.includes('phone') || data.error.includes('Phone')) {
            setErrors(prev => ({ 
              ...prev, 
              phone: data.error
            }));
          } else if (data.error.includes('NID')) {
            setErrors(prev => ({ 
              ...prev, 
              nid: data.error
            }));
          } else {
            showError(`Registration failed: ${data.error}`);
          }
        } else {
          showError('Registration failed. Please check your information and try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Log user registration
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: formData.username,
          action: 'USER_CREATED',
          details: `New Presiding Officer registered: ${formData.fullName} (${formData.username}) for polling center ${formData.pollingCenterName} (${formData.pollingCenterId})`,
          ip: 'System',
        }),
      });

      setIsSubmitting(false);
      showSuccess('Registration successful! Redirecting to confirmation page...');
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push('/register/officer/success');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        showError('Network error: Unable to connect to server. Please check your internet connection and try again.');
      } else if (error instanceof SyntaxError) {
        showError('Server response error: Please try again.');
      } else {
        showError('An unexpected error occurred during registration. Please try again.');
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-400 text-slate-900 transition-all duration-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {/* Back to Home Link */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Notification Banner */}
      <NotificationBanner notification={notification} onDismiss={clearNotification} />

      {/* Header */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image src="/images/logo-AmarVote.png" alt="AmarVote" width={64} height={64} className="rounded-2xl shadow-md" />
          <div className="text-left">
            <p className="text-xl font-semibold text-slate-900">AmarVote</p>
            <p className="text-sm text-slate-600">Secure Election Monitoring</p>
          </div>
        </div>
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Presiding Officer Registration</h1>
        <p className="text-slate-600">Apply for polling center access</p>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl shadow-xl p-8 space-y-6 border border-blue-200">
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border ${errors.fullName ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="01712345678 or +8801712345678"
                  className={`w-full px-4 py-3 border ${errors.phone ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  National ID (NID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  placeholder="10 digit NID"
                  className={`w-full px-4 py-3 border ${errors.nid ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.nid && <p className="text-red-500 text-xs mt-1">{errors.nid}</p>}
              </div>
            </div>
          </div>

          {/* Polling Center Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Polling Center Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${errors.division ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900`}
                >
                  <option value="">Select division</option>
                  {Object.keys(divisionDistrictMap).map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
                {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!formData.division}
                  className={`w-full px-4 py-3 border ${errors.district ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 disabled:bg-gray-50`}
                >
                  <option value="">Select district</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Police Station / Thana <span className="text-red-500">*</span>
                </label>
                <select
                  name="thana"
                  value={formData.thana}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 border ${errors.thana ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 disabled:bg-gray-50`}
                >
                  <option value="">Select police station</option>
                  {availableThanas.map(thana => (
                    <option key={thana} value={thana}>{thana}</option>
                  ))}
                </select>
                {errors.thana && <p className="text-red-500 text-xs mt-1">{errors.thana}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Polling Center Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pollingCenterName"
                  value={formData.pollingCenterName}
                  onChange={handleInputChange}
                  placeholder="Enter polling center name"
                  className={`w-full px-4 py-3 border ${errors.pollingCenterName ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.pollingCenterName && <p className="text-red-500 text-xs mt-1">{errors.pollingCenterName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Polling Center ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pollingCenterId"
                  value={formData.pollingCenterId}
                  onChange={handleInputChange}
                  placeholder="e.g., PC-DHK-001"
                  className={`w-full px-4 py-3 border ${errors.pollingCenterId ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.pollingCenterId && <p className="text-red-500 text-xs mt-1">{errors.pollingCenterId}</p>}
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className={`w-full px-4 py-3 border ${errors.username ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password (6+ chars with combination)"
                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <div className="mt-1 text-xs text-gray-600">
                  Must contain at least 3 of: lowercase, uppercase, number, special character
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 pr-12 border ${errors.confirmPassword ? 'border-blue-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Document Upload</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${errors.file ? 'border-blue-400 bg-blue-50' : 'border-blue-200 bg-blue-50'} rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-100 transition-colors`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                    {selectedFile.name}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-slate-800 font-medium">
                    Upload NID Copy <span className="text-red-500">*</span>
                  </p>
                  <p className="text-slate-600 text-sm mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                  <button
                    type="button"
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            {/* Document Preview */}
            {filePreviewUrl && selectedFile && (
              <div className="mt-4 bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Document Preview</span>
                  <button
                    type="button"
                    onClick={() => window.open(filePreviewUrl, '_blank')}
                    className="ml-auto text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Open Full Size
                  </button>
                </div>
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={filePreviewUrl}
                      alt="NID Document Preview"
                      width={400}
                      height={200}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : selectedFile.type === 'application/pdf' ? (
                  <div className="w-full h-48 border rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">PDF Document</p>
                      <p className="text-gray-500 text-xs">{selectedFile.name}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {errors.file && <p className="text-red-500 text-xs mt-2">{errors.file}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href="/login?role=officer" className="flex-1">
              <button
                type="button"
                className="w-full py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Already have an account?
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}