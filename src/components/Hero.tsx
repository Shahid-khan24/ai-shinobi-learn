import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Zap, Target } from "lucide-react";
import heroImage from "@/assets/hero-ninja.jpg";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Background Image */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img 
          src={heroImage} 
          alt="AI Shinobi - Futuristic AI Learning" 
          className="w-full h-full object-cover opacity-20"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-colors duration-300">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">AI-Powered Learning Platform</span>
            </div>
          </div>

          <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '100ms', willChange: 'transform, opacity' }}>
            Master Any Subject with{" "}
            <span className="bg-gradient-to-r from-primary via-brand-orange to-primary bg-clip-text text-transparent animate-gradient" style={{ backgroundSize: "200% 200%", willChange: 'background-position' }}>AI Shinobi</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            Experience the future of learning with AI-generated quizzes, intelligent explanations, 
            and adaptive difficulty across 7+ subjects. Your personal learning ninja awaits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button 
              variant="hero" 
              size="lg" 
              className="group"
              onClick={() => document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Start learning with AI Shinobi"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <article className="card-glow p-6 rounded-xl animate-ninja-appear ninja-hover" style={{ animationDelay: '0ms' }} aria-label="AI-Generated Quizzes feature">
              <Brain className="w-12 h-12 text-primary mb-4 mx-auto rasengan-effect" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">AI-Generated Quizzes</h3>
              <p className="text-muted-foreground text-sm">
                Dynamic questions tailored to your learning level and progress
              </p>
            </article>
            <article className="card-glow p-6 rounded-xl animate-ninja-appear ninja-hover" style={{ animationDelay: '100ms' }} aria-label="Smart Explanations feature">
              <Target className="w-12 h-12 text-primary mb-4 mx-auto shuriken-rotate" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">Smart Explanations</h3>
              <p className="text-muted-foreground text-sm">
                Step-by-step AI explanations for deeper understanding
              </p>
            </article>
            <article className="card-glow p-6 rounded-xl animate-ninja-appear ninja-hover chakra-glow" style={{ animationDelay: '200ms' }} aria-label="Adaptive Learning feature">
              <Zap className="w-12 h-12 text-primary mb-4 mx-auto" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">Adaptive Learning</h3>
              <p className="text-muted-foreground text-sm">
                Difficulty adjusts based on your performance and growth
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;