import { useState } from "react";
import { Language, translations, TranslationKey } from "../lib/i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { ClipboardList, Lock, User, Briefcase, AlertCircle, Globe } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import appLogo from "figma:asset/e2d3be716f2b03621853146ef3c8dd02abba30cb.png";

interface SignUpProps {
  language: Language;
  onSignUp: (name: string, username: string, password: string, role: string, country: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function SignUp({ language, onSignUp, onSwitchToLogin }: SignUpProps) {
  const t = (key: TranslationKey) => translations[language][key];
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || !username || !password || !confirmPassword || !role || !country) {
      setError(t("fieldRequired"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMustMatch"));
      return;
    }

    setIsLoading(true);
    try {
      await onSignUp(name, username, password, role, country);
    } catch (err) {
      // Basic error handling assumption
      setError("Username already exists"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <div className="p-8 space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img src={appLogo} alt="iGreen+ Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-primary">{t("welcomeToCS")}</h1>
            <p className="text-muted-foreground">{t("getStarted")}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {t("fullName")}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enterName")}
                className="bg-input-background"
                disabled={isLoading}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {t("username")}
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("enterUsername")}
                className="bg-input-background"
                disabled={isLoading}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {t("role")}
              </Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Maintenance Engineer">
                    {t("maintenanceEngineer")}
                  </SelectItem>
                  <SelectItem value="Supervisor">
                    {t("supervisor")}
                  </SelectItem>
                  <SelectItem value="Administrator">
                    {t("admin")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {t("country")}
              </Label>
              <Select value={country} onValueChange={setCountry} disabled={isLoading}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={t("selectCountry")} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Thailand">
                    🇹🇭 Thailand / ไทย
                  </SelectItem>
                  <SelectItem value="Indonesia">
                    🇮🇩 Indonesia / Indonesia
                  </SelectItem>
                  <SelectItem value="Brazil">
                    🇧🇷 Brazil / Brasil
                  </SelectItem>
                  <SelectItem value="Mexico">
                    🇲🇽 Mexico / México
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("enterPassword")}
                className="bg-input-background"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                {t("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPassword")}
                className="bg-input-background"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? t("loading") : t("signUp")}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Button
                type="button"
                variant="link"
                className="px-1 h-auto"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                {t("signIn")}
              </Button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
