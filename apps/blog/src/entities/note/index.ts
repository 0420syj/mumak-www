export {
  getNotes,
  getNote,
  getAllNoteSlugs,
  getExistingNoteSlugs,
  getBacklinks,
  getNotesByTag,
  getAllNoteTags,
  getOutgoingNotes,
} from './api/notes';

export type { NoteMeta, Note, NoteStatus } from './api/notes';
