import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Save,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { ShinyButton } from './magicui/shiny-button';
import { CompletionBanner, useBanners } from './CompletionBanner';

interface UserProfileData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  subscription?: {
    planType: string;
    status: string;
    renewalDate?: string;
  };
}

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      theme: 'light',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'preferences' | 'subscription'
  >('profile');
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    showInfo('Loading Profile', 'Fetching your profile information...');

    try {
      // In a real app, you'd fetch this from your API
      // For now, we'll use mock data
      const mockProfile: UserProfileData = {
        email: user?.email || '',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          theme: 'light',
        },
        subscription: {
          planType: 'Monthly Plan',
          status: 'active',
          renewalDate: '2024-10-20',
        },
      };

      setProfileData(mockProfile);
      showSuccess(
        'Profile Loaded',
        'Your profile information has been loaded.'
      );
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError(
        'Loading Failed',
        'Unable to load your profile. Please refresh the page.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    showInfo('Saving Profile', 'Updating your profile information...');

    try {
      // In a real app, you'd send this to your API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      showSuccess(
        'Profile Saved',
        'Your profile has been updated successfully.'
      );
    } catch (error) {
      console.error('Failed to save profile:', error);
      showError(
        'Save Failed',
        'Unable to save your profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    setProfileData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...((prev[parent as keyof UserProfileData] as object) || {}),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Profile Settings
          </h1>
          <p className='text-gray-600'>
            Manage your account information and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-lg border'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {[
                { id: 'profile', label: 'Profile Information', icon: User },
                { id: 'preferences', label: 'Preferences', icon: Bell },
                { id: 'subscription', label: 'Subscription', icon: CreditCard },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-5 h-5 mr-2' />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className='p-6'>
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Personal Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      First Name
                    </label>
                    <input
                      type='text'
                      value={profileData.firstName}
                      onChange={e =>
                        updateProfileField('firstName', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Last Name
                    </label>
                    <input
                      type='text'
                      value={profileData.lastName}
                      onChange={e =>
                        updateProfileField('lastName', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      value={profileData.email}
                      disabled
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <input
                      type='tel'
                      value={profileData.phone}
                      onChange={e =>
                        updateProfileField('phone', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-md font-medium text-gray-900'>Address</h4>

                  <div className='grid grid-cols-1 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Street Address
                      </label>
                      <input
                        type='text'
                        value={profileData.address?.street}
                        onChange={e =>
                          updateProfileField('address.street', e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          City
                        </label>
                        <input
                          type='text'
                          value={profileData.address?.city}
                          onChange={e =>
                            updateProfileField('address.city', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          State
                        </label>
                        <input
                          type='text'
                          value={profileData.address?.state}
                          onChange={e =>
                            updateProfileField('address.state', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          ZIP Code
                        </label>
                        <input
                          type='text'
                          value={profileData.address?.zipCode}
                          onChange={e =>
                            updateProfileField(
                              'address.zipCode',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Notification Preferences
                </h3>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Email Notifications
                      </h4>
                      <p className='text-sm text-gray-500'>
                        Receive updates about your letters and account
                      </p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={profileData.preferences.emailNotifications}
                        onChange={e =>
                          updateProfileField(
                            'preferences.emailNotifications',
                            e.target.checked
                          )
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        SMS Notifications
                      </h4>
                      <p className='text-sm text-gray-500'>
                        Receive text messages for urgent updates
                      </p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={profileData.preferences.smsNotifications}
                        onChange={e =>
                          updateProfileField(
                            'preferences.smsNotifications',
                            e.target.checked
                          )
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Marketing Emails
                      </h4>
                      <p className='text-sm text-gray-500'>
                        Receive promotional offers and updates
                      </p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={profileData.preferences.marketingEmails}
                        onChange={e =>
                          updateProfileField(
                            'preferences.marketingEmails',
                            e.target.checked
                          )
                        }
                        className='sr-only peer'
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-md font-medium text-gray-900'>
                    Appearance
                  </h4>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Theme
                    </label>
                    <select
                      value={profileData.preferences.theme}
                      onChange={e =>
                        updateProfileField('preferences.theme', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='light'>Light</option>
                      <option value='dark'>Dark</option>
                      <option value='auto'>Auto (System)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Subscription Information
                </h3>

                {profileData.subscription ? (
                  <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h4 className='text-lg font-medium text-green-900'>
                        Active Subscription
                      </h4>
                      <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>
                        {profileData.subscription.status.toUpperCase()}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-green-700'>
                          Plan
                        </label>
                        <p className='text-lg font-semibold text-green-900'>
                          {profileData.subscription.planType}
                        </p>
                      </div>

                      {profileData.subscription.renewalDate && (
                        <div>
                          <label className='block text-sm font-medium text-green-700'>
                            Next Billing Date
                          </label>
                          <p className='text-lg font-semibold text-green-900'>
                            {new Date(
                              profileData.subscription.renewalDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='mt-6 flex space-x-4'>
                      <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                        Upgrade Plan
                      </button>
                      <button className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
                    <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                    <h4 className='text-lg font-medium text-gray-900 mb-2'>
                      No Active Subscription
                    </h4>
                    <p className='text-gray-600 mb-4'>
                      Subscribe to a plan to start generating legal letters
                    </p>
                    <button className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      Choose a Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className='flex justify-end pt-6 border-t border-gray-200 mt-8'>
              <ShinyButton
                onClick={handleSaveProfile}
                disabled={isSaving}
                className='px-8 py-2'
              >
                <Save className='w-4 h-4 mr-2' />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </ShinyButton>
            </div>
          </div>
        </div>
      </div>

      {/* Render banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};
