"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
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
  Minimize2,
  Accessibility,
  Info,
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

const languages = [
  { value: "id", flag: "🇮🇩", name: "Indonesian", native: "Bahasa Indonesia" },
  { value: "en", flag: "🇬🇧", name: "English", native: "English" },
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Settings");
  const [language, setLanguage] = React.useState(locale);
  const [notifications, setNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [compactMode, setCompactMode] = React.useState(false);
  const [accessibility, setAccessibility] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reduceAnimations, setReduceAnimations] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(100);
  const [showAccessibilityOptions, setShowAccessibilityOptions] =
    React.useState(false);
  const [showNotificationsOptions, setShowNotificationsOptions] =
    React.useState(false);
  const [showAboutModal, setShowAboutModal] = React.useState(false);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("uxie-language");
      const storedNotifications = localStorage.getItem("uxie-notifications");
      const storedAutoSave = localStorage.getItem("uxie-auto-save");
      const storedCompactMode = localStorage.getItem("uxie-compact-mode");

      if (storedLanguage && ["id", "en"].includes(storedLanguage)) {
        setLanguage(storedLanguage);
      } else {
        setLanguage(locale);
      }
      if (storedNotifications !== null)
        setNotifications(storedNotifications === "true");
      if (storedAutoSave !== null) setAutoSave(storedAutoSave === "true");
      if (storedCompactMode !== null)
        setCompactMode(storedCompactMode === "true");
    }
  }, [locale]);

  // Save settings to localStorage
  const saveSetting = (key: string, value: string | boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`uxie-${key}`, String(value));
      // TODO: Sync to server async
    }
  };

  const handleLanguageChange = (value: string) => {
    if (value !== locale) {
      setLanguage(value);
      saveSetting("language", value);
      // Redirect ke locale baru dengan path yang sama
      router.replace(pathname, { locale: value });
      // TODO: Show toast notification
    }
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    saveSetting("theme", checked ? "dark" : "light");
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

  const handleCompactModeChange = (checked: boolean) => {
    setCompactMode(checked);
    saveSetting("compact-mode", checked);
    // TODO: Apply compact mode to layout
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
            <DialogTitle>{t("title")}</DialogTitle>
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
                {t("profile.editProfile")}
              </Button>
              <Button variant="ghost" size="sm" className="h-9">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("profile.viewFullProfile")}
              </Button>
            </div>
          </div>

          {/* Language Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-3">
              {t("language.title")}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t("language.description")}
            </p>
            <RadioGroup value={language} onValueChange={handleLanguageChange}>
              {languages.map((lang) => (
                <RadioItem key={lang.value} value={lang.value}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl shrink-0">{lang.flag}</span>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {lang.name}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        ({lang.native})
                      </span>
                    </div>
                  </div>
                </RadioItem>
              ))}
            </RadioGroup>
          </div>

          {/* General Section */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              {t("general.title")}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t("general.description")}
            </p>

            <div className="space-y-3">
              {/* Dark Mode */}
              <div className="flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary shrink-0" />
                  )}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {t("general.darkMode")}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {t("general.darkModeDescription")}
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
                <div className="flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Bell className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {t("general.notifications")}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {t("general.notificationsDescription")}
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
                          {t("general.pushNotifications")}
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
                          {t("general.emailNotifications")}
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
                          {t("general.sound")}
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
              <div className="flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Cloud className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {t("general.autoSave")}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {t("general.autoSaveDescription")}
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={autoSave}
                  onCheckedChange={handleAutoSaveChange}
                />
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Minimize2 className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {t("general.compactMode")}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {t("general.compactModeDescription")}
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={compactMode}
                  onCheckedChange={handleCompactModeChange}
                />
              </div>

              {/* Accessibility */}
              <div>
                <button
                  type="button"
                  onClick={handleAccessibilityToggle}
                  className="w-full flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Accessibility className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground leading-tight">
                        {t("general.accessibility")}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {t("general.accessibilityDescription")}
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
                        {t("general.fontSize")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fontSize}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <span className="text-xs text-foreground">
                        {t("general.highContrast")}
                      </span>
                      <Toggle
                        size="small"
                        checked={highContrast}
                        onCheckedChange={(checked) => {
                          setHighContrast(checked);
                          saveSetting("high-contrast", checked);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between h-9 px-4 rounded-lg">
                      <span className="text-xs text-foreground">
                        {t("general.reduceAnimations")}
                      </span>
                      <Toggle
                        size="small"
                        checked={reduceAnimations}
                        onCheckedChange={(checked) => {
                          setReduceAnimations(checked);
                          saveSetting("reduce-animations", checked);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* About */}
              <button
                type="button"
                onClick={() => setShowAboutModal(true)}
                className="w-full flex items-center justify-between h-11 px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {t("general.about")}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {t("general.aboutDescription")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Modal */}
      {showAboutModal && (
        <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
          <DialogOverlay />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tentang Aplikasi</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  App Name
                </p>
                <p className="text-sm text-muted-foreground">Uxie</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Version
                </p>
                <p className="text-sm text-muted-foreground">1.0.0 beta</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Build Number
                </p>
                <p className="text-sm text-muted-foreground">
                  Build 2024120401
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Release Date
                </p>
                <p className="text-sm text-muted-foreground">
                  December 4, 2024
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Copyright
                </p>
                <p className="text-sm text-muted-foreground">
                  © 2025 Uxie. All rights reserved.
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" className="justify-start">
                  Privacy Policy
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  Terms of Service
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  GitHub
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAboutModal(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
