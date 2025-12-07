"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "./components/dialog";
import { Button } from "@/components/ui/button";
import { Toggle } from "./components/toggle";
import { RadioGroup, RadioItem } from "./components/radio-group";
import {
  Sun,
  Moon,
  Bell,
  Cloud,
  Accessibility,
  Edit,
  ExternalLink,
  Volume2,
  Mail,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [accessibility, setAccessibility] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reduceAnimations, setReduceAnimations] = React.useState(false);
  const [showAccessibilityOptions, setShowAccessibilityOptions] =
    React.useState(false);
  const [showNotificationsOptions, setShowNotificationsOptions] =
    React.useState(false);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNotifications = localStorage.getItem("uxie-notifications");
      const storedAutoSave = localStorage.getItem("uxie-auto-save");
      const storedHighContrast = localStorage.getItem("uxie-high-contrast");
      const storedReduceAnimations = localStorage.getItem(
        "uxie-reduce-animations",
      );

      if (storedNotifications !== null)
        setNotifications(storedNotifications === "true");
      if (storedAutoSave !== null) setAutoSave(storedAutoSave === "true");
      if (storedHighContrast !== null)
        setHighContrast(storedHighContrast === "true");
      if (storedReduceAnimations !== null)
        setReduceAnimations(storedReduceAnimations === "true");

      // Apply settings to document immediately
      const root = document.documentElement;
      if (storedHighContrast === "true") {
        root.classList.add("high-contrast");
      }
      if (storedReduceAnimations === "true") {
        root.classList.add("reduce-motion");
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSetting = (key: string, value: string | boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`uxie-${key}`, String(value));
      // TODO: Sync to server async
    }
  };

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    // Save manual preference
    saveSetting("theme", newTheme);
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    saveSetting("notifications", checked);
    if (!checked) {
      setShowNotificationsOptions(false);
    } else {
      setShowNotificationsOptions(true);
    }
  };

  const handleAutoSaveChange = (checked: boolean) => {
    setAutoSave(checked);
    saveSetting("auto-save", checked);
  };

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    saveSetting("high-contrast", checked);

    // Apply to document immediately
    const root = document.documentElement;
    if (checked) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  };

  const handleReduceAnimationsChange = (checked: boolean) => {
    setReduceAnimations(checked);
    saveSetting("reduce-animations", checked);

    // Apply to document immediately
    const root = document.documentElement;
    if (checked) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  };

  const handleAccessibilityToggle = () => {
    setShowAccessibilityOptions(!showAccessibilityOptions);
  };

  // Mock user data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    status: "online" as "online" | "offline" | "away",
    userId: "@johndoe",
    joinDate: "12 Dec 2024",
    accountType: "Student",
    lastActive: "Just now",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay />
        <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground hover:scrollbar-thumb-primary">
          <DialogHeader>
            <DialogTitle>Pengaturan</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <Separator className="my-4" />

          {/* Profile Section */}
          <div className="mb-6 rounded-[10px] border border-border/50 bg-[#F3F3F3] dark:bg-[#383838] p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-14 w-14 shrink-0 rounded-full border-2 border-primary bg-secondary overflow-hidden transition-all duration-150 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                <Image
                  src="/logo/uxie.png"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {userData.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {userData.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      userData.status === "online"
                        ? "bg-[#6ECDC1]"
                        : userData.status === "away"
                          ? "bg-orange-500"
                          : "bg-muted-foreground",
                    )}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {userData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  User ID
                </p>
                <p className="text-sm text-foreground select-all">
                  {userData.userId}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Join Date
                </p>
                <p className="text-sm text-foreground">{userData.joinDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Account Type
                </p>
                <p className="text-sm text-foreground">
                  {userData.accountType}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Last Active
                </p>
                <p className="text-sm text-foreground">{userData.lastActive}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" className="h-9">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
              <Button variant="ghost" size="sm" className="h-9">
                <ExternalLink className="h-4 w-4 mr-2" />
                Lihat Profil Lengkap
              </Button>
            </div>
          </div>

          {/* General Section */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              Umum
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Pengaturan umum aplikasi
            </p>

            <div className="space-y-3">
              {/* Dark Mode */}
              <div className="flex items-center justify-between min-h-[44px] px-4 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary shrink-0" />
                  )}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      Tema
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      Mengikuti pengaturan sistem perangkat Anda
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeChange}
                />
              </div>

              {/* Notifications */}
              <div>
                <div className="flex items-center justify-between min-h-[44px] px-4 py-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Bell className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        Notifikasi
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        Terima notifikasi dari aplikasi
                      </span>
                    </div>
                  </div>
                  <Toggle
                    checked={notifications}
                    onCheckedChange={(checked) => {
                      handleNotificationsChange(checked);
                      if (checked) {
                        setShowNotificationsOptions(true);
                      }
                    }}
                  />
                </div>
                {showNotificationsOptions && notifications && (
                  <div className="mt-3 ml-8 space-y-2">
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-foreground">
                          Notifikasi push di browser
                        </span>
                      </div>
                      <Toggle
                        size="small"
                        checked={pushNotifications}
                        onCheckedChange={(checked) => {
                          setPushNotifications(checked);
                          saveSetting("push-notifications", checked);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-foreground">
                          Kirim ringkasan email
                        </span>
                      </div>
                      <Toggle
                        size="small"
                        checked={emailNotifications}
                        onCheckedChange={(checked) => {
                          setEmailNotifications(checked);
                          saveSetting("email-notifications", checked);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-foreground">
                          Suara notifikasi saat ada pesan
                        </span>
                      </div>
                      <Toggle
                        size="small"
                        checked={sound}
                        onCheckedChange={(checked) => {
                          setSound(checked);
                          saveSetting("sound", checked);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-save */}
              <div className="flex items-center justify-between min-h-[44px] px-4 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Cloud className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      Simpan Otomatis
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      Simpan perubahan secara otomatis
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={autoSave}
                  onCheckedChange={handleAutoSaveChange}
                />
              </div>

              {/* Accessibility */}
              <div>
                <button
                  type="button"
                  onClick={handleAccessibilityToggle}
                  className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Accessibility className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        Aksesibilitas
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        Pengaturan untuk aksesibilitas
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      showAccessibilityOptions && "rotate-90",
                    )}
                  />
                </button>
                {showAccessibilityOptions && (
                  <div className="mt-3 ml-8 space-y-2">
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <span className="text-xs text-foreground">
                        Kontras Tinggi
                      </span>
                      <Toggle
                        size="small"
                        checked={highContrast}
                        onCheckedChange={handleHighContrastChange}
                      />
                    </div>
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <span className="text-xs text-foreground">
                        Kurangi Animasi
                      </span>
                      <Toggle
                        size="small"
                        checked={reduceAnimations}
                        onCheckedChange={handleReduceAnimationsChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
