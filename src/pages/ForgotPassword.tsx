import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const { user, loading, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting: prevent spam
    const lastRequest = localStorage.getItem('lastPasswordReset');
    const now = Date.now();
    if (lastRequest && now - parseInt(lastRequest) < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - parseInt(lastRequest))) / 1000);
      toast({
        title: "Please wait",
        description: `You can request another reset in ${secondsLeft} seconds`,
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      localStorage.setItem('lastPasswordReset', now.toString());
      setSent(true);
      toast({ 
        title: "Email sent", 
        description: "Check your inbox for password reset instructions." 
      });
    }
    
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <ChefHat className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="font-serif text-2xl">
              {sent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {sent 
                ? "We've sent you a link to reset your password" 
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Back to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
