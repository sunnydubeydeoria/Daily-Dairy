import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Feather, Shield, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Lock,
      title: '100% Private',
      description: 'Your entries are encrypted and only visible to you. No one else can access your thoughts.',
    },
    {
      icon: Feather,
      title: 'Beautiful Writing',
      description: 'A distraction-free editor with rich text formatting to capture your thoughts beautifully.',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Industry-standard security protects your diary. Your memories are safe with us.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container max-w-6xl mx-auto px-4 py-16 sm:py-24">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-serif font-semibold text-foreground">Daily Diary</span>
            </div>
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Your private space for reflection
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-foreground leading-tight mb-6">
              Capture your thoughts,{' '}
              <span className="text-primary">one day at a time</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A beautiful, secure diary where you can write freely about your day, your dreams, and everything in between. Your words stay private, always.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Feather className="w-5 h-5" />
                  Start Writing Free
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
              Why keep a diary?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Journaling helps you process emotions, track personal growth, and create a lasting record of your life's journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-soft border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of people who have discovered the power of daily journaling. Your first entry is waiting.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-base px-8">
              <BookOpen className="w-5 h-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Daily Diary</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your thoughts, your privacy, your story.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
