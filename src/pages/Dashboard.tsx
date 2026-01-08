import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDiaryEntries, DiaryEntry } from '@/hooks/useDiaryEntries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Plus, 
  Search, 
  LogOut, 
  Calendar,
  Edit3,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import DiaryEditor from '@/components/DiaryEditor';
import DiaryEntryCard from '@/components/DiaryEntryCard';
import EmptyState from '@/components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { entries, isLoading, deleteEntry, isDeleting } = useDiaryEntries();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    
    const query = searchQuery.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.entry_date.includes(query)
    );
  }, [entries, searchQuery]);

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setIsEditorOpen(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsEditorOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: DiaryEntry[] } = {};
    filteredEntries.forEach(entry => {
      const dateKey = entry.entry_date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading your diary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-semibold text-foreground">Daily Diary</h1>
                <p className="text-sm text-muted-foreground">
                  Hello, {profile?.username || 'there'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleNewEntry} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Entry</span>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="icon" title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        {/* Date & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <EmptyState onNewEntry={handleNewEntry} />
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No entries match your search.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {Object.keys(groupedEntries)
              .sort((a, b) => b.localeCompare(a))
              .map(dateKey => (
                <div key={dateKey}>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <span>{formatDateHeader(dateKey)}</span>
                    <span className="flex-1 h-px bg-border"></span>
                  </h2>
                  <div className="space-y-3">
                    {groupedEntries[dateKey].map(entry => (
                      <DiaryEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={() => handleEditEntry(entry)}
                        onDelete={() => handleDeleteEntry(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Editor Modal */}
      {isEditorOpen && (
        <DiaryEditor
          entry={selectedEntry}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This diary entry will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
