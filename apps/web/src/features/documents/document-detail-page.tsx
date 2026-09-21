import { useParams } from 'react-router-dom';

import { PdfReader } from './pdf-reader';

export function DocumentDetailPage() {
  const { id = '' } = useParams();
  return (
    <PdfReader
      documentId={id}
      backTo="/documents"
      backLabel="Back to documents"
    />
  );
}
