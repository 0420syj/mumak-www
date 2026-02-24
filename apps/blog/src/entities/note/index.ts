export {
  buildNoteTree,
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

export type { LinkDirection, LinkedNote, Note, NoteMeta, NoteStatus, NoteTreeNode } from './api/notes';
