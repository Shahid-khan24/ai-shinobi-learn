import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Trophy, 
  Brain,
  Clock,
  Calendar,
  BarChart3
} from "lucide-react";

const stats = [
  { label: "Current Streak", value: "12 days", icon: Flame, color: "text-orange-500" },
  { label: "Total Score", value: "8,547", icon: Trophy, color: "text-yellow-500" },
  { label: "Quizzes Completed", value: "127", icon: Target, color: "text-green-500" },
  { label: "Study Time", value: "24.5h", icon: Clock, color: "text-blue-500" }
];

const recentActivity = [
  { subject: "Computer Science", score: 94, difficulty: "Hard", time: "2 hours ago" },
  { subject: "Mathematics", score: 87, difficulty: "Medium", time: "1 day ago" },
  { subject: "Physics", score: 92, difficulty: "Hard", time: "2 days ago" },
  { subject: "Chemistry", score: 78, difficulty: "Medium", time: "3 days ago" }
];

const Dashboard = () => {
  return (
    <section id="dashboard" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your <span className="text-gradient">Progress</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your learning journey with detailed analytics and performance insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="card-glow p-6 rounded-xl text-center">
                <IconComponent className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Performance Chart */}
          <div className="card-glow p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Weekly Performance
              </h3>
              <Button variant="ninja" size="sm">View Details</Button>
            </div>
            
            <div className="space-y-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const height = Math.random() * 60 + 20;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-8">{day}</span>
                    <div className="flex-1 bg-muted/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(height)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-glow p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              <Button variant="ninja" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div>
                    <div className="font-medium">{activity.subject}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{activity.difficulty}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{activity.score}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            <Brain className="w-5 h-5" />
            Continue Learning
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;