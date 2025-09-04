import {
  Calendar,
  CheckSquare,
  FileText,
  Lightbulb,
  Star,
  Target,
} from "lucide-react";

export const documentTemplates = [
  {
    name: "Blank Document",
    icon: FileText,
    emoji: "📄",
    content: "<p>Start writing your document...</p>",
    title: "Untitled Document",
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
    title: "Meeting Notes - " + new Date().toLocaleDateString(),
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
    title: "Project Plan",
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
    title: "Brainstorming Session",
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
    title: "Task List",
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
    title: "Daily Journal - " + new Date().toLocaleDateString(),
  },
];
