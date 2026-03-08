# Sheetia - Feature Implementation Guide

## 🎯 Core Features Implemented

### 1. **Document Dashboard** ✅
A home screen listing existing documents with their metadata.

**Features:**
- Lists all user's documents with:
  - Document title
  - Last modified timestamp
  - Owner information
- Create new documents with `+ New Spreadsheet` button
- Real-time sync - documents list updates as other users create/modify documents
- Authentication-based access (Google OAuth)
- Loading states with skeleton screens

**Location:** `/dashboard` route

---

### 2. **The Editor** ✅
A scrollable grid-based spreadsheet with full editing capabilities.

**Grid Features:**
- **Grid Structure:**
  - Rows numbered (1-50)
  - Columns lettered (A-Z)
  - 1,300 total editable cells
  
- **Editable Cells:**
  - Click to select
  - Double-click to edit
  - Type to start typing (auto-enter edit mode)
  - Escape to cancel
  - Enter to confirm and move down
  - Tab to move right (Shift+Tab for left)

- **Arrow Key Navigation:**
  - Up/Down/Left/Right arrows to navigate
  - Automatic grid scrolling with selected cell

#### **Formula Engine** 🧮
Comprehensive formula support with multiple functions:

**Supported Functions:**
- `=SUM(A1:A5)` - Sum all numbers in range
- `=AVERAGE(A1:A5)` or `=AVG(A1:A5)` - Calculate average
- `=MAX(A1:A5)` - Find maximum value
- `=MIN(A1:A5)` - Find minimum value
- `=COUNT(A1:A5)` - Count non-empty cells
- Basic arithmetic: `=A1+B1`, `=C1*D1`, `=(A1+B1)/C1`, etc.

**Formula Features:**
- Formula indicator (small triangle in corner of cell with formula)
- Error handling with `#ERROR` display for invalid formulas
- Circular dependency detection
- Real-time computation
- Formula syntax helper in formula bar

**Design Justification:**
- Chose regex-based parsing for simplicity and flexibility
- Avoided `eval()` for security - use limited `Function` constructor
- Support for ranges with colon notation (A1:A5)
- Recursive resolution with visited set prevents infinite loops

#### **Real-Time Sync** 🔄
**Sync Features:**
- Firestore real-time listeners on all cells
- Optimistic UI updates (instant local feedback)
- Write state indicator:
  - `Saving...` (blue dot, pulsing)
  - `Saved` (green checkmark)
  - `Working Offline` (amber warning)
  - `Save Error` (red warning)
- Automatic retry on network recovery
- Background synchronization without blocking UI

**Status Location:** Top-right of editor, status bar at bottom

---

### 3. **User Presence** 👥
Multiple users in the same document see each other and their activity.

**Presence Features:**
- Live user indicators showing:
  - Avatar or initials circle (color-coded per user)
  - User count at top-right
  - Currently editing indicator (animated pulse)
- Cursor Position Tracking:
  - Hover on user avatar shows tooltip
  - Displays which cell user is currently editing
  - Example: "Alice (Cell B3)"
- Automatic cleanup when user leaves
- 2-minute timeout for inactive users
- 30-second heartbeat to keep presence alive
- Smooth animations for join/leave

**Presence Bar:** Top-right corner of editor

---

## 🎨 Bonus Features

### **Cell Formatting** 🎨
Format individual cells with rich text options.

**Formatting Options:**
- **Bold** - Toggle bold text
- **Italic** - Toggle italic text
- **Text Alignment:**
  - `Left` (default)
  - `Center`
  - `Right`
- **Text Color** - 10-color palette picker
  - Range: Black, White, Red, Green, Blue, Pink, Cyan, Gold, Orange, Crimson
- **Background Color** - 10-color palette picker
  - Transparent colors (20% opacity) for visibility

**Persists:** Formatting saved to Firestore and synced across sessions

**Location:** Top toolbar below title/export area

---

### **Column/Row Resize** 📏
Drag to resize columns and rows.

**Column Resizing:**
- Hover over column header to reveal resize handle (right edge)
- Drag to increase/decrease width
- Minimum width: 50px

**Row Resizing:**
- Hover over row header to reveal resize handle (bottom edge)
- Drag to increase/decrease height
- Minimum height: 24px

**Behavior:**
- Changes are immediate and visual
- Adjusts grid layout responsively
- Smooth dragging interaction

---

### **Column/Row Reordering** 🔄 (BONUS)
Reorder columns and rows by dragging.

**How to Use:**
- Click and drag column header to move column
- Click and drag row header to move row
- Drop target highlighted in blue during drag
- Relink cell references automatically in formulas

**Visual Feedback:**
- Drag-over target highlighted
- Smooth animations on reorder
- Cursor changes to indicate draggable area

---

### **Keyboard Navigation** ⌨️
Full keyboard support for spreadsheet navigation.

**Keyboard Shortcuts:**
- `Arrow Keys` - Navigate between cells
- `Tab` - Move right
- `Shift+Tab` - Move left
- `Enter` - Enter edit mode / Confirm edit (move down)
- `Escape` - Cancel edit
- `Backspace`/`Delete` - Clear cell content
- `Any Letter/Number` - Start typing (auto-enter edit mode)

