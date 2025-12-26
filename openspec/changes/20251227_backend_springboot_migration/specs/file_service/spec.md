# File Service Specification

## Overview
Provide file upload and delete features. Migrated from FastAPI implementation.

## ADDED Requirements

### Requirement: Upload File
The system SHALL enable authenticated users to upload files with size validation.

#### Scenario: Successfully upload image file

**Given** user is logged in
**And** file size does not exceed 10MB
**When** calling `POST /api/files/upload`
**Then** save file to upload directory
**And** create file record
**And** return file information

#### Scenario: File size exceeds limit

**Given** user is logged in
**And** file size exceeds 10MB
**When** calling `POST /api/files/upload`
**Then** return 400 error

### Requirement: Delete File
The system SHALL enable users to delete uploaded files and their records.

#### Scenario: Delete existing file

**Given** file record exists
**When** calling `DELETE /api/files/{fileId}`
**Then** delete physical file
**And** delete file record

### Requirement: Face Recognition Verification
The system SHALL enable face recognition verification for uploaded images.

#### Scenario: Face recognition verification

**Given** user is logged in
**And** uploaded file is an image
**When** calling `POST /api/files/face-recognition/verify`
**Then** return verification result (mock)
