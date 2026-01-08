import { DiaryEntry } from '@/hooks/useDiaryEntries';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit: () => void;
  onDelete: () => void;
}

const DiaryEntryCard = ({ entry, onEdit, onDelete }: DiaryEntryCardProps) => {
  // Strip markdown formatting for preview
  const getPreview = (text: string, maxLength: number = 150) => {
    const stripped = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/>/g, '')
      .replace(/- /g, '')
      .replace(/\d+\. /g, '');
    
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="diary-entry group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground truncate">
            {entry.title}
          </h3>
          {entry.content && (
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {getPreview(entry.content)}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground/70">
            {format(parseISO(entry.created_at), 'h:mm a')} • Updated {format(parseISO(entry.updated_at), 'MMM d, h:mm a')}
          </p>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryCard;
