# AmarVote Database ERD & Schema Documentation

## Entity Relationship Diagram (ERD)

This document describes the complete database schema and entity relationships for the AmarVote election monitoring system.

## Database Overview

AmarVote uses MongoDB as its primary database with the following main collections:
- **Users** - User accounts (Admin, Officer, Police)
- **Incidents** - Election incident reports
- **Votes** - Vote count submissions
- **PollingCenters** - Polling center information
- **PoliticalParties** - Political party data
- **AuditLogs** - System audit trail

## Entity Details

### 1. User Collection

**Purpose**: Manages all user accounts in the system

**Key Fields**:
- `username` (unique identifier)
- `password` (hashed)
- `name`, `email` (required)
- `phone`, `nid` (optional)
- `role` (Admin | Officer | Police)
- `status` (Active | Inactive | Pending)
- `location`, `thana` (geographic assignment)
- `pollingCenterId`, `pollingCenterName` (for Officers)
- `serviceId`, `rank` (for Police)
- `nidDocument` (base64 encoded document)

**Relationships**:
- One-to-Many with Incidents (reportedBy, assignedTo)
- One-to-Many with Votes (submittedBy, verifiedBy)
- One-to-One with PollingCenters (assignedOfficer)
- One-to-Many with AuditLogs (user field)

**Indexes**:
- Primary: `_id`
- Unique: `username`, `email`
- Compound: `nid` (with duplicate warning)

### 2. Incident Collection

**Purpose**: Tracks election-related incidents and issues

**Key Fields**:
- `title`, `description` (incident details)
- `severity` (Low | Medium | High | Critical)
- `status` (Reported | Under Investigation | Resolved | Dismissed)
- `location`, `thana`, `district` (geographic info)
- `pollingCenterId`, `pollingCenterName` (related center)
- `coordinates` (lat/lng for mapping)
- `reportedBy` (embedded user info)
- `assignedTo`, `assignedAt` (assignment tracking)
- `acknowledgedBy`, `acknowledgedAt` (acknowledgement)
- `resolvedBy`, `resolvedAt`, `resolutionNotes` (resolution)
- `notifyUsers`, `notifyRoles` (notification system)
- `priority`, `isRead`, `actionRequired` (notification flags)

**Relationships**:
- Many-to-One with Users (reportedBy.userId)
- Many-to-One with Users (assignedTo)
- Many-to-One with PollingCenters (pollingCenterId)

**Indexes**:
- Primary: `_id`
- Single: `status`, `severity`, `pollingCenterId`
- Compound: `reportedBy.userId`, `assignedTo`

### 3. Vote Collection

**Purpose**: Stores vote count submissions from polling centers

**Key Fields**:
- `pollingCenter`, `pollingCenterId`, `pollingCenterName`
- `location` (geographic info)
- `totalVotes`, `totalVoters` (vote counts)
- `submittedBy` (embedded officer info)
- `partyVotes` (simple key-value pairs)
- `partyVoteBreakdown` (detailed array with party info)
- `status` (submitted | verified | rejected)
- `verifiedBy`, `verifiedAt` (verification tracking)

**Relationships**:
- Many-to-One with Users (submittedBy.userId)
- Many-to-One with Users (verifiedBy.userId)
- Many-to-One with PollingCenters (pollingCenterId)
- References PoliticalParties (in partyVoteBreakdown)

**Indexes**:
- Primary: `_id`
- Single: `pollingCenter`, `pollingCenterId`, `status`
- Compound: `submittedBy.userId`

### 4. PollingCenter Collection

**Purpose**: Manages polling center information and vote submissions

**Key Fields**:
- `pollingCenterId` (unique identifier)
- `name`, `address` (basic info)
- `district`, `thana`, `division` (administrative divisions)
- `coordinates` (lat/lng for mapping)
- `totalRegisteredVoters` (capacity)
- `assignedOfficer` (embedded officer info)
- `status` (Active | Inactive | Pending Setup)
- `facilities[]` (available amenities)
- `accessibility` (boolean for disabled access)
- `pollingStartTime`, `pollingEndTime` (operating hours)
- `voteSubmission` (embedded submission data)
- `voteSubmissionHistory[]` (audit trail)

**Relationships**:
- One-to-One with Users (assignedOfficer.userId)
- One-to-Many with Votes (pollingCenterId)
- One-to-Many with Incidents (pollingCenterId)

