import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLocation } from 'wouter';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function Auth() {
  const { setUser, refreshStats } = useGame();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await api.sendOtp(email);
      if (result.success) {
        setStep('otp');
        toast({ title: "Code Sent!", description: `We sent a temporary login code to ${email}` });
      } else {
        toast({ title: "Error", description: result.error || "Failed to send code", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send code. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setIsLoading(true);
    try {
      const result = await api.verifyOtp(email, otp);
      if (result.success && result.user) {
        setUser(result.user);
        await refreshStats();
        toast({ title: "Welcome!", description: `Ready to study, ${result.user.name || result.user.email}?` });
        setLocation('/');
      } else {
        toast({ title: "Invalid Code", description: result.error || "Please check your code and try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const result = await api.sendOtp(email);
      if (result.success) {
        toast({ title: "Code Resent", description: "Check your inbox again!" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to resend code", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden rounded-[2rem]">
        <CardHeader className="text-center space-y-4 pb-2 pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-display font-bold">
              {step === 'email' ? 'Welcome Back' : 'Check your Inbox'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {step === 'email' 
                ? 'Enter your email to sign in or create an account' 
                : `We've sent a 6-digit code to ${email}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-6">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendCode} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      data-testid="input-email"
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 rounded-xl text-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 transition-all"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <Button 
                  data-testid="button-send-code"
                  type="submit" 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerify} 
                className="space-y-6 flex flex-col items-center"
              >
                <div className="flex justify-center w-full py-4">
                  <InputOTP 
                    data-testid="input-otp"
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl rounded-l-lg border-y border-l bg-slate-50 dark:bg-slate-800" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl border-y bg-slate-50 dark:bg-slate-800" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl border-y bg-slate-50 dark:bg-slate-800" />
                    </InputOTPGroup>
                    <div className="w-2" />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl border-y bg-slate-50 dark:bg-slate-800" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl border-y bg-slate-50 dark:bg-slate-800" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl rounded-r-lg border-y border-r bg-slate-50 dark:bg-slate-800" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="w-full space-y-3">
                  <Button 
                    data-testid="button-verify"
                    type="submit" 
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
                    disabled={isLoading || otp.length < 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Login
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    data-testid="button-change-email"
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Email
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive code? <button data-testid="button-resend" type="button" className="text-primary font-bold hover:underline" onClick={handleResend}>Resend</button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
