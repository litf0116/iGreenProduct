# User Service Specification

## Overview
Provide user management features including user CRUD and permission management. Migrated from FastAPI implementation.

## ADDED Requirements

### Requirement: Get User List
The system SHALL enable fetching all users from the database with optional filtering.

#### Scenario: Get all users

**Given** user is logged in
**When** calling `GET /api/users`
**Then** return all user list

### Requirement: Get Single User
The system SHALL enable fetching a single user by their unique ID.

#### Scenario: Get existing user

**Given** user is logged in
**When** calling `GET /api/users/{userId}`
**Then** return specified user information

### Requirement: Create User
The system SHALL enable administrators and managers to create new users in the system.

#### Scenario: Admin creates user

**Given** current user is admin or manager
**And** valid user information is provided
**When** calling `POST /api/users`
**Then** create new user and return user information

### Requirement: Update User
The system SHALL enable users to update their own information and administrators to update any user.

#### Scenario: User updates themselves

**Given** user is logged in
**When** calling `PUT /api/users/{userId}` to update themselves
**Then** update successful

### Requirement: Delete User
The system SHALL enable administrators to delete users from the system.

#### Scenario: Admin deletes user

**Given** current user is admin
**When** calling `DELETE /api/users/{userId}`
**Then** delete user successfully
