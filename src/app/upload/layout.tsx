// Large PDFs take a while to embed; give the upload Server Action up to 5 minutes
// (the page itself is a Client Component, so this config lives in the layout).
export const maxDuration = 300;

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
