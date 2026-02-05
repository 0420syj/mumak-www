export {
  getAllNoteSlugs,
  getAllNoteTags,
  getBacklinks,
  getExistingNoteSlugs,
  getLinkDirection,
  getMergedLinkedNotes,
  getNote,
  getNotes,
  getNotesByStatus,
  getNotesByTag,
  getOutgoingNotes,
} from './api/notes';

export type { LinkDirection, LinkedNote, Note, NoteMeta, NoteStatus } from './api/notes';
