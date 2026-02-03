export {
  getAllNoteSlugs,
  getAllNoteTags,
  getBacklinks,
  getExistingNoteSlugs,
  getNote,
  getNotes,
  getNotesByTag,
  getOutgoingNotes,
} from './api/notes';

export type { Note, NoteMeta, NoteStatus } from './api/notes';
