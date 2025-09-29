import { Button } from "@/components/ui/button";
import { 
  Code, 
  Calculator, 
  Atom, 
  FlaskConical,
  Star,
  Languages,
  BookOpen,
  ArrowRight
} from "lucide-react";

const subjects = [
  {
    id: "computer-science",
    name: "Computer Science",
    icon: Code,
    description: "Data Structures, Algorithms, OOP, Databases, Networks, OS",
    color: "from-blue-500 to-cyan-500",
    quizCount: 156
  },
  {
    id: "mathematics",
    name: "Mathematics", 
    icon: Calculator,
    description: "Calculus, Linear Algebra, Statistics, Probability, Discrete Math",
    color: "from-purple-500 to-pink-500",
    quizCount: 243
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    description: "Mechanics, Thermodynamics, Electromagnetism, Quantum Physics",
    color: "from-orange-500 to-red-500",
    quizCount: 189
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    description: "Organic, Inorganic, Physical, Analytical, Biochemistry",
    color: "from-green-500 to-emerald-500",
    quizCount: 134
  },
  {
    id: "islamic-studies",
    name: "Islamic Studies",
    icon: Star,
    description: "Quran, Hadith, Islamic History, Fiqh, Aqeedah, Seerah",
    color: "from-teal-500 to-cyan-500",
    quizCount: 87
  },
  {
    id: "tamil",
    name: "Tamil Language",
    icon: Languages,
    description: "Grammar, Literature, Poetry, Culture, Linguistics",
    color: "from-yellow-500 to-orange-500",
    quizCount: 76
  },
  {
    id: "english",
    name: "English Language",
    icon: BookOpen,
    description: "Grammar, Literature, Writing, Comprehension, Vocabulary",
    color: "from-indigo-500 to-purple-500",
    quizCount: 198
  }
];

const SubjectGrid = () => {
  return (
    <section id="subjects" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient">Learning Path</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master any subject with AI-powered quizzes designed to adapt to your learning style
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            return (
              <div key={subject.id} className="subject-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {subject.quizCount} quizzes
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {subject.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {subject.description}
                </p>

                <Button 
                  variant="ninja" 
                  size="sm" 
                  className="w-full group-hover:bg-primary/20 transition-colors"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;