# Firebase Schema Documentation

This document outlines the Firestore database schema used by the Collaborative Spreadsheet application.

## Collections Overview

The application uses three main Firestore collections:

1. **documents** - Spreadsheet metadata
2. **cells** - Individual cell data
3. **presence** - User presence tracking

---

## 1. Documents Collection

### Collection Path: `/documents`

Stores metadata about each spreadsheet document.

### Document Structure

```typescript
interface Document {
  id: string;                    // Auto-generated document ID
  title: string;                 // Document title (e.g., "Sales Q1 2024")
  owner: string;                 // User ID of the document owner
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last modification timestamp
}
```

### Example Document

```json
{
  "id": "doc_123456789",
  "title": "Monthly Budget",
  "owner": "user_abc123",
  "createdAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  },
  "updatedAt": {
    "_seconds": 1704153600,
    "_nanoseconds": 0
  }
}
```

### Indexes Required

For optimal query performance, create these composite indexes:

1. **Owner + UpdatedAt (descending)**
   - Used for: Fetching user's documents ordered by last modified
   - Collection: `documents`
   - Fields: `owner` (Ascending), `updatedAt` (Descending)

---

## 2. Cells Collection

### Collection Path: `/cells`

Stores individual cell data for all spreadsheets.

### Document Structure

```typescript
interface Cell {
  id: string;                    // Auto-generated cell ID
  docId: string;                 // Reference to parent document
  row: number;                   // Row index (0-based)
  col: number;                   // Column index (0-based)
  value: string;                 // Raw cell value (including formulas)
  computedValue?: string | number; // Evaluated result for formulas
  updatedBy: string;              // User ID who last modified the cell
  updatedAt: Timestamp;          // Last modification timestamp
}
```

### Example Cell Documents

```json
// Regular text cell
{
  "id": "cell_123456789",
  "docId": "doc_123456789",
  "row": 0,
  "col": 0,
  "value": "Sales Data",
  "computedValue": "Sales Data",
  "updatedBy": "user_abc123",
  "updatedAt": {
    "_seconds": 1704153600,
    "_nanoseconds": 0
  }
}

// Number cell
{
  "id": "cell_234567890",
  "docId": "doc_123456789",
  "row": 1,
  "col": 0,
  "value": "1500",
  "computedValue": 1500,
  "updatedBy": "user_abc123",
  "updatedAt": {
    "_seconds": 1704153600,
    "_nanoseconds": 0
  }
}

// Formula cell
{
  "id": "cell_345678901",
  "docId": "doc_123456789",
  "row": 5,
  "col": 0,
  "value": "=SUM(A1:A5)",
  "computedValue": 7500,
  "updatedBy": "user_def456",
  "updatedAt": {
    "_seconds": 1704157200,
    "_nanoseconds": 0
  }
}
```

### Indexes Required

1. **DocId (Ascending)**
   - Used for: Real-time cell updates for a specific document
   - Collection: `cells`
   - Fields: `docId` (Ascending)

---

## 3. Presence Collection

### Collection Path: `/presence`

Tracks active users currently editing documents.

### Document Structure

```typescript
interface Presence {
  id: string;                    // Auto-generated presence ID
  userId: string;                // User ID
  docId: string;                 // Document ID being edited
  name: string;                  // User display name
  color: string;                 // User's assigned color (hex)
  lastSeen: Timestamp;           // Last activity timestamp
}
```

### Example Presence Document

```json
{
  "id": "presence_123456789",
  "userId": "user_abc123",
  "docId": "doc_123456789",
  "name": "John Doe",
  "color": "#FF6B6B",
  "lastSeen": {
    "_seconds": 1704157200,
    "_nanoseconds": 0
  }
}
```

### Indexes Required

1. **DocId (Ascending)**
   - Used for: Real-time presence updates for a specific document
   - Collection: `presence`
   - Fields: `docId` (Ascending)

2. **UserId + DocId (Ascending)**
   - Used for: Finding and updating specific user presence
   - Collection: `presence`
   - Fields: `userId` (Ascending), `docId` (Ascending)

---

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Documents collection rules
    match /documents/{docId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.owner;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.owner;
    }
    
    // Cells collection rules
    match /cells/{cellId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.updatedBy;
    }
    
    // Presence collection rules
    match /presence/{presenceId} {
      allow read: if request.auth != null;
      allow write, create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## Data Lifecycle

### Document Creation
1. User creates new document
2. Document record created in `/documents` collection
3. User redirected to editor with new document ID

### Cell Updates
1. User edits cell value
2. Optimistic update applied locally
3. Debounced write to `/cells` collection
4. Real-time listeners update other clients

### Presence Management
1. User opens document → Presence record created/updated
2. Heartbeat updates every 5 seconds
3. Inactive users cleaned up after 30 seconds
4. User leaves → Presence record deleted

---

## Performance Considerations

### Query Optimization
- Use composite indexes for frequently queried fields
- Batch cell updates where possible
- Implement pagination for large datasets

### Data Modeling Decisions
- **Denormalization**: Cell data includes document ID for efficient queries
- **Separate Collections**: Documents and cells separated for scalability
- **Presence TTL**: Automatic cleanup prevents data bloat

### Scaling Strategy
- **Document Sharding**: For very large spreadsheets, consider cell range sharding
- **Caching**: Implement client-side caching for frequently accessed data
- **CDN**: Use Firebase Hosting with CDN for static assets

---

## Migration Notes

### Version 1.0 Schema
- Current schema as documented above
- No breaking changes expected

### Future Considerations
- **Cell Formatting**: Add formatting fields to cell documents
- **Version History**: Consider separate collection for change tracking
- **Permissions**: Add sharing and permission fields to documents

---

## Backup and Recovery

### Automated Backups
- Enable Firebase automatic backups
- Consider daily exports for critical data

### Data Recovery
- Use Firebase console for point-in-time recovery
- Implement export functionality for user-initiated backups

This schema provides a solid foundation for the collaborative spreadsheet application while maintaining flexibility for future enhancements.
