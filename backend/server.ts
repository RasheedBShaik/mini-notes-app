import express, { type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
// use cors
const allowedOrigins = [
  'http://localhost:3000', // Allow local development
  'https://mini-notes-app-rose.vercel.app' // Replace with your actual Vercel URL
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// --- MongoDB Connection ---
if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Don't kill the process, so we can at least see the error in the console
  });

// --- Mongoose Schema ---
interface INote {
  title: string;
  content: string;
  createdAt: Date;
}

const noteSchema = new mongoose.Schema<INote>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model<INote>('Note', noteSchema);

// --- Routes ---

app.get('/api/notes', async (req: Request, res: Response) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

app.post('/api/notes', async (req: Request, res: Response) => {
  try {
    const newNote = new Note(req.body);
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Create Error" });
  }
});

app.put('/api/notes/:id', async (req: Request, res: Response) => {
  try {
    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update Error" });
  }
});

app.delete('/api/notes/:id', async (req: Request, res: Response) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Delete Error" });
  }
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Server ready at http://127.0.0.1:${PORT}`);
});