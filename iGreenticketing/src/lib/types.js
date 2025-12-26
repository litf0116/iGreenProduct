// Type definitions are handled via JSDoc comments in JavaScript

/**
 * @typedef {'open' | 'accepted' | 'inProgress' | 'closed' | 'onHold' | 'cancelled'} TicketStatus
 */

/**
 * @typedef {'P1' | 'P2' | 'P3' | 'P4'} Priority
 */

/**
 * @typedef {'text' | 'number' | 'date' | 'location' | 'photo' | 'signature' | 'faceRecognition'} FieldType
 */

/**
 * @typedef {'planned' | 'preventive' | 'corrective'} TicketType
 */

/**
 * @typedef {'normal' | 'vip'} SiteLevel
 */

/**
 * @typedef {'online' | 'offline' | 'underConstruction'} SiteStatus
 */

/**
 * @typedef {Object} TicketComment
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} comment
 * @property {Date} createdAt
 * @property {'general' | 'accept' | 'decline' | 'cancel'} type
 */

/**
 * @typedef {Object} TemplateField
 * @property {string} id
 * @property {string} name
 * @property {FieldType} type
 * @property {boolean} required
 */

/**
 * @typedef {Object} TemplateStep
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {TemplateField[]} fields
 * @property {number} order
 */

/**
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {TemplateStep[]} steps
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} templateId
 * @property {string} templateName
 * @property {TicketType} type
 * @property {string} site
 * @property {TicketStatus} status
 * @property {Priority} priority
 * @property {string} assignedTo
 * @property {string} assignedToName
 * @property {string} createdBy
 * @property {string} createdByName
 * @property {Date} createdAt
 * @property {Date} dueDate
 * @property {string[]} completedSteps
 * @property {Object<string, any>} stepData
 * @property {boolean} [accepted]
 * @property {Date} [acceptedAt]
 * @property {Date} [departureAt]
 * @property {string} [departurePhoto]
 * @property {Date} [arrivalAt]
 * @property {string} [arrivalPhoto]
 * @property {string} [completionPhoto]
 * @property {string} [cause]
 * @property {string} [solution]
 * @property {TicketComment[]} comments
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {'admin' | 'engineer' | 'manager'} role
 */

/**
 * @typedef {Object} Site
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {SiteLevel} level
 * @property {SiteStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
