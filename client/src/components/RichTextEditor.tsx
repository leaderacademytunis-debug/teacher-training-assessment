import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useEffect, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignRight, AlignCenter, AlignLeft, AlignJustify,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Heading1, Heading2, Heading3, Palette, Highlighter,
  Maximize, Minimize, Type, Code, Trash2, Plus,
  Columns2, RowsIcon, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  darkMode?: boolean;
}

const COLORS = [
  "#000000","#434343","#666666","#999999","#B7B7B7","#CCCCCC","#D9D9D9","#EFEFEF","#F3F3F3","#FFFFFF",
  "#980000","#FF0000","#FF9900","#FFFF00","#00FF00","#00FFFF","#4A86E8","#0000FF","#9900FF","#FF00FF",
  "#E6B8AF","#F4CCCC","#FCE5CD","#FFF2CC","#D9EAD3","#D0E0E3","#C9DAF8","#CFE2F3","#D9D2E9","#EAD1DC",
  "#DD7E6B","#EA9999","#F9CB9C","#FFE599","#B6D7A8","#A2C4C9","#A4C2F4","#9FC5E8","#B4A7D6","#D5A6BD",
  "#CC4125","#E06666","#F6B26B","#FFD966","#93C47D","#76A5AF","#6D9EEB","#6FA8DC","#8E7CC3","#C27BA0",
];

const HIGHLIGHT_COLORS = [
  "#FFFF00","#00FF00","#00FFFF","#FF00FF","#FF6600","#FF0000","#0000FF","#9900FF",
];

