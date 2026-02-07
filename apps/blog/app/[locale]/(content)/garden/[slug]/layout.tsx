import { ReadingProgress } from '@/src/widgets/reading-progress';

interface NoteLayoutProps {
  children: React.ReactNode;
}

export default function NoteLayout({ children }: NoteLayoutProps) {
  return (
    <>
      <ReadingProgress />
      {children}
    </>
  );
}
