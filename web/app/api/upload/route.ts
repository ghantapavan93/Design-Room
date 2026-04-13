import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = (path.extname(file.name) || ".png").toLowerCase();
        const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".mp4"];

        if (!allowedExtensions.includes(ext)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, MP4 allowed." }, { status: 400 });
        }

        const filename = `upload-${uniqueSuffix}${ext}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) {
            // Ignore if dir exists
        }

        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error("Error saving file:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
