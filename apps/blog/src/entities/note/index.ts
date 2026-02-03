export {
  getAllNoteSlugs,
  getAllNoteTags,
  getBacklinks,
  getExistingNoteSlugs,
  getNote,
  getNotes,
  getNotesByStatus,
  getNotesByTag,
  getOutgoingNotes,
} from './api/notes';

export type { Note, NoteMeta, NoteStatus } from './api/notes';
