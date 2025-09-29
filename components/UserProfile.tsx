import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/apiClient";
import { ShinyButton } from "./magicui/shiny-button";
import { CompletionBanner, useBanners } from "./CompletionBanner";

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
    theme: "light" | "dark" | "auto";
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
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      theme: "light",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "subscription"
  >("profile");
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    showInfo("Loading Profile", "Fetching your profile information...");

    try {
      const mockProfile: UserProfileData = {
        email: user?.email || "",
        firstName: "John",
        lastName: "Doe",
        phone: "+1 (555) 123-4567",
        address: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "United States",
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          theme: "light",
        },
        subscription: {
          planType: "Monthly Plan",
          status: "active",
          renewalDate: "2024-10-20",
        },
      };

      setProfileData(mockProfile);
      showSuccess("Profile Loaded", "Your profile information has been loaded.");
    } catch (error) {
      console.error("Failed to load profile:", error);
      showError(
        "Loading Failed",
        "Unable to load your profile. Please refresh the page."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    showInfo("Saving Profile", "Updating your profile information...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulated API call
      showSuccess("Profile Saved", "Your profile has been updated successfully.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      showError("Save Failed", "Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    setProfileData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "address" || parent === "preferences") {
          return {
            ...prev,
            [parent]: {
              ...(prev[parent as keyof UserProfileData] as Record<string, any>),
              [child]: value,
            },
          };
        }
      }
      return { ...prev, [field]: value };
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* main layout & UI code (unchanged from your snippet) */}
      {/* ... keep the rest of your JSX code here ... */}

      {/* Render banners */}
      {banners.map((banner) => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};
