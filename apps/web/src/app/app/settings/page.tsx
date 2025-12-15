"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { getUserProfile, updateUserProfile } from "@/lib/api/supabase-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageLoading } from "@/components/ui/loading";
import { User, Mail, Save, Loader2, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setFullName(profile.full_name || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateUserProfile({ full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoading text="Loading settings..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--foreground-secondary)]">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-raised">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar
              size="xl"
              src={user?.user_metadata?.avatar_url}
              alt={fullName || user?.email || "User"}
            />
            <div>
              <p className="font-medium">{fullName || "No name set"}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="size-4" />
              Email Address
            </label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-[var(--foreground-muted)]">
              Email cannot be changed here.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="size-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="border-0 shadow-raised">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Your account is active
              </p>
            </div>
            <Badge variant="green">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-raised border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
