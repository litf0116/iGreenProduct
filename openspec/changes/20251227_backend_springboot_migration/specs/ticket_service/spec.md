# Ticket Service Specification

## Overview
Provide ticket management features including ticket CRUD and workflow control. Migrated from FastAPI implementation.

## ADDED Requirements

### Requirement: Get Ticket List
The system SHALL enable fetching all tickets from the database with optional filtering.

#### Scenario: Get all tickets

**Given** user is logged in
**When** calling `GET /api/tickets`
**Then** return all ticket list

### Requirement: Get Single Ticket
The system SHALL enable fetching a single ticket by its unique ID.

#### Scenario: Get existing ticket

**Given** user is logged in
**When** calling `GET /api/tickets/{ticketId}`
**Then** return ticket details

### Requirement: Create Ticket
The system SHALL enable creating new maintenance tickets assigned to engineers.

#### Scenario: Create new ticket

**Given** user is logged in
**And** template exists and assigned user exists
**When** calling `POST /api/tickets`
**Then** create new ticket with status open

### Requirement: Update Ticket
The system SHALL enable updating ticket information including status, priority, and workflow data.

#### Scenario: Update ticket

**Given** ticket exists
**When** calling `PUT /api/tickets/{ticketId}`
**Then** update specified fields

### Requirement: Delete Ticket
The system SHALL enable deleting tickets by the creator or administrators.

#### Scenario: Creator deletes ticket

**Given** current user is ticket creator
**When** calling `DELETE /api/tickets/{ticketId}`
**Then** delete ticket successfully

### Requirement: Accept Ticket
The system SHALL enable assigned engineers to accept tickets and start working on them.

#### Scenario: Assigned engineer accepts ticket

**Given** ticket is assigned to current engineer
**And** ticket status is open
**When** calling `POST /api/tickets/{ticketId}/accept`
**Then** ticket status changes to inProgress

### Requirement: Decline Ticket
The system SHALL enable assigned engineers to decline tickets with a reason.

#### Scenario: Assigned engineer declines ticket

**Given** ticket is assigned to current engineer
**And** ticket status is open
**When** calling `POST /api/tickets/{ticketId}/decline`
**And** decline reason is provided
**Then** ticket status changes to onHold

### Requirement: Cancel Ticket
The system SHALL enable ticket creators or administrators to cancel tickets.

#### Scenario: Creator cancels ticket

**Given** current user is ticket creator
**When** calling `POST /api/tickets/{ticketId}/cancel`
**And** cancel reason is provided
**Then** ticket status changes to cancelled
