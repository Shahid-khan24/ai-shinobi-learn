import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Syllabus {
  id: string;
  title: string;
  file_name: string;
  created_at: string;
}

const SyllabusUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSyllabusList = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .select('id, title, file_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSyllabusList(data || []);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

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

      await fetchSyllabusList();
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

  const handleDelete = async (syllabusId: string, filePath: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('syllabus')
        .delete()
        .eq('id', syllabusId);

      if (deleteError) throw deleteError;

      await supabase.storage
        .from('syllabus-files')
        .remove([filePath]);

      toast({
        title: "Deleted",
        description: "Syllabus deleted successfully",
      });

      await fetchSyllabusList();
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      toast({
        title: "Error",
        description: "Failed to delete syllabus",
        variant: "destructive"
      });
    }
  };

  const handleSelectSyllabus = (syllabusId: string) => {
    navigate(`/syllabus-quiz/${syllabusId}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Your Syllabus
        </CardTitle>
        <CardDescription>
          Upload your syllabus (PDF, DOCX, TXT) and generate quizzes from specific topics
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
            {uploading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
          </p>
        </div>

        {!user && (
          <p className="text-sm text-amber-600">
            Please sign in to upload syllabus files
          </p>
        )}

        {user && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Syllabus Files</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSyllabusList}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : syllabusList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No syllabus files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {syllabusList.map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{syllabus.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(syllabus.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ninja"
                        size="sm"
                        onClick={() => handleSelectSyllabus(syllabus.id)}
                      >
                        Generate Quiz
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(syllabus.id, syllabus.file_name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SyllabusUpload;