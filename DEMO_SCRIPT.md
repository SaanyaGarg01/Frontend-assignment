# Sheetia Demo Script (2-3 Minutes)

## Intro (0:00 - 0:30)
"Hi, I'm the lead engineer on Sheetia, a high-performance collaborative spreadsheet built for Trademarkia. Today, I'll show you how Sheetia handles real-time sync, complex formulas, and multi-user presence."

**Visuals**: Show the Landing/Login screen, then click "Continue with Google".

## Dashboard (0:30 - 1:00)
"This is our modern dashboard. It's clean and efficient. I'll create a new spreadsheet. Notice the smooth transition and how it immediately persists to Firestore."

**Visuals**: Click "New Spreadsheet". Show the grid loading. Change the title in the toolbar to "Monthly Budget".

## Core Editing & Formulas (1:00 - 1:45)
"Sheetia's grid is built for speed. I can navigate with arrow keys, just like Excel. Let's enter some data. We support plain text, numbers, and custom formulas."

**Visuals**: 
- Type "Income" in A1, "1000" in B1.
- Type "Expenses" in A2, "400" in B2.
- Type "Profit" in A3, and in B3 type `=B1-B2`.
- Show the computed value appearing instantly.
- Change B1 to "1200" and show B3 updating automatically.
- Demo `=SUM(B1:B2)`.

## Real-time Collaboration (1:45 - 2:30)
"The real magic happens when multiple people join. I've opened the same doc in two windows. Watch the presence indicators in the top bar."

**Visuals**: 
- Split screen with two browser windows.
- Move the cursor in Window A; see the presence tooltip update in Window B.
- Type in Window A; see the text appear in Window B with zero lag.
- Demonstrate column resizing in one window and see it update (local widths per user, or shared state if preferred).

## Final Technical Overview (2:30 - 3:00)
"Technically, we're using Next.js 14 with optimistic UI updates. Every cell is its own component using React.memo for performance. Formula parsing uses a recursive evaluation engine with circular dependency detection. This ensures Sheetia remains fast even with large datasets."

**Visuals**: Quick scroll through the file structure (`/hooks`, `/lib/formulaParser.ts`, etc.).

## Outro
"Thanks for watching the Sheetia demo. A production-ready solution for modern spreadsheet collaboration."