**Formula Bar:**
- `Enter` - Confirm formula
- `Escape` - Cancel formula edit

---

### **Export Support** 📤
Export your spreadsheet to multiple formats.

**Export Formats:**
- **CSV** (.csv) - Compatible with Excel, Google Sheets
  - Standard comma-separated values
  - Quoted values to handle special characters
- **JSON** (.json) - Programmatic access
  - Includes cell values, formulas, and formatting
  - Easy to import into other tools
- **HTML** (.html) - Web-ready format
  - Table-based layout
  - Preserves formatting (bold, italic, colors)
  - Can be opened in any browser
- **Excel** (.xls) - Native Excel format
  - XML-based Excel format
  - Preserves numeric types
  - Compatible with Microsoft Excel, LibreOffice

**Export Button:** Top-right toolbar with dropdown menu

---

## 🔧 Technical Implementation Details

### **State Management**
- **Firebase Firestore:** Primary data store
- **React Hooks:** Local state management
  - `useDocument` - Cell data sync
  - `usePresence` - User presence tracking
  - `useAuth` - User authentication
  - `useActivity` - Document activity log

### **Real-Time Architecture**
1. Firestore listeners update React state
2. Optimistic updates applied immediately
3. Background sync tracks write state
4. Automatic retry on failures
5. Offline support with local state

### **Formula Parsing**
- **Parser:** Regex-based cell reference detection
- **Evaluator:** Safe Function constructor for math
- **Range Handler:** Supports ranges with colon notation
- **Circular Detection:** Visited set prevents infinite loops
- **Type Coercion:** Automatic number parsing

### **UI Enhancements**
- **Framer Motion:** Smooth animations on presence/activities
- **Tailwind CSS:** Responsive, modern styling
- **Custom Grid:** CSS Grid with dynamic sizing
- **Drag & Drop:** HTML5 drag API for column/row reordering

---

## 📋 Data Persistence

### **Firestore Collections**

#### **documents**
```json
{
  "title": "Sales Data Q1 2024",
  "ownerId": "user_123",
  "ownerName": "Alice",
  "createdAt": "2024-03-08T10:30:00Z",
  "updatedAt": "2024-03-08T15:45:30Z"
}
```

#### **cells** (ID: docId_row_col)
```json
{
  "docId": "doc_123",
  "row": 0,
  "col": 0,
  "value": "=SUM(A2:A5)",
  "computedValue": 1250,
  "format": {
    "bold": true,
    "italic": false,
    "textAlign": "center",
    "color": "#000000",
    "backgroundColor": "#FFD700"
  },
  "updatedBy": "user_123",
  "updatedAt": "2024-03-08T15:45:30Z"
}
```

#### **presence** (ID: docId_userId)
```json
{
  "userId": "user_123",
  "docId": "doc_123",
  "name": "Alice",
  "color": "#E91E63",
  "photoURL": "https://...",
  "lastSeen": "2024-03-08T16:05:00Z",
  "cursor": {
    "row": 3,
    "col": 1
  }
}
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- Firebase project setup
- Google OAuth credentials

### **Installation**
```bash
npm install
npm run dev
```

### **Environment Variables**
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🎓 Design Decisions

### **Why This Formula Parser?**
- Regex parsing is simpler than building a full AST
- Supports most common spreadsheet functions
- Prevents code injection by avoiding `eval()`
- Range syntax (A1:A5) is intuitive for users

### **Why Firestore?**
- Real-time synchronization out of the box
- Automatic offline support with caching
- Scales to millions of concurrent users
- Built-in security rules

### **Why Optimistic UI?**
- Users feel instant responsiveness
- Network latency is masked
- Better UX even on slow connections
- Automatic conflict resolution via Firestore

---

## 🐛 Known Limitations

1. **Grid Size:** Fixed 50 rows × 26 columns
2. **Formula Nesting:** Limited to one level of nesting
3. **Excel/XLS:** Simplified format (not full XLSX)
4. **Undo/Redo:** Not implemented (Firestore maintains history)
5. **Named Ranges:** Not supported
6. **Conditional Formatting:** Not implemented

---

## ✅ Feature Checklist

- ✅ Document Dashboard
- ✅ Spreadsheet Grid Editor
- ✅ Editable Cells
- ✅ Formula Support (SUM, AVERAGE, MAX, MIN, COUNT)
- ✅ Real-Time Sync
- ✅ Write State Indicator
- ✅ User Presence
- ✅ Cell Formatting (Bold, Italic, Color, Align)
- ✅ Column Resize
- ✅ Row Resize
- ✅ Column Reordering
- ✅ Row Reordering
- ✅ Keyboard Navigation
- ✅ Export to CSV
- ✅ Export to JSON
- ✅ Export to HTML
- ✅ Export to Excel

---

## 📞 Support

For issues or feature requests, check the GitHub issues page or contact the development team.
