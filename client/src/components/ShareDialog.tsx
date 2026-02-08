import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Twitter, Facebook, MessageCircle, Link2, Check, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
  percentage: number;
  category?: string;
  gameMode?: 'quiz' | 'grid' | 'battle';
  extraInfo?: string;
}

export function ShareDialog({ open, onOpenChange, score, totalQuestions, percentage, category, gameMode = 'quiz', extraInfo }: ShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bibletriviashow.com';

  const modeLabel = gameMode === 'grid' ? 'Bible Trivia Grid Game' : gameMode === 'battle' ? 'Bible Trivia Battle' : 'Bible Trivia Show';
  const shareUrl = gameMode === 'grid' ? `${appUrl}/grid-game` : gameMode === 'battle' ? `${appUrl}/battle` : appUrl;
  const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '📖';
  const perfectTag = percentage === 100 ? '💯 Perfect score!' : '';

  const shareText = gameMode === 'grid'
    ? `I scored ${score} points in the ${modeLabel}!${extraInfo ? ` ${extraInfo}` : ''} Can you beat my score? Test your biblical knowledge now!`
    : gameMode === 'battle'
    ? `I ${extraInfo || 'competed'} in a ${modeLabel} with ${score} points! Can you do better? Challenge me now!`
    : `I just scored ${score} points (${percentage}% accuracy) on ${modeLabel}! Can you beat my score? Test your biblical knowledge now!`;

  const shareTextWithEmojis = gameMode === 'grid'
    ? `${emoji} I scored ${score} points in the ${modeLabel}!${extraInfo ? ` ${extraInfo}` : ''} ${perfectTag} Challenge me: ${shareUrl}`
    : gameMode === 'battle'
    ? `⚔️ I ${extraInfo || 'competed'} in a ${modeLabel} with ${score} points! ${perfectTag} Challenge me: ${shareUrl}`
    : `${emoji} I scored ${score} points (${percentage}%) on ${modeLabel}! ${perfectTag} Challenge me: ${shareUrl}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithEmojis)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTextWithEmojis)}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${modeLabel} - My Score`,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: 'Shared!', description: 'Thanks for spreading the word!' });
        onOpenChange(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareTextWithEmojis}`);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Share text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to copy to clipboard.', variant: 'destructive' });
    }
  };

  const handleSocialShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const socialButtons = [
    { 
      platform: 'twitter' as const, 
      label: 'X / Twitter', 
      icon: Twitter, 
      bgClass: 'bg-black hover:bg-gray-800',
      textClass: 'text-white'
    },
    { 
      platform: 'facebook' as const, 
      label: 'Facebook', 
      icon: Facebook, 
      bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]',
      textClass: 'text-white'
    },
    { 
      platform: 'whatsapp' as const, 
      label: 'WhatsApp', 
      icon: MessageCircle, 
      bgClass: 'bg-[#25D366] hover:bg-[#20BD5A]',
      textClass: 'text-white'
    },
  ];

  const summaryLabel = gameMode === 'grid'
    ? `${score} pts`
    : gameMode === 'battle'
    ? `${score} pts`
    : `${score} pts`;

  const summaryDetail = gameMode === 'grid'
    ? (extraInfo || `${modeLabel}`)
    : gameMode === 'battle'
    ? `${extraInfo || 'Battle completed'}`
    : `${percentage}% accuracy on ${totalQuestions} questions`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Score
          </DialogTitle>
          <DialogDescription>
            Challenge your friends and see who knows the Bible best!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-700 text-center"
          >
            <div className="text-4xl font-black text-yellow-600 mb-1">{summaryLabel}</div>
            <div className="text-sm text-muted-foreground">{summaryDetail}</div>
          </motion.div>

          {'share' in navigator && (
            <Button 
              onClick={handleNativeShare}
              className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-amber-500"
              data-testid="button-native-share"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Now
            </Button>
          )}

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-center">
              Share on Social Media
            </p>
            <div className="grid grid-cols-3 gap-3">
              {socialButtons.map((btn) => (
                <motion.div key={btn.platform} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleSocialShare(btn.platform)}
                    className={`w-full h-14 rounded-xl font-bold flex flex-col items-center justify-center gap-1 ${btn.bgClass} ${btn.textClass}`}
                    data-testid={`button-share-${btn.platform}`}
                  >
                    <btn.icon className="w-5 h-5" />
                    <span className="text-xs">{btn.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full h-12 rounded-xl font-semibold border-2"
              data-testid="button-copy-share"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy Share Text
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Help us grow! Share with friends and family to spread biblical wisdom.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
