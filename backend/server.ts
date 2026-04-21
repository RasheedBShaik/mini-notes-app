import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// --- CONFIG & ENV ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

// --- MIDDLEWARE ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://mini-notes-app-rose.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🍃 MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// --- SCHEMA & MODEL ---
interface INote {
  title: string;
  content: string;
  createdAt: Date;
}

const noteSchema = new mongoose.Schema<INote>({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  content: { type: String, required: [true, 'Content is required'] },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model<INote>('Note', noteSchema);

// --- ROUTES ---

// GET: Fetch all notes (Sorted by newest first)
app.get('/api/notes', async (_req: Request, res: Response) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(notes);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST: Create a new note
app.post('/api/notes', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newNote = new Note({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update an existing note
app.put('/api/notes/:id', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a note
app.delete('/api/notes/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(204).send(); // No content
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVER INITIALIZATION ---
const startServer = async () => {
  await connectDB();

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();