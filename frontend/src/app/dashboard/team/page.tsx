"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, teamAPI, type TeamMember, type CreateTeamMemberAccount, type TeamMemberCredentials } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";
import { RavenIcon } from "@/components/shared/RavenIcon";
import { Avatar } from "@/components/shared/Avatar";

export default function TeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("id");
  const { t, lang } = useLanguage();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [userId, setUserId] = useState("");

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);

  // Avatar change
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Create account
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
  const [createAccountData, setCreateAccountData] = useState({
    email: "",
    full_name: "",
    phone: "",
    job_title: "",
    role: "member" as "admin" | "member",
  });
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Credentials modal
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const translations = {
    en: {
      title: "Team Members",
      invite: "Invite Member",
      email: "Email Address",
      role: "Role",
      owner: "Owner",
      admin: "Admin",
      member: "Member",
      status: "Status",
      pending: "Pending",
      active: "Active",
      actions: "Actions",
      remove: "Remove",
      cancel: "Cancel",
      send: "Send Invite",
      noMembers: "No team members yet",
      noMembersDesc: "Invite team members to help manage your business chatbot.",
      confirmRemove: "Are you sure you want to remove this team member?",
      inviteSuccess: "Invite sent successfully",
      removeSuccess: "Team member removed",
      changeAvatar: "Change Avatar",
      avatarUrl: "Avatar URL",
      avatarPlaceholder: "https://example.com/avatar.jpg",
      updateAvatar: "Update",
      avatarSuccess: "Avatar updated",
      createAccount: "Create Account",
      createAccountTitle: "Create Team Member Account",
      fullName: "Full Name",
      fullNamePlaceholder: "John Doe",
      phoneNumber: "Phone Number",
      phonePlaceholder: "+237 6 XX XX XX XX",
      jobTitle: "Job Title",
      jobTitlePlaceholder: "Customer Support Agent",
      createButton: "Create Account",
      credentialsTitle: "Account Created Successfully",
      credentialsWarning: "Save these credentials - they will not be shown again.",
      credentialsCopy: "Copy to Clipboard",
      credentialsCopied: "Copied!",
      credentialsClose: "I've Saved the Credentials",
      name: "Name",
      createAccountInfo: "A secure password will be automatically generated. You'll receive the credentials once to share with the team member.",
    },
    fr: {
      title: "Membres de l'équipe",
      invite: "Inviter un membre",
      email: "Adresse e-mail",
      role: "Rôle",
      owner: "Propriétaire",
      admin: "Administrateur",
      member: "Membre",
      status: "Statut",
      pending: "En attente",
      active: "Actif",
      actions: "Actions",
      remove: "Supprimer",
      cancel: "Annuler",
      send: "Envoyer l'invitation",
      noMembers: "Aucun membre pour l'instant",
      noMembersDesc: "Invitez des membres pour vous aider à gérer votre chatbot.",
      confirmRemove: "Voulez-vous vraiment supprimer ce membre ?",
      inviteSuccess: "Invitation envoyée",
      removeSuccess: "Membre supprimé",
      changeAvatar: "Changer l'avatar",
      avatarUrl: "URL de l'avatar",
      avatarPlaceholder: "https://exemple.com/avatar.jpg",
      updateAvatar: "Mettre à jour",
      avatarSuccess: "Avatar mis à jour",
      createAccount: "Créer un compte",
      createAccountTitle: "Créer un compte de membre d'équipe",
      fullName: "Nom complet",
      fullNamePlaceholder: "Jean Dupont",
      phoneNumber: "Numéro de téléphone",
      phonePlaceholder: "+237 6 XX XX XX XX",
      jobTitle: "Fonction",
      jobTitlePlaceholder: "Agent de support client",
      createButton: "Créer le compte",
      credentialsTitle: "Compte créé avec succès",
      credentialsWarning: "Enregistrez ces informations - elles ne seront plus affichées.",
      credentialsCopy: "Copier dans le presse-papiers",
      credentialsCopied: "Copié !",
      credentialsClose: "J'ai enregistré les informations",
      name: "Nom",
      createAccountInfo: "Un mot de passe sécurisé sera automatiquement généré. Vous recevrez les identifiants une seule fois pour les partager avec le membre de l'équipe.",
    },
  };

  const text = translations[lang] || translations.en;

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      if (!businessId) {
        router.push("/dashboard");
        return;
      }

      setUserId(session.user.id);

      try {
        const business = await businessAPI.get(businessId, session.user.id);
        setBusinessName(business.name);
        const data = await teamAPI.list(businessId, session.user.id);
        setMembers(data.members || []);
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, businessId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !businessId) return;

    setInviting(true);
    try {
      await teamAPI.invite(businessId, { email: inviteEmail, role: inviteRole }, userId);
      const data = await teamAPI.list(businessId, userId);
      setMembers(data.members || []);
      setShowInviteForm(false);
      setInviteEmail("");
      setInviteRole("member");
      alert(text.inviteSuccess);
    } catch (err) {
      console.error("Failed to invite:", err);
      alert(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm(text.confirmRemove)) return;
    if (!businessId) return;

    try {
      await teamAPI.remove(businessId, memberId, userId);
      setMembers(members.filter(m => m.id !== memberId));
      alert(text.removeSuccess);
    } catch (err) {
      console.error("Failed to remove:", err);
      alert(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleUpdateAvatar = async (memberId: string) => {
    if (!businessId) return;

    setUpdatingAvatar(true);
    try {
      await teamAPI.update(businessId, memberId, { avatar_url: newAvatarUrl }, userId);
      const data = await teamAPI.list(businessId, userId);
      setMembers(data.members || []);
      setEditingAvatarId(null);
      setNewAvatarUrl("");
      alert(text.avatarSuccess);
    } catch (err) {
      console.error("Failed to update avatar:", err);
      alert(err instanceof Error ? err.message : "Failed to update avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAccountData.email || !createAccountData.full_name || !businessId) return;

    setCreatingAccount(true);
    try {
      const response = await teamAPI.createAccount(businessId, createAccountData, userId);

      // Refresh member list
      const data = await teamAPI.list(businessId, userId);
      setMembers(data.members || []);

      // Show credentials modal
      setCredentials({ email: response.email, password: response.password });
      setShowCredentials(true);

      // Reset form and close
      setShowCreateAccountForm(false);
      setCreateAccountData({
        email: "",
        full_name: "",
        phone: "",
        job_title: "",
        role: "member",
      });
    } catch (err) {
      console.error("Failed to create account:", err);
      alert(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!credentials) return;

    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      // Show brief feedback
      const btn = document.getElementById("copy-btn");
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = translations[lang].credentialsCopied;
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <RavenIcon size={40} className="text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Raven</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {text.title} - {businessName}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteForm(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {text.invite}
            </button>
            <button
              onClick={() => setShowCreateAccountForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {text.createAccount}
            </button>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{text.invite}</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.email}
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.role}
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                    className="input"
                  >
                    <option value="admin">{text.admin}</option>
                    <option value="member">{text.member}</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="btn-secondary flex-1"
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="btn-primary flex-1"
                  >
                    {inviting ? "..." : text.send}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Account Modal */}
        {showCreateAccountForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{text.createAccountTitle}</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createAccountData.full_name}
                    onChange={(e) => setCreateAccountData({ ...createAccountData, full_name: e.target.value })}
                    className="input"
                    placeholder={text.fullNamePlaceholder}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={createAccountData.email}
                    onChange={(e) => setCreateAccountData({ ...createAccountData, email: e.target.value })}
                    className="input"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    value={createAccountData.phone}
                    onChange={(e) => setCreateAccountData({ ...createAccountData, phone: e.target.value })}
                    className="input"
                    placeholder={text.phonePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.jobTitle}
                  </label>
                  <input
                    type="text"
                    value={createAccountData.job_title}
                    onChange={(e) => setCreateAccountData({ ...createAccountData, job_title: e.target.value })}
                    className="input"
                    placeholder={text.jobTitlePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {text.role}
                  </label>
                  <select
                    value={createAccountData.role}
                    onChange={(e) => setCreateAccountData({ ...createAccountData, role: e.target.value as "admin" | "member" })}
                    className="input"
                  >
                    <option value="admin">{text.admin}</option>
                    <option value="member">{text.member}</option>
                  </select>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">{text.createAccountInfo}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAccountForm(false);
                      setCreateAccountData({
                        email: "",
                        full_name: "",
                        phone: "",
                        job_title: "",
                        role: "member",
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAccount}
                    className="btn-primary flex-1"
                  >
                    {creatingAccount ? "..." : text.createButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentials && credentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{text.credentialsTitle}</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-yellow-800 font-medium">{text.credentialsWarning}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{text.email}</label>
                  <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-sm">
                    {credentials.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                  <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-sm break-all">
                    {credentials.password}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  id="copy-btn"
                  onClick={handleCopyCredentials}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {text.credentialsCopy}
                </button>
                <button
                  onClick={() => {
                    setShowCredentials(false);
                    setCredentials(null);
                  }}
                  className="btn-primary"
                >
                  {text.credentialsClose}
                </button>
              </div>
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{text.noMembers}</h2>
            <p className="text-gray-600 mb-6">{text.noMembersDesc}</p>
            <button onClick={() => setShowInviteForm(true)} className="btn-primary">
              {text.invite}
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {text.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {text.role}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {text.status}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {text.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar_url}
                          name={member.full_name || member.email}
                          size={40}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {member.full_name || member.email}
                          </div>
                          {member.full_name && (
                            <div className="text-xs text-gray-500">{member.email}</div>
                          )}
                          {member.job_title && (
                            <div className="text-xs text-gray-500 italic">{member.job_title}</div>
                          )}
                          {editingAvatarId === member.id ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="url"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                                placeholder={text.avatarPlaceholder}
                                className="text-xs px-2 py-1 border rounded w-64"
                              />
                              <button
                                onClick={() => handleUpdateAvatar(member.id)}
                                disabled={updatingAvatar}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {updatingAvatar ? "..." : text.updateAvatar}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAvatarId(null);
                                  setNewAvatarUrl("");
                                }}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                {text.cancel}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingAvatarId(member.id);
                                setNewAvatarUrl(member.avatar_url || "");
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              {text.changeAvatar}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(member.role)}`}>
                        {text[member.role as keyof typeof text] || member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(member.status)}`}>
                        {text[member.status as keyof typeof text] || member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          {text.remove}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
