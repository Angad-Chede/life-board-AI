import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Pin, Search, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import AppLayout from '@/components/layout/AppLayout';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updated_at: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchNotes();
  }, [user]);

  async function fetchNotes() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) {
        toast.error('Failed to load notes');
      } else {
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch {
      // Table may not exist yet
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
    );
  }, [notes, search]);

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  function openEditor(note?: Note) {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content || '');
      setPinned(note.pinned);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setPinned(false);
    }
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingNote(null);
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      pinned,
      updated_at: new Date().toISOString(),
    };

    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', editingNote.id);
      if (error) {
        toast.error('Failed to update note');
        return;
      }
      setNotes((prev) =>
        prev
          .map((n) => (n.id === editingNote.id ? { ...n, ...payload } : n))
          .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      );
      toast.success('Note updated');
    } else {
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error || !data) {
        toast.error('Failed to add note');
        return;
      }
      setNotes((prev) =>
        [{ ...data, pinned } as Note, ...prev]
          .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      );
      toast.success('Note created');
    }
    closeEditor();
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete note');
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('Note deleted');
  }

  async function togglePin(id: string, currentPinned: boolean) {
    const { error } = await supabase
      .from('notes')
      .update({ pinned: !currentPinned })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update note');
      return;
    }
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, pinned: !currentPinned } : n))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    );
  }

  const renderNoteCard = (note: Note, index: number) => (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`p-4 rounded-xl bg-white/60 border hover:bg-white/80 transition-colors ${
        note.pinned ? 'border-l-4 border-l-violet-400 border-white/50' : 'border-white/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          onClick={() => openEditor(note)}
          className="font-sora font-semibold text-sm text-foreground text-balance line-clamp-2 cursor-pointer flex-1"
        >
          {note.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => togglePin(note.id, note.pinned)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.pinned ? 'text-violet-600 bg-violet-50' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p
        onClick={() => openEditor(note)}
        className="text-xs text-muted-foreground line-clamp-2 text-pretty cursor-pointer"
      >
        {note.content || 'No content'}
      </p>
      <p className="text-[10px] text-muted-foreground/50 mt-2">
        {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </motion.div>
  );

  return (
    <AppLayout>
      <PageMeta title="Notes — LifeBoard AI" description="Your notes." />
      <div className="max-w-4xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="font-sora text-2xl font-bold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">Capture ideas and organize your thoughts.</p>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </motion.div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No notes match your search.' : 'No notes yet. Create your first one.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pinned</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pinnedNotes.map((note, i) => renderNoteCard(note, i))}
                </div>
              </div>
            )}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">All Notes</span>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {unpinnedNotes.map((note, i) => renderNoteCard(note, i))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-up Editor */}
      <AnimatePresence>
        {editorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={closeEditor}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <div className="p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sora text-lg font-semibold text-foreground">
                    {editingNote ? 'Edit Note' : 'New Note'}
                  </h2>
                  <button onClick={closeEditor} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={saveNote} className="space-y-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-white text-sm font-sora font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note here..."
                    rows={8}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPinned(!pinned)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pinned
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      {pinned ? 'Pinned' : 'Pin note'}
                    </button>

                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
