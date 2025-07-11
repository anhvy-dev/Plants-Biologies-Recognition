import React, { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function RichTextEditor({
  value,
  onChange,
  style,
  readOnly = false,
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        readOnly,
        modules: {
          toolbar: readOnly
            ? false
            : [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline"],
                ["link", "image"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["clean"],
              ],
        },
      });

      quillRef.current.on("text-change", () => {
        if (onChange) {
          onChange(quillRef.current.root.innerHTML);
        }
      });
    }
    // Set initial value or update when value prop changes
    if (
      quillRef.current &&
      value !== quillRef.current.root.innerHTML &&
      typeof value === "string"
    ) {
      quillRef.current.root.innerHTML = value;
    }
    // eslint-disable-next-line
  }, [value, readOnly]);

  return (
    <div
      ref={editorRef}
      style={{
        height: 200,
        ...style,
      }}
    />
  );
}
