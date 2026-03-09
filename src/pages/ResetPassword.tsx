import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Loader2, Key, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ResetPassword = () => {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validLink, setValidLink] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for valid recovery token
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash && !user) {
      setValidLink(false);
    }
    // Simulate token validation check
    const timer = setTimeout(() => {
      setCheckingToken(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  // Countdown for redirect after success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (success && countdown === 0) {
      navigate("/");
    }
  }, [success, countdown, navigate]);

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-red-500", "bg-red-400", "bg-yellow-400", "bg-yellow-300", "bg-green-400", "bg-green-500"];

  if (loading || checkingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Validating reset link...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ 
        title: "Passwords don't match", 
        description: "Please make sure both passwords are the same.",
        variant: "destructive" 
      });
      return;
    }

    // Stronger password validation
    if (password.length < 8) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 8 characters.",
        variant: "destructive" 
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({ 
        title: "Password too weak", 
        description: "Include uppercase, lowercase, and numbers.",
        variant: "destructive" 
      });
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await updatePassword(password);
    
    if (error) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      setSuccess(true);
      toast({ 
        title: "Password updated", 
        description: "Your password has been successfully reset." 
      });
    }
    
    setSubmitting(false);
  };

  if (!validLink && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive">
                <Key className="h-7 w-7 text-destructive-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Invalid Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/forgot-password")}>
                Request New Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Key className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="font-serif text-2xl">Success!</CardTitle>
              <CardDescription>
                Your password has been reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Redirecting in <span className="font-bold text-primary">{countdown}</span> seconds...
              </p>
              <Button className="mt-4 w-full" onClick={() => navigate("/")}>
                Go to App Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <ChefHat className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="font-serif text-2xl">Set New Password</CardTitle>
            <CardDescription>
              Create a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    minLength={8}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex h-2 w-full rounded-full bg-gray-200">
                      <div 
                        className={`h-full rounded-full transition-all ${strengthColors[passwordStrength]}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <p className={`text-xs ${passwordStrength < 3 ? 'text-red-500' : passwordStrength < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}
                
                {/* Password requirements */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {password.length >= 8 ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-1">
                    {/[A-Z]/.test(password) ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                    One uppercase letter
                  </div>
                  <div className="flex items-center gap-1">
                    {/[a-z]/.test(password) ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                    One lowercase letter
                  </div>
                  <div className="flex items-center gap-1">
                    {/[0-9]/.test(password) ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
                    One number
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    required 
                    minLength={8}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || password !== confirmPassword || passwordStrength < 3}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
