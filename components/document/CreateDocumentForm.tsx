"use client"

import { FC, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  CheckSquare,
  Calendar,
  FileText,
  Target,
  Lightbulb,
  ArrowLeft,
  Star,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Palette,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";

const CreateDocumentForm: FC = () => {
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📝");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Custom emoji categories
  const emojiCategories = {
    "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
    "Objects": ["📝", "📖", "📊", "📈", "💡", "🎯", "🚀", "⭐", "💼", "🔥", "🎨", "📷", "🎵", "🎮", "💻", "📱"],
    "Nature": ["🌟", "🌈", "🦄", "🌸", "🌺", "🌻", "🌷", "🌹", "🍀", "🌿", "🌱", "🌳", "🌲", "🏔️", "⛰️", "🌊"],
    "Food": ["☕", "🍎", "🍌", "🍓", "🍇", "🍑", "🥝", "🍅", "🥕", "🌽", "🥒", "🍞", "🧀", "🍕", "🍔", "🍟"],
    "Activities": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹"],
    "Symbols": ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖"]
  };

  // Mock background images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
    "https://images.unsplash.com/photo-1497436072909-f5e92c2b7b20?w=800&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
  ];

  // Color palette
  const colors = [
    "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6",
    "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
    "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#C026D3", "#DB2777", "#E11D48", "#DC2626"
  ];

  // Document templates with content
  const documentTemplates = [
    { 
      name: "Blank Document", 
      icon: FileText, 
      emoji: "📄",
      content: "<p>Start writing your document...</p>",
      title: "Untitled Document"
    },
    { 
      name: "Meeting Notes", 
      icon: Calendar, 
      emoji: "📅",
      content: `
        <h1>Meeting Notes</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Attendees:</strong> </p>
        <p><strong>Agenda:</strong></p>
        <ul>
          <li>Topic 1</li>
          <li>Topic 2</li>
          <li>Topic 3</li>
        </ul>
        <h2>Discussion Points</h2>
        <p>Add discussion notes here...</p>
        <h2>Action Items</h2>
        <ul>
          <li>☐ Action item 1</li>
          <li>☐ Action item 2</li>
        </ul>
      `,
      title: "Meeting Notes - " + new Date().toLocaleDateString()
    },
    { 
      name: "Project Plan", 
      icon: Target, 
      emoji: "🎯",
      content: `
        <h1>Project Plan</h1>
        <h2>Project Overview</h2>
        <p><strong>Project Name:</strong> </p>
        <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>End Date:</strong> </p>
        <p><strong>Project Manager:</strong> </p>
        
        <h2>Objectives</h2>
        <ul>
          <li>Primary objective</li>
          <li>Secondary objective</li>
        </ul>
        
        <h2>Milestones</h2>
        <ol>
          <li>Phase 1 completion</li>
          <li>Phase 2 completion</li>
          <li>Final delivery</li>
        </ol>
        
        <h2>Resources</h2>
        <p>List required resources, team members, and budget.</p>
      `,
      title: "Project Plan"
    },
    { 
      name: "Brainstorming", 
      icon: Lightbulb, 
      emoji: "💡",
      content: `
        <h1>Brainstorming Session</h1>
        <p><strong>Topic:</strong> </p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Ideas</h2>
        <ul>
          <li>💡 Idea 1</li>
          <li>💡 Idea 2</li>
          <li>💡 Idea 3</li>
        </ul>
        
        <h2>Best Ideas</h2>
        <ol>
          <li>⭐ Top idea</li>
          <li>⭐ Second best</li>
        </ol>
        
        <h2>Next Steps</h2>
        <p>What actions need to be taken based on this brainstorming session?</p>
      `,
      title: "Brainstorming Session"
    },
    { 
      name: "Task List", 
      icon: CheckSquare, 
      emoji: "✅",
      content: `
        <h1>Task List</h1>
        <p><strong>Project:</strong> </p>
        <p><strong>Due Date:</strong> </p>
        
        <h2>High Priority</h2>
        <ul>
          <li>🔴 Urgent task 1</li>
          <li>🔴 Urgent task 2</li>
        </ul>
        
        <h2>Medium Priority</h2>
        <ul>
          <li>🟡 Important task 1</li>
          <li>🟡 Important task 2</li>
        </ul>
        
        <h2>Low Priority</h2>
        <ul>
          <li>🟢 Task 1</li>
          <li>🟢 Task 2</li>
        </ul>
        
        <h2>Completed</h2>
        <ul>
          <li>✅ Completed task example</li>
        </ul>
      `,
      title: "Task List"
    },
    { 
      name: "Daily Journal", 
      icon: Star, 
      emoji: "⭐",
      content: `
        <h1>Daily Journal</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Today's Goals</h2>
        <ul>
          <li>Goal 1</li>
          <li>Goal 2</li>
          <li>Goal 3</li>
        </ul>
        
        <h2>What Happened Today</h2>
        <p>Write about the events, experiences, and thoughts from today...</p>
        
        <h2>Grateful For</h2>
        <ul>
          <li>🙏 Something I'm grateful for</li>
          <li>🙏 Another thing I appreciate</li>
        </ul>
        
        <h2>Tomorrow's Focus</h2>
        <p>What do I want to focus on tomorrow?</p>
        
        <h2>Reflection</h2>
        <p>How am I feeling? What did I learn today?</p>
      `,
      title: "Daily Journal - " + new Date().toLocaleDateString()
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setShowBackgroundPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (template: typeof documentTemplates[0]) => {
    setDocumentTitle(template.title);
    setSelectedEmoji(template.emoji);
    setEditorContent(template.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
    }
  };

  const handleSaveDocument = () => {
    const documentData = {
      title: documentTitle || "Untitled Document",
      emoji: selectedEmoji,
      backgroundImage,
      content: editorContent,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving document:', documentData);
    alert('Document saved successfully!');
  };

  const handleBackToDashboard = () => {
    console.log('Navigating back to dashboard');
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback navigation - you can replace with your router
      window.location.href = '/dashboard';
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertElement = (elementType: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    let element: HTMLElement;

    switch (elementType) {
      case 'h1':
        element = document.createElement('h1');
        element.textContent = 'Heading 1';
        element.style.fontSize = '2rem';
        element.style.fontWeight = 'bold';
        element.style.margin = '1rem 0';
        break;
      case 'h2':
        element = document.createElement('h2');
        element.textContent = 'Heading 2';
        element.style.fontSize = '1.5rem';
        element.style.fontWeight = 'bold';
        element.style.margin = '0.8rem 0';
        break;
      case 'h3':
        element = document.createElement('h3');
        element.textContent = 'Heading 3';
        element.style.fontSize = '1.2rem';
        element.style.fontWeight = 'bold';
        element.style.margin = '0.6rem 0';
        break;
      case 'blockquote':
        element = document.createElement('blockquote');
        element.textContent = 'Quote text';
        element.style.borderLeft = '4px solid #e5e7eb';
        element.style.paddingLeft = '1rem';
        element.style.margin = '1rem 0';
        element.style.fontStyle = 'italic';
        element.style.color = '#6b7280';
        break;
      case 'code':
        element = document.createElement('code');
        element.textContent = 'Code block';
        element.style.background = '#f3f4f6';
        element.style.padding = '0.2rem 0.4rem';
        element.style.borderRadius = '4px';
        element.style.fontFamily = 'monospace';
        break;
      default:
        return;
    }

    range.deleteContents();
    range.insertNode(element);
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Background Image */}
      <AnimatePresence>
        {backgroundImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.3)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`relative z-10 p-6 ${backgroundImage ? 'text-white' : ''}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors border backdrop-blur-sm bg-background/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </motion.button>
              <h1 className="text-2xl font-bold">Create New Document</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="p-2 rounded-lg hover:bg-accent/60 transition-colors backdrop-blur-sm bg-background/20"
              >
                {showToolbar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveDocument}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Document</span>
              </motion.button>
            </div>
          </div>

          {/* Document Header */}
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 mb-6 border">
            {/* Emoji and Background Controls */}
            <div className="flex items-center space-x-4 mb-6">
              {/* Emoji Picker */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-4xl p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {selectedEmoji}
                </motion.button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full left-0 mt-2 p-4 bg-popover border rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-y-auto"
                    >
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category} className="mb-4">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                          <div className="grid grid-cols-8 gap-2">
                            {emojis.map((emoji, index) => (
                              <motion.button
                                key={`${category}-${index}`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedEmoji(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="text-2xl p-1 rounded hover:bg-accent transition-colors"
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Background Image Picker */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span>Background</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showBackgroundPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full left-0 mt-2 p-4 bg-popover border rounded-lg shadow-lg z-20 min-w-[300px]"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {backgroundImages.map((img, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => {
                              setBackgroundImage(img);
                              setShowBackgroundPicker(false);
                            }}
                            className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="w-full flex items-center justify-center space-x-2 p-2 border border-dashed rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Upload Custom Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        
                        {backgroundImage && (
                          <button
                            onClick={() => {
                              setBackgroundImage("");
                              setShowBackgroundPicker(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove Background</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Document Title */}
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-muted-foreground"
            />
          </div>
        </div>
      </motion.div>

      {/* Editor Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background/95 backdrop-blur-sm rounded-xl border overflow-hidden mb-6"
        >
          {/* Custom Toolbar */}
          <AnimatePresence>
            {showToolbar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b bg-background/50 backdrop-blur-sm p-4"
              >
                <div className="flex items-center flex-wrap gap-2">
                  {/* Text Formatting */}
                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button
                      onClick={() => formatText('bold')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('underline')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Headings */}
                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button
                      onClick={() => insertElement('h1')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertElement('h2')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertElement('h3')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lists and Blocks */}
                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button
                      onClick={() => formatText('insertUnorderedList')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('insertOrderedList')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertElement('blockquote')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertElement('code')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button
                      onClick={() => formatText('justifyLeft')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('justifyCenter')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('justifyRight')}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Color Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="p-2 rounded hover:bg-accent transition-colors"
                      title="Text Color"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute top-full left-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-30"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {colors.map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  setSelectedColor(color);
                                  formatText('foreColor', color);
                                  setShowColorPicker(false);
                                }}
                                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Rich Text Editor */}
          <div className="p-6">
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] outline-none text-foreground leading-relaxed prose prose-lg max-w-none"
              style={{ fontSize: '16px', lineHeight: '1.6' }}
              onInput={handleEditorChange}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
              }}
              suppressContentEditableWarning={true}
            >
              <p className="text-muted-foreground">Start typing to create your document...</p>
            </div>
          </div>
        </motion.div>

        {/* Document Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h3 className={`text-lg font-semibold mb-4 ${backgroundImage ? 'text-white' : ''}`}>
            Quick Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {documentTemplates.map((template, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateSelect(template)}
                className="p-4 bg-background/95 backdrop-blur-sm border rounded-lg hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{template.emoji}</span>
                  <template.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with a {template.name.toLowerCase()} template
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateDocumentForm;