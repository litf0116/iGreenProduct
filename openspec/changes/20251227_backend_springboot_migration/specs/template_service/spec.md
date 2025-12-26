# Template Service Specification

## Overview
Provide template management features including template CRUD. Migrated from FastAPI implementation.

## ADDED Requirements

### Requirement: Get Template List
The system SHALL enable fetching all maintenance templates from the database.

#### Scenario: Get all templates

**Given** user is logged in
**When** calling `GET /api/templates`
**Then** return all template list

### Requirement: Get Single Template
The system SHALL enable fetching a single template by its unique ID.

#### Scenario: Get existing template

**Given** user is logged in
**When** calling `GET /api/templates/{templateId}`
**Then** return template details

### Requirement: Create Template
The system SHALL enable administrators and managers to create maintenance templates with steps and fields.

#### Scenario: Admin creates template

**Given** current user is admin or manager
**And** template name is unique
**When** calling `POST /api/templates`
**Then** create template with steps and fields

### Requirement: Update Template
The system SHALL enable updating template information including steps and fields.

#### Scenario: Admin updates template

**Given** current user is admin or manager
**And** template exists
**When** calling `PUT /api/templates/{templateId}`
**Then** update template name and description

### Requirement: Delete Template
The system SHALL enable administrators to delete templates that are not in use.

#### Scenario: Admin deletes template without tickets

**Given** current user is admin
**And** template has no tickets using it
**When** calling `DELETE /api/templates/{templateId}`
**Then** delete template successfully
