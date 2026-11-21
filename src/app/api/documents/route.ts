import { listDocuments } from "@/lib/search";

// List of uploaded documents (newest first) for the chat's document picker.
// Protected by src/proxy.ts like every non-public route.
export async function GET() {
  try {
    const docs = await listDocuments();
    return Response.json(
      docs.map((d) => ({ source: d.source, uploadedAt: d.uploadedAt })),
    );
  } catch (error) {
    console.error("List documents error:", error);
    return Response.json(
      { error: "Failed to load documents" },
      { status: 500 },
    );
  }
}
