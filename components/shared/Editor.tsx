"use client";

import React, { useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

const AdvancedQuillEditor: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = {
    toolbar: {
      container: [
        [{ 'font': [] }, { 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['direction', { 'align': [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean']
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            if (input.files && quillRef.current) {
              const file = input.files[0];
              const reader = new FileReader();
              reader.onload = () => {
                const quill = quillRef.current?.getEditor();
                const range = quill!.getSelection();
                quill!.insertEmbed(range?.index || 0, 'image', reader.result);
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    },
    clipboard: { matchVisual: false },
    history: { delay: 1000, maxStack: 50, userOnly: true }
  };

  const formats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'header', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video', 'formula'
  ];

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={setValue}
      modules={modules}
      formats={formats}
      theme="snow"
      placeholder="Write something advanced..."
    />
  );
};

export default AdvancedQuillEditor;
