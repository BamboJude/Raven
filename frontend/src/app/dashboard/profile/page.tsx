"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { teamAPI, businessAPI, type TeamMember } from "@/lib/api";
import { Avatar } from "@/components/shared/Avatar";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";
import { ChatToggle } from "@/components/ChatToggle";

const translations = {
  en: {
    pageTitle: "Profile Settings",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    jobTitle: "Job Title",
    avatar: "Profile Picture URL",
    saveChanges: "Save Changes",
    saving: "Saving...",

    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordRequirements: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    incorrectPassword: "Current password is incorrect",
    passwordChanged: "Password changed successfully!",
    changePasswordBtn: "Change Password",
    changing: "Changing...",

    accountInfo: "Account Information",
    role: "Role",
    status: "Status",
    business: "Business",
    memberSince: "Member Since",

    profileUpdated: "Profile updated successfully!",
    updateFailed: "Failed to update profile",
    backToDashboard: "← Back to Dashboard",
    logout: "Logout",

    // Roles
    roleOwner: "Owner",
    roleAdmin: "Admin",
    roleMember: "Member",

    // Status
    statusActive: "Active",
    statusPending: "Pending",
  },
  fr: {
    pageTitle: "Paramètres du profil",
    personalInfo: "Informations personnelles",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    jobTitle: "Fonction",
    avatar: "URL de la photo de profil",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement...",

    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le nouveau mot de passe",
    passwordRequirements: "Le mot de passe doit contenir au moins 6 caractères",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    incorrectPassword: "Le mot de passe actuel est incorrect",
    passwordChanged: "Mot de passe modifié avec succès !",
    changePasswordBtn: "Changer le mot de passe",
    changing: "Changement...",

    accountInfo: "Informations du compte",
    role: "Rôle",
    status: "Statut",
    business: "Entreprise",
    memberSince: "Membre depuis",

    profileUpdated: "Profil mis à jour avec succès !",
    updateFailed: "Échec de la mise à jour du profil",
    backToDashboard: "← Retour au tableau de bord",
    logout: "Déconnexion",

    // Roles
    roleOwner: "Propriétaire",
    roleAdmin: "Administrateur",
    roleMember: "Membre",

    // Status
    statusActive: "Actif",
    statusPending: "En attente",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [member, setMember] = useState<TeamMember | null>(null);
  const [businessName, setBusinessName] = useState("");

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    job_title: "",
    avatar_url: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push("/");
        return;
      }

      const token = session.user.id;
      setUserId(token);

      // Fetch team member profile
      const { member: memberData } = await teamAPI.getCurrentMember(token);
      setMember(memberData);

      // Populate profile form
      setProfileData({
        full_name: memberData.full_name || "",
        phone: memberData.phone || "",
        job_title: memberData.job_title || "",
        avatar_url: memberData.avatar_url || "",
      });

      // Fetch business name
      if (memberData.business_id) {
        try {
          const business = await businessAPI.get(memberData.business_id, token);
          setBusinessName(business.name);
        } catch (err) {
          console.error("Failed to fetch business:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      alert("Failed to load profile. You may not be associated with any business.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) return;

    setUpdatingProfile(true);
    setProfileMessage("");

    try {
      await teamAPI.update(
        member.business_id,
        member.id,
        {
          full_name: profileData.full_name || undefined,
          phone: profileData.phone || undefined,
          job_title: profileData.job_title || undefined,
          avatar_url: profileData.avatar_url || undefined,
        },
        userId
      );

      setProfileMessage(t.profileUpdated);

      // Reload profile to get updated data
      await loadProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileMessage(t.updateFailed);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordMessage("");

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage(t.passwordMismatch);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage(t.passwordRequirements);
      return;
    }

    setChangingPassword(true);

    try {
      // Step 1: Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: member?.email || "",
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setPasswordMessage(t.incorrectPassword);
        return;
      }

      // Step 2: Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        setPasswordMessage(`Failed to update password: ${updateError.message}`);
        return;
      }

      // Success
      setPasswordMessage(t.passwordChanged);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordMessage("An error occurred while changing your password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return t.roleOwner;
      case "admin":
        return t.roleAdmin;
      case "member":
        return t.roleMember;
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t.statusActive;
      case "pending":
        return t.statusPending;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RavenIcon className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-800">Raven</h1>
            </div>
            <div className="flex items-center gap-4">
              <ChatToggle />
              <LanguageToggle />
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          {t.backToDashboard}
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t.pageTitle}</h1>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.personalInfo}</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Avatar display */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                src={profileData.avatar_url}
                name={member?.full_name || member?.email || "User"}
                size={80}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.avatar}
                </label>
                <input
                  type="text"
                  value={profileData.avatar_url}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar_url: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="border rounded px-3 py-2 text-sm w-96"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="John Doe"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={member?.email || ""}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.phone}
              </label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="+237 6XX XX XX XX"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.jobTitle}
              </label>
              <input
                type="text"
                value={profileData.job_title}
                onChange={(e) =>
                  setProfileData({ ...profileData, job_title: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Support Agent"
              />
            </div>

            {/* Success/Error message */}
            {profileMessage && (
              <div
                className={`p-3 rounded ${
                  profileMessage === t.profileUpdated
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {profileMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={updatingProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingProfile ? t.saving : t.saveChanges}
            </button>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.changePassword}</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.currentPassword}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.newPassword}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">{t.passwordRequirements}</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
                minLength={6}
              />
            </div>

            {/* Success/Error message */}
            {passwordMessage && (
              <div
                className={`p-3 rounded ${
                  passwordMessage === t.passwordChanged
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? t.changing : t.changePasswordBtn}
            </button>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.accountInfo}</h2>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t.role}</span>
              <span className="font-medium text-gray-800">
                {getRoleLabel(member?.role || "")}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t.status}</span>
              <span
                className={`font-medium ${
                  member?.status === "active" ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {getStatusLabel(member?.status || "")}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">{t.business}</span>
              <span className="font-medium text-gray-800">{businessName || "—"}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">{t.memberSince}</span>
              <span className="font-medium text-gray-800">
                {member?.created_at
                  ? new Date(member.created_at).toLocaleDateString(
                      lang === "fr" ? "fr-FR" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
