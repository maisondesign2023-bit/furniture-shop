"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import CustomImage from "@/lib/tiptap-image";
import { createClient } from "@/lib/supabase/client";

export default function RichTextEditor({
  name,
  initialValue,
  bucket,
}: {
  name: string;
  initialValue?: string;
  bucket: string;
}) {
  const supabase = createClient();
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialValue || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
    editorProps: {
      attributes: {
        class: "ProseMirror min-h-[240px] p-4 focus:outline-none",
      },
    },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl } as any).run();
      if (hiddenInputRef.current) hiddenInputRef.current.value = editor.getHTML();
    }
    setUploading(false);
    e.target.value = "";
  }

  function setImageWidth(width: string) {
    editor?.chain().focus().updateAttributes("image", { width }).run();
    if (hiddenInputRef.current && editor) hiddenInputRef.current.value = editor.getHTML();
  }

  function setImageAlign(align: string) {
    editor?.chain().focus().updateAttributes("image", { align }).run();
    if (hiddenInputRef.current && editor) hiddenInputRef.current.value = editor.getHTML();
  }

  if (!editor) return null;

  const isImageSelected = editor.isActive("image");

  return (
    <div>
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={initialValue || ""} />

      <div className="mb-2 flex flex-wrap items-center gap-1 border border-line bg-surface p-2">
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          粗體
        </ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          斜體
        </ToolButton>
        <ToolButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          標題
        </ToolButton>
        <ToolButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          清單
        </ToolButton>

        <Divider />

        <ToolButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          文字置左
        </ToolButton>
        <ToolButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          文字置中
        </ToolButton>
        <ToolButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          文字置右
        </ToolButton>

        <Divider />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border border-line bg-white px-3 py-1.5 font-mono text-xs hover:border-brass disabled:opacity-50"
        >
          {uploading ? "上傳中…" : "＋插入圖片"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {isImageSelected && (
          <>
            <Divider />
            <span className="font-mono text-xs text-muted">圖片大小：</span>
            <ToolButton onClick={() => setImageWidth("25%")}>小</ToolButton>
            <ToolButton onClick={() => setImageWidth("50%")}>中</ToolButton>
            <ToolButton onClick={() => setImageWidth("75%")}>大</ToolButton>
            <ToolButton onClick={() => setImageWidth("100%")}>滿版</ToolButton>
            <Divider />
            <span className="font-mono text-xs text-muted">圖片位置：</span>
            <ToolButton onClick={() => setImageAlign("left")}>置左</ToolButton>
            <ToolButton onClick={() => setImageAlign("center")}>置中</ToolButton>
            <ToolButton onClick={() => setImageAlign("right")}>置右</ToolButton>
          </>
        )}
      </div>

      <div className="rich-content border border-line bg-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 font-mono text-xs ${
        active ? "border-brass bg-walnut text-white" : "border-line bg-white hover:border-brass"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" />;
}
