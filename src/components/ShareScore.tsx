import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareScoreProps {
  score: number;
  totalQuestions: number;
  subject: string;
}

const ShareScore = ({ score, totalQuestions, subject }: ShareScoreProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const shareText = `🎯 I just scored ${score}/${totalQuestions} (${percentage}%) on ${subject} quiz on AI Shinobi! 🥷\n\nTest your knowledge too!`;
  const shareUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ninja" size="lg" className="gap-2">
          <Share2 className="w-5 h-5" />
          Share Score
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Share Your <span className="text-gradient">Achievement!</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
            <div className="text-4xl font-bold text-gradient mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage}% on {subject}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Share your achievement on social media!
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ninja"
                className="gap-2"
                onClick={handleTwitterShare}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              
              <Button
                variant="ninja"
                className="gap-2"
                onClick={handleFacebookShare}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              
              <Button
                variant="ninja"
                className="gap-2"
                onClick={handleLinkedInShare}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              
              <Button
                variant="ninja"
                className="gap-2"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScore;