"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { businessAPI, teamAPI, type TeamMember } from "@/lib/api";
import { useLanguage, LanguageToggle } from "@/components/LanguageProvider";

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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
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
          <button
            onClick={() => setShowInviteForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {text.invite}
          </button>
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
                    {text.email}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{member.email}</span>
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
