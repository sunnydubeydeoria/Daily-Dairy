import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDiaryEntries, DiaryEntry } from '@/hooks/useDiaryEntries';
import { 
  X, 
  Save, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2,
  List,
  ListOrdered,
  Quote,
  Smile,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface DiaryEditorProps {
  entry: DiaryEntry | null;
  onClose: () => void;
}

const EMOJI_LIST = ['😊', '😢', '😡', '🥰', '😴', '🎉', '💪', '🙏', '✨', '🌟', '❤️', '💭', '📝', '🌈', '☀️', '🌙'];

const DiaryEditor = ({ entry, onClose }: DiaryEditorProps) => {
  const { createEntry, updateEntry, isCreating, isUpdating } = useDiaryEntries();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [entryDate, setEntryDate] = useState<Date>(
    entry?.entry_date ? new Date(entry.entry_date + 'T00:00:00') : new Date()
  );
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save draft functionality
  useEffect(() => {
    if (!entry && (title || content)) {
      setAutoSaveStatus('unsaved');
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        // Save to localStorage as draft
        localStorage.setItem('diary-draft', JSON.stringify({
          title,
          content,
          entryDate: entryDate.toISOString(),
        }));
        setAutoSaveStatus('saved');
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, entryDate, entry]);

  // Load draft on mount
  useEffect(() => {
    if (!entry) {
      const draft = localStorage.getItem('diary-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          if (parsed.entryDate) {
            setEntryDate(new Date(parsed.entryDate));
          }
        } catch (e) {
          // Invalid draft, ignore
        }
      }
    }
  }, [entry]);

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [content]);

  const handleFormat = (formatType: string) => {
    switch (formatType) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'h1':
        insertText('# ');
        break;
      case 'h2':
        insertText('## ');
        break;
      case 'list':
        insertText('- ');
        break;
      case 'ordered':
        insertText('1. ');
        break;
      case 'quote':
        insertText('> ');
        break;
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + emoji + content.substring(start);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + emoji.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const entryData = {
      title: title.trim(),
      content,
      entry_date: format(entryDate, 'yyyy-MM-dd'),
      is_draft: false,
    };
    
    if (entry) {
      updateEntry({ id: entry.id, ...entryData });
    } else {
      createEntry(entryData);
      // Clear draft
      localStorage.removeItem('diary-draft');
    }
    
    onClose();
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-12 bg-card rounded-none sm:rounded-2xl shadow-elevated overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {entry ? 'Edit Entry' : 'New Entry'}
              {autoSaveStatus === 'saving' && ' • Saving...'}
              {autoSaveStatus === 'saved' && !entry && content && ' • Draft saved'}
            </span>
          </div>
          <Button onClick={handleSave} disabled={!title.trim() || isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Date Picker */}
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(entryDate, 'MMMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={entryDate}
                    onSelect={(date) => date && setEntryDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="text-2xl sm:text-3xl font-serif font-semibold border-none bg-transparent px-0 h-auto py-2 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 pb-2 border-b border-border overflow-x-auto">
              <Button variant="ghost" size="icon" onClick={() => handleFormat('bold')} title="Bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat('italic')} title="Italic">
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={() => handleFormat('h1')} title="Heading 1">
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat('h2')} title="Heading 2">
                <Heading2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={() => handleFormat('list')} title="Bullet List">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat('ordered')} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat('quote')} title="Quote">
                <Quote className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" title="Insert Emoji">
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Content */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full min-h-[400px] bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/50 font-serif text-lg leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryEditor;
