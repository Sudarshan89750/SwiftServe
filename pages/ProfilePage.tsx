import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { Camera, Check, CircleAlert, FilePen, Save, X } from 'lucide-react';
// Import react-dropzone with proper React context
import { useDropzone } from 'react-dropzone';
import React from 'react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: '',
    language: 'en',
    notification_preferences: true,
  });
  
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle image upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Define dropzone props outside the hook to avoid null reference issues
  const dropzoneConfig = {
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: '',
      language: 'en',
      notification_preferences: true,
    });
    setAvatar(user?.avatar || null);
  };

  // Save profile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would make an API call to update the user profile
    // For this demo, we'll just show a success message
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      setIsEditing(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="pb-12">
      {/* Header section */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-indigo-100">
            Manage your personal information and account preferences
          </p>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <CircleAlert className="h-5 w-5 mr-2" />
            )}
            {notification.message}
          </div>
        )}
        
        <GlassCard className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing ? (
              <GlassButton 
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <FilePen className="h-4 w-4 mr-2" />
                Edit Profile
              </GlassButton>
            ) : (
              <div className="flex space-x-2">
                <GlassButton 
                  onClick={handleCancel}
                  className="flex items-center text-gray-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </GlassButton>
                <button 
                  type="submit"
                  form="profile-form"
                  className="btn btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
          
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={formData.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-500 text-2xl font-bold">
                          {formData.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div {...getRootProps()} className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 rounded-full text-white flex items-center justify-center cursor-pointer">
                      <input {...getInputProps()} />
                      <Camera className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div 
                    {...getRootProps()} 
                    className={`text-center p-3 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}`}
                  >
                    <input {...getInputProps()} />
                    <Camera className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? 'Drop image here' : 'Click to upload or drag an image'}
                    </p>
                  </div>
                )}
                
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    {user?.role === 'provider' ? 'Provider since ' : 'Member since '}
                    {new Date(user?.joinDate || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Form fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="input"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="input"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Tell us a bit about yourself" : "No bio added yet"}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="input"
                      value={formData.language}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notification_preferences"
                          name="notification_preferences"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={formData.notification_preferences}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notification_preferences" className="font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-gray-500">Receive notifications about bookings, special offers, and service updates.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </GlassCard>
        
        {user?.role === 'provider' && (
          <GlassCard>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Service Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Service Categories</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Update the types of services you offer to customers.
                </p>
                <button className="btn btn-outline text-sm">
                  Manage Service Categories
                </button>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Availability Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Set your working hours and availability for bookings.
                </p>
                <button className="btn btn-outline text-sm">
                  Manage Availability
                </button>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Pricing</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Update your service rates and special pricing options.
                </p>
                <button className="btn btn-outline text-sm">
                  Manage Pricing
                </button>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Service Area</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Define the geographic areas where you provide services.
                </p>
                <button className="btn btn-outline text-sm">
                  Manage Service Area
                </button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
