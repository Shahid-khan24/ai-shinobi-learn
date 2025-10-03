import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Target, GraduationCap, Brain } from "lucide-react";

interface SubtopicSelectionProps {
  subject: string;
  isOpen: boolean;
  onClose: () => void;
}

const subtopicsBySubject: Record<string, string[]> = {
  "Islam": [
    "Quran",
    "Hadiths",
    "Mixed"
  ],
  "Tamil": [
    "Grammar",
    "Poetry",
    "Stories"
  ],
  "English": [
    "Grammar",
    "Literature",
    "Writing",
    "Vocabulary",
    "Comprehension",
    "Speaking"
  ],
  "Computer Science": [
    "Programming Basics",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "Database Systems",
    "Operating Systems"
  ],
  "Mathematics": [
    "Algebra",
    "Geometry",
    "Calculus",
    "Statistics",
    "Number Theory",
    "Trigonometry"
  ],
  "Science": [
    "Physics",
    "Chemistry",
    "Biology",
    "Astronomy",
    "Earth Science",
    "Environmental Science"
  ],
  "Technology": [
    "Programming",
    "Web Development",
    "AI & Machine Learning",
    "Cybersecurity",
    "Database Systems",
    "Cloud Computing"
  ],
  "History": [
    "World History",
    "Ancient Civilizations",
    "Modern History",
    "American History",
    "European History",
    "Asian History"
  ],
  "Literature": [
    "Poetry",
    "Classic Literature",
    "Modern Literature",
    "Shakespeare",
    "Creative Writing",
    "Literary Analysis"
  ],
  "Languages": [
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Chinese",
    "Grammar & Vocabulary"
  ]
};

const SubtopicSelection = ({ subject, isOpen, onClose }: SubtopicSelectionProps) => {
  const navigate = useNavigate();
  const subtopics = subtopicsBySubject[subject] || [];

  const handleSubtopicSelect = (subtopic: string) => {
    navigate(`/quiz-selection/${subtopic}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Choose a <span className="text-gradient">{subject}</span> Topic
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {subtopics.map((subtopic, index) => (
            <Button
              key={subtopic}
              variant="ninja"
              className="h-auto p-4 justify-start animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleSubtopicSelect(subtopic)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {index % 4 === 0 && <BookOpen className="w-4 h-4 text-primary" />}
                  {index % 4 === 1 && <Target className="w-4 h-4 text-primary" />}
                  {index % 4 === 2 && <GraduationCap className="w-4 h-4 text-primary" />}
                  {index % 4 === 3 && <Brain className="w-4 h-4 text-primary" />}
                </div>
                <span className="text-left">{subtopic}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubtopicSelection;