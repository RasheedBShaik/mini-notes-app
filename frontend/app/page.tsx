"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Edit3, X, Save, StickyNote, Loader2, Search, Calendar, Hash, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const API_URL = "http://127.0.0.1:5000/api/notes";
  const API_URL = "https://mini-notes-app-nrww.onrender.com/api/notes/";

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

const filteredNotes = useMemo(() => {
  return notes?.filter?.(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []; // Fallback to empty array
}, [notes, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setEditingId(null);
        fetchNotes();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n._id !== id));
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    } catch {
      fetchNotes();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 selection:bg-indigo-100 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-350 mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 10 }} className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <StickyNote className="text-white w-5 h-5" />
            </motion.div>
            <h1 className="text-xl font-black tracking-tight">NoteFlow</h1>
          </div>
          
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <main className="max-w-350 mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Editor (Sticky on PC) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <motion.div 
              layout
              className={`bg-white rounded-4xl shadow-sm border p-6 transition-all duration-500
                ${editingId ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${editingId ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`} />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {editingId ? "Editing Note" : "New Thought"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full text-2xl font-black outline-none placeholder:text-slate-200 bg-transparent tracking-tight"
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full min-h-62.5 text-lg text-slate-600 resize-none outline-none placeholder:text-slate-200 bg-transparent leading-relaxed"
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <button 
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50
                      ${editingId ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingId ? (
                      <><Save className="w-4 h-4" /> Save Changes</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Create Note</>
                    )}
                  </button>
                  
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}
                      className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Mobile Search - Only visible on small screens */}
            <div className="mt-6 md:hidden">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your notes..." 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none"
                    />
                </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Feed (Scrollable) */}
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Notes
                </h3>
                <span className="text-xs font-bold text-slate-400">{filteredNotes.length} Found</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-4xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode='popLayout'>
                  {filteredNotes.map((note) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={note._id} 
                      className="group bg-white p-8 rounded-4xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-8 h-1 bg-slate-100 group-hover:bg-indigo-500 rounded-full transition-all" />
                        <div className="flex gap-1 transition-all translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => { setEditingId(note._id); setTitle(note.title); setContent(note.content); window.scrollTo({top:0, behavior:'smooth'})}}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note._id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight line-clamp-1">{note.title}</h3>
                      <p className="text-slate-500 leading-relaxed mb-6 line-clamp-4 text-[15px] grow">{note.content}</p>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-slate-300" />
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                             {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && filteredNotes.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-black">No matches found</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}