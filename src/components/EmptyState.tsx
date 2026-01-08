import { Button } from '@/components/ui/button';
import { BookOpen, Feather } from 'lucide-react';

interface EmptyStateProps {
  onNewEntry: () => void;
}

const EmptyState = ({ onNewEntry }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
        Your story begins here
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Start capturing your thoughts, memories, and moments. Your diary is completely private—only you can see what you write.
      </p>
      <Button onClick={onNewEntry} size="lg" className="gap-2">
        <Feather className="w-5 h-5" />
        Write your first entry
      </Button>
    </div>
  );
};

export default EmptyState;