**Indexes**:
- Primary: `_id`
- Unique: `pollingCenterId`
- Single: `district`, `thana`, `status`
- Geospatial: `coordinates` (2dsphere)

### 5. PoliticalParty Collection

**Purpose**: Stores political party information for elections

**Key Fields**:
- `partyId` (unique identifier)
- `name`, `symbol` (party identification)
- `symbolIcon` (visual representation)
- `color` (brand color)
- `leader` (party leader name)
- `established` (founding date)
- `description`, `manifesto` (party information)
- `website`, `logo` (digital assets)
- `registrationNumber` (official registration)
- `status` (Active | Inactive | Suspended)
- `totalSeats` (electoral performance)

**Relationships**:
- Referenced in Vote.partyVoteBreakdown
- Referenced in PollingCenter.voteSubmission.voteCounts

**Indexes**:
- Primary: `_id`
- Unique: `partyId`
- Single: `name`, `status`

### 6. AuditLog Collection

**Purpose**: Maintains system audit trail for all user actions

**Key Fields**:
- `user` (username performing action)
- `action` (type of action performed)
- `details` (detailed description)
- `ip` (IP address of user)
- `createdAt`, `updatedAt` (timestamps)

**Relationships**:
- Many-to-One with Users (user field references username)

**Indexes**:
- Primary: `_id`
- Single: `createdAt` (descending), `action`
- Compound: `user + createdAt` (descending)

## Data Flow Relationships

### User Registration & Authentication Flow
```
User Registration → User Collection
User Login → JWT Token Generation
User Actions → AuditLog Collection
```

### Incident Reporting Flow
```
User Reports Incident → Incident Collection
Incident Assignment → User.assignedTo
Incident Resolution → AuditLog Entry
```

### Vote Submission Flow
```
Officer Submits Votes → Vote Collection
Vote Verification → Vote.verifiedBy
Polling Center Update → PollingCenter.voteSubmission
Audit Trail → AuditLog Collection
```

### Geographic Hierarchy
```
Division → District → Thana → Polling Center
User Location Assignment
Incident Location Tracking
```

## Database Constraints & Validations

### User Constraints
- Username: Required, unique, lowercase, trimmed
- Email: Required, unique, valid format, comprehensive validation
- Password: Required, hashed with bcrypt
- Role: Enum validation (Admin | Officer | Police)
- Name: 3-50 characters, letters/spaces/dots only
- Phone: Optional, format validation
- NID: Optional, format validation

### Incident Constraints
- Title: Required, trimmed
- Severity: Enum (Low | Medium | High | Critical)
- Status: Enum (Reported | Under Investigation | Resolved | Dismissed)
- ReportedBy: Required embedded user info

### Vote Constraints
- PollingCenter: Required, indexed
- TotalVotes/TotalVoters: Required numbers
- Status: Enum (submitted | verified | rejected)
- SubmittedBy: Required embedded user info

### PollingCenter Constraints
- PollingCenterId: Required, unique
- Name: Required, trimmed
- Status: Enum (Active | Inactive | Pending Setup)
- Coordinates: 2dsphere geospatial index

## Security Features

### Data Protection
- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Audit trail for all actions

### Access Control
- Role-based permissions (Admin > Officer > Police)
- Geographic restrictions (users assigned to specific areas)
- Polling center officer assignments
- Incident assignment and ownership

### Data Integrity
- Unique constraints on critical fields
- Foreign key-like references via ObjectIds
- Embedded documents for related data
- Comprehensive validation schemas

## Performance Optimizations

### Indexing Strategy
- Primary indexes on all collections
- Unique indexes on identifier fields
- Compound indexes for common query patterns
- Geospatial indexes for location-based queries
- Time-based indexes for audit logs

### Query Optimization
- Embedded documents reduce join operations
- Strategic use of references vs. embedding
- Indexes aligned with common access patterns
- Pagination for large result sets

## Backup & Recovery

### Data Persistence
- MongoDB Atlas cloud hosting
- Automatic backups and point-in-time recovery
- Replica sets for high availability
- Connection pooling and retry logic

### Data Migration
- Seeding scripts for initial data
- User creation utilities
- Database schema validation
- Version control for schema changes

---

*This ERD documentation reflects the current database schema as of February 2026. The schema supports a complete election monitoring system with user management, incident tracking, vote collection, and comprehensive audit capabilities.*