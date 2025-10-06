import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Loader2 } from "lucide-react";

const SyllabusUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, DOCX, DOC, or TXT files only",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('syllabus-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error: functionError } = await supabase.functions.invoke('process-syllabus', {
        body: {
          filePath: fileName,
          fileName: file.name,
          fileType: file.type,
          title: file.name.replace(/\.[^/.]+$/, "")
        }
      });

      if (functionError) throw functionError;

      toast({
        title: "Success!",
        description: "Syllabus uploaded and processed successfully",
      });

      // Reload the page to show the new syllabus in the section below
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading syllabus:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload syllabus",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card className="w-full card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Upload Your Syllabus
        </CardTitle>
        <CardDescription>
          Upload your course syllabus (PDF, DOCX, TXT) to generate personalized quizzes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="syllabus-upload">Choose File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="syllabus-upload"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={uploading || !user}
              className="flex-1"
            />
            {uploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
          </p>
        </div>

        {!user && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-500">
              Please sign in to upload syllabus files
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SyllabusUpload;