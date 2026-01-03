'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, UserPlus } from 'lucide-react';
import { registerPresidingOfficerUser, getUsers } from '@/data/mockData';

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
  'Dhaka': ['Adabor', 'Badda', 'Banani', 'Bangshal', 'Biman Bandar', 'Cantonment', 'Chak Bazar', 'Darus Salam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan', 'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur Model', 'Mohammadpur', 'Motijheel', 'Mugda', 'New Market', 'Pallabi', 'Paltan', 'Ramna', 'Rampura', 'Sabujbagh', 'Shah Ali', 'Shahbagh', 'Shahjahanpur', 'Sher-E-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon', 'Tejgaon Industrial', 'Turag', 'Uttara East', 'Uttara West', 'Vatara', 'Wari'],
  'Faridpur': ['Faridpur Sadar', 'Alfadanga', 'Boalmari', 'Char Bhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'],
  'Gazipur': ['Gazipur Sadar', 'Bhawal', 'Joydebpur', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Monnunagar', 'Sreepur', 'Tongi East', 'Tongi West'],
  'Gopalganj': ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
  'Kishoreganj': ['Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'],
  'Madaripur': ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'],
  'Manikganj': ['Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia', 'Shibalaya', 'Singair'],
  'Munshiganj': ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Serajdikhan', 'Sreenagar', 'Tongibari'],
  'Narayanganj': ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Fatullah', 'Rupganj', 'Siddhirganj', 'Sonargaon'],
  'Narsingdi': ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'],
  'Rajbari': ['Rajbari Sadar', 'Baliakandi', 'Goalanda', 'Kalukhali', 'Pangsha'],
  'Shariatpur': ['Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zajira'],
  'Tangail': ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur'],
  'Chittagong': ['Akbar Shah', 'Bakalia', 'Bandar', 'Bayazid', 'Chandgaon', 'Chawk Bazar', 'Double Mooring', 'EPZ', 'Halishahar', 'Khulshi', 'Kotwali', 'Kulshi', 'Panchlaish', 'Patenga', 'Sadarghat'],
  'Bandarban': ['Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'],
  'Brahmanbaria': ['Brahmanbaria Sadar', 'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'],
  'Chandpur': ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'],
  'Comilla': ['Comilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas'],
  'Cox\'s Bazar': ['Cox\'s Bazar Sadar', 'Chakaria', 'Eidgaon', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'],
  'Feni': ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Fulgazi', 'Parshuram', 'Sonagazi'],
  'Khagrachhari': ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'],
  'Lakshmipur': ['Lakshmipur Sadar', 'Kamalnagar', 'Raipur', 'Ramganj', 'Ramgati'],
  'Noakhali': ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat', 'Senbagh', 'Sonaimuri', 'Subarnachar'],
  'Rangamati': ['Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'],
  'Rajshahi': ['Rajshahi Sadar', 'Boalia', 'Chandrima', 'Matihar', 'Rajpara', 'Shah Makhdum'],
  'Bogra': ['Bogra Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Sherpur', 'Shibganj', 'Sonatala'],
  'Chapainawabganj': ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'],
  'Joypurhat': ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'],
  'Naogaon': ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadebpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
  'Natore': ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar', 'Singra'],
  'Nawabganj': ['Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'],
  'Pabna': ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'],
  'Sirajganj': ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'],
  'Khulna': ['Khulna Sadar', 'Aranghata', 'Batiaghata', 'Dacope', 'Daulatpur', 'Dighalia', 'Dumuria', 'Khan Jahan Ali', 'Khalishpur', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Sonadanga', 'Terokhada'],
  'Bagerhat': ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
  'Chuadanga': ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
  'Jessore': ['Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'],
  'Jhenaidah': ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
  'Kushtia': ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'],
  'Magura': ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
  'Meherpur': ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
  'Narail': ['Narail Sadar', 'Kalia', 'Lohagara'],
  'Satkhira': ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
  'Barisal': ['Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Kawkhali', 'Mehendiganj', 'Muladi', 'Wazirpur'],
  'Barguna': ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'],
  'Bhola': ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
  'Jhalokati': ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
  'Patuakhali': ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali'],
  'Pirojpur': ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar'],
  'Sylhet': ['Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmaninagar', 'Zakiganj'],
  'Habiganj': ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniachang', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'],
  'Moulvibazar': ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'],
  'Sunamganj': ['Sunamganj Sadar', 'Bishwambarpur', 'Chhatak', 'Derai', 'Dharmapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur'],
  'Rangpur': ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'],
  'Dinajpur': ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Fulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'],
  'Gaibandha': ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'],
  'Kurigram': ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Fulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'],
  'Lalmonirhat': ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'],
  'Nilphamari': ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'],
  'Panchagarh': ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'],
  'Thakurgaon': ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'],
  'Mymensingh': ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal'],
  'Jamalpur': ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'],
  'Netrokona': ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Purbadhala'],
  'Sherpur': ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'],
};

export default function OfficerRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nid: '',
    pollingCenterName: '',
    pollingCenterId: '',
    district: '',
    thana: '',
    division: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get districts based on selected division
  const availableDistricts = formData.division ? divisionDistrictMap[formData.division] || [] : [];
  
  // Get thanas based on selected district
  const availableThanas = formData.district ? districtThanaMap[formData.district] || [] : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear district and thana if division changes
    if (name === 'division') {
      setFormData(prev => ({ ...prev, district: '', thana: '' }));
    }
    
    // Clear thana if district changes
    if (name === 'district') {
      setFormData(prev => ({ ...prev, thana: '' }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, or PNG files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.nid.trim()) newErrors.nid = 'NID is required';
    if (!formData.pollingCenterName.trim()) newErrors.pollingCenterName = 'Polling center name is required';
    if (!formData.pollingCenterId.trim()) newErrors.pollingCenterId = 'Polling center ID is required';
    if (!formData.division) newErrors.division = 'Division is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.thana) newErrors.thana = 'Police station/Thana is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!selectedFile) newErrors.file = 'NID copy is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if username already exists
    const existingUsers = getUsers();
    if (existingUsers.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      setErrors(prev => ({ ...prev, username: 'Username already exists. Please choose a different username.' }));
      return;
    }

    // Check if email already exists
    if (existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setErrors(prev => ({ ...prev, email: 'Email already registered. Please use a different email.' }));
      return;
    }
    
    setIsSubmitting(true);
    
    // Register the user with Pending status
    registerPresidingOfficerUser({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      employeeId: formData.nid,
      pollingStation: formData.pollingCenterName,
      pollingCenterId: formData.pollingCenterId,
      district: formData.district,
      thana: formData.thana,
      designation: 'Presiding Officer',
      username: formData.username,
      password: formData.password
    });

    setIsSubmitting(false);
    router.push('/register/officer/success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* Back to Home Link */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Presiding Officer Registration</h1>
        <p className="text-blue-200">Apply for polling center access</p>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+880 1XXX-XXXXXX"
                  className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID (NID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  placeholder="Enter your NID number"
                  className={`w-full px-4 py-3 border ${errors.nid ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.nid && <p className="text-red-500 text-xs mt-1">{errors.nid}</p>}
              </div>
            </div>
          </div>

          {/* Polling Center Information */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📍</span> Polling Center Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${errors.division ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                >
                  <option value="">Select division</option>
                  {Object.keys(divisionDistrictMap).map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
                {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!formData.division}
                  className={`w-full px-4 py-3 border ${errors.district ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-100`}
                >
                  <option value="">Select district</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Police Station / Thana <span className="text-red-500">*</span>
                </label>
                <select
                  name="thana"
                  value={formData.thana}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 border ${errors.thana ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-100`}
                >
                  <option value="">Select police station</option>
                  {availableThanas.map(thana => (
                    <option key={thana} value={thana}>{thana}</option>
                  ))}
                </select>
                {errors.thana && <p className="text-red-500 text-xs mt-1">{errors.thana}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Polling Center Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pollingCenterName"
                  value={formData.pollingCenterName}
                  onChange={handleInputChange}
                  placeholder="Enter polling center name"
                  className={`w-full px-4 py-3 border ${errors.pollingCenterName ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.pollingCenterName && <p className="text-red-500 text-xs mt-1">{errors.pollingCenterName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Polling Center ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pollingCenterId"
                  value={formData.pollingCenterId}
                  onChange={handleInputChange}
                  placeholder="e.g., PC-DHK-001"
                  className={`w-full px-4 py-3 border ${errors.pollingCenterId ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.pollingCenterId && <p className="text-red-500 text-xs mt-1">{errors.pollingCenterId}</p>}
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className={`w-full px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Document Upload</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${errors.file ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-blue-50'} rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-colors`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
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
                  <p className="text-gray-700 font-medium">
                    Upload NID Copy <span className="text-red-500">*</span>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                  <button
                    type="button"
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
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
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