export default function RichTextEditor({
  content, onChange, placeholder = "ابدأ بكتابة المحتوى هنا...",
  className, minHeight = "300px", darkMode = true,
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: "right" }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded-lg mx-auto" } }),
      Color, TextStyle,
      Table.configure({ resizable: true }), TableRow, TableCell, TableHeader,
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: true }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose max-w-none focus:outline-none px-4 py-3",
          darkMode ? "prose-invert text-white" : "text-gray-900"
        ),
        dir: "rtl",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => { onChange(e.getHTML()); },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setLinkUrl("");
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
  }, [editor, imageUrl]);

  if (!editor) return null;

  const bg = darkMode ? "bg-slate-800" : "bg-white";
  const toolbarBg = darkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200";
  const btnText = darkMode ? "text-slate-300" : "text-gray-600";
  const dividerColor = darkMode ? "bg-slate-600" : "bg-gray-300";
  const borderColor = darkMode ? "border-slate-700" : "border-gray-200";
  const popBg = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const inputBg = darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900";

  const TB = ({ onClick, isActive = false, children, title, disabled = false }: {
    onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string; disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200",
        isActive && "bg-blue-600 text-white", disabled && "opacity-40 cursor-not-allowed",
        !isActive && !disabled && btnText)}>
      {children}
    </button>
  );

  const Div = () => <div className={cn("w-px h-6 mx-1", dividerColor)} />;

  return (
    <div className={cn("border rounded-lg overflow-hidden", borderColor, bg,
      isFullscreen && "fixed inset-0 z-50 rounded-none border-0", className)}>
      {/* Toolbar */}
      <div className={cn("border-b p-1.5 flex flex-wrap items-center gap-0.5 sticky top-0 z-10", toolbarBg)}>
        <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="تراجع"><Undo className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="إعادة"><Redo className="h-4 w-4" /></TB>
        <Div />
        <TB onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive("paragraph") && !editor.isActive("heading")} title="نص عادي"><Type className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="عنوان 1"><Heading1 className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="عنوان 2"><Heading2 className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="عنوان 3"><Heading3 className="h-4 w-4" /></TB>
        <Div />
        <TB onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="خط عريض"><Bold className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="خط مائل"><Italic className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="خط تحتي"><UnderlineIcon className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="خط يتوسطه"><Strikethrough className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="كود"><Code className="h-4 w-4" /></TB>
        <Div />
        {/* Text Color */}
        <Popover><PopoverTrigger asChild>
          <button type="button" title="لون النص" className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200", btnText)}>
            <Palette className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-64 p-3", popBg)}>
          <Label className="text-xs text-slate-400 mb-2 block">لون النص</Label>
          <div className="grid grid-cols-10 gap-1">
            {COLORS.map((c) => (<button key={c} type="button" className="w-5 h-5 rounded border border-slate-600 hover:scale-125 transition-transform" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().setColor(c).run()} />))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-slate-400" onClick={() => editor.chain().focus().unsetColor().run()}>إزالة اللون</Button>
        </PopoverContent></Popover>
        {/* Highlight */}
        <Popover><PopoverTrigger asChild>
          <button type="button" title="تمييز" className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200", editor.isActive("highlight") ? "bg-yellow-600 text-white" : btnText)}>
            <Highlighter className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-48 p-3", popBg)}>
          <Label className="text-xs text-slate-400 mb-2 block">لون التمييز</Label>
          <div className="grid grid-cols-4 gap-2">
            {HIGHLIGHT_COLORS.map((c) => (<button key={c} type="button" className="w-8 h-8 rounded border border-slate-600 hover:scale-110 transition-transform" style={{ backgroundColor: c }} onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} />))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-slate-400" onClick={() => editor.chain().focus().unsetHighlight().run()}>إزالة التمييز</Button>
        </PopoverContent></Popover>
        <Div />
        {/* Alignment */}
        <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="محاذاة لليمين"><AlignRight className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="توسيط"><AlignCenter className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="محاذاة لليسار"><AlignLeft className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })} title="ضبط"><AlignJustify className="h-4 w-4" /></TB>
        <Div />
        {/* Lists */}
        <TB onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="قائمة نقطية"><List className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="قائمة مرقمة"><ListOrdered className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="اقتباس"><Quote className="h-4 w-4" /></TB>
        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="خط فاصل"><Minus className="h-4 w-4" /></TB>
        <Div />
        {/* Link */}
        <Popover><PopoverTrigger asChild>
          <button type="button" title="رابط" className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200", editor.isActive("link") ? "bg-blue-600 text-white" : btnText)}>
            <LinkIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-72 p-3", popBg)}>
          <Label className="text-xs text-slate-400 mb-2 block">أدخل الرابط</Label>
          <div className="flex gap-2">
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className={cn("text-sm", inputBg)} dir="ltr" onKeyDown={(e) => e.key === "Enter" && addLink()} />
            <Button size="sm" onClick={addLink} className="bg-blue-600 hover:bg-blue-700">إضافة</Button>
          </div>
          {editor.isActive("link") && <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-red-400" onClick={() => editor.chain().focus().unsetLink().run()}><X className="h-3 w-3 ml-1" /> إزالة الرابط</Button>}
        </PopoverContent></Popover>
        {/* Image */}
        <Popover><PopoverTrigger asChild>
          <button type="button" title="صورة" className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200", btnText)}>
            <ImageIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-72 p-3", popBg)}>
          <Label className="text-xs text-slate-400 mb-2 block">رابط الصورة</Label>
          <div className="flex gap-2">
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://...image.jpg" className={cn("text-sm", inputBg)} dir="ltr" onKeyDown={(e) => e.key === "Enter" && addImage()} />
            <Button size="sm" onClick={addImage} className="bg-blue-600 hover:bg-blue-700">إدراج</Button>
          </div>
        </PopoverContent></Popover>
        {/* Table */}
        <Popover><PopoverTrigger asChild>
          <button type="button" title="جدول" className={cn("p-1.5 rounded-md transition-colors", darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200", editor.isActive("table") ? "bg-blue-600 text-white" : btnText)}>
            <TableIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-48 p-2", popBg)}>
          <div className="space-y-1">
            <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm rounded flex items-center gap-2", darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <Plus className="h-3.5 w-3.5" /> إدراج جدول 3×3
            </button>
            {editor.isActive("table") && (<>
              <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm rounded flex items-center gap-2", darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100")} onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <Columns2 className="h-3.5 w-3.5" /> إضافة عمود
              </button>
              <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm rounded flex items-center gap-2", darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100")} onClick={() => editor.chain().focus().addRowAfter().run()}>
                <RowsIcon className="h-3.5 w-3.5" /> إضافة صف
              </button>
              <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm rounded flex items-center gap-2", darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100")} onClick={() => editor.chain().focus().deleteColumn().run()}>
                <Columns2 className="h-3.5 w-3.5 text-red-400" /> حذف عمود
              </button>
              <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm rounded flex items-center gap-2", darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100")} onClick={() => editor.chain().focus().deleteRow().run()}>
                <RowsIcon className="h-3.5 w-3.5 text-red-400" /> حذف صف
              </button>
              <button type="button" className={cn("w-full text-right px-2 py-1.5 text-sm text-red-400 rounded flex items-center gap-2", darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100")} onClick={() => editor.chain().focus().deleteTable().run()}>
                <Trash2 className="h-3.5 w-3.5" /> حذف الجدول
              </button>
            </>)}
          </div>
        </PopoverContent></Popover>
        <Div />
        <TB onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "تصغير" : "ملء الشاشة"}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </TB>
      </div>

      {/* Editor Content */}
      <div className={cn("overflow-y-auto", isFullscreen ? "h-[calc(100vh-52px)]" : "")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
