export {
  buildNoteTree,
  getAllNoteSlugs,
  getAllNoteTags,
  getBacklinks,
  getExistingNoteSlugs,
  getNoteAnchorIndex,
  getNoteEmbedPreview,
  getLinkDirection,
  getMergedLinkedNotes,
  getNote,
  getNotes,
  getNotesByStatus,
  getNotesByTag,
  getOutgoingNotes,
  hasBlockAnchor,
  hasHeadingAnchor,
} from './api/notes';

export type {
  LinkDirection,
  LinkedNote,
  Note,
  NoteAnchorIndex,
  NoteEmbedPreview,
  NoteMeta,
  NoteStatus,
  NoteTreeNode,
} from './api/notes';
