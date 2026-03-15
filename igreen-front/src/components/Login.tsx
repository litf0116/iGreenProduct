import { useState } from "react";
import { Language, translations, TranslationKey } from "../lib/i18n";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ClipboardList, Lock, AlertCircle, User, Globe } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import appLogo from "figma:asset/e2d3be716f2b03621853146ef3c8dd02abba30cb.png";

interface LoginProps {
  language: Language;
  onLogin: (username: string, password: string, country: string) => Promise<void>;
  onSwitchToSignUp: () => void;
}

export function Login({ language, onLogin, onSwitchToSignUp }: LoginProps) {
  const t = (key: TranslationKey) => translations[language][key];
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("TH");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !country) {
      setError(t("fieldRequired"));
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username, password, country);
    } catch (err) {
      setError(t("invalidCredentials"));
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
            <h1 className="font-bold text-[#0f172a] text-[24px]">{t("welcomeToCS")}</h1>
            <p className="text-muted-foreground">{t("signInToAccount")}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectItem value="TH">🇹🇭 Thailand / ไทย</SelectItem>
                  <SelectItem value="ID">🇮🇩 Indonesia / Indonesia</SelectItem>
                  <SelectItem value="BR">🇧🇷 Brazil / Brasil</SelectItem>
                  <SelectItem value="MX">🇲🇽 Mexico / México</SelectItem>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("rememberMe")}
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="px-0 h-auto"
                disabled={isLoading}
              >
                {t("forgotPassword")}
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? t("loading") : t("signIn")}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Button
                type="button"
                variant="link"
                className="px-1 h-auto"
                onClick={onSwitchToSignUp}
                disabled={isLoading}
              >
                {t("signUp")}
              </Button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
