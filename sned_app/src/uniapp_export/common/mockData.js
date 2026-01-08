export const mockTemplates = [
  {
    id: "1",
    name: "Planned Maintenance",
    description: "Scheduled planned maintenance for charging stations",
    steps: []
  },
  {
    id: "2",
    name: "Preventive Maintenance",
    description: "Regular preventive maintenance to avoid failures",
    steps: []
  },
  {
    id: "3",
    name: "Corrective Maintenance",
    description: "Corrective maintenance for reported issues and failures",
    steps: []
  },
  {
    id: "4",
    name: "Problem Management Standard",
    description: "Standard template for problem management tickets",
    steps: []
  }
];

export const mockSites = [
  { id: "S001", name: "Central Plaza" },
  { id: "S002", name: "Shopping Mall B" },
  { id: "S003", name: "Office Complex C" },
  { id: "S004", name: "Highway Service Area D" },
  { id: "S005", name: "Airport Terminal E" },
  { id: "S006", name: "Hotel F" },
  { id: "S007", name: "Residential Complex G" },
  { id: "S008", name: "Industrial Park H" }
];

export const mockGroups = [
  { id: "g1", name: "Bangkok Maintenance Team" },
  { id: "g2", name: "Support Team" }
];

export const mockUsers = [
  { id: "1", name: "John Smith", role: "engineer" },
  { id: "2", name: "Sarah Johnson", role: "engineer" },
  { id: "3", name: "Michael Chen", role: "engineer" },
  { id: "5", name: "Current User", role: "engineer" }
];

export const mockProblemTypes = [
  { id: "PT1", name: "Hardware Failure", description: "Physical component malfunction" },
  { id: "PT2", name: "Software Bug", description: "Software logic error or crash" },
  { id: "PT3", name: "Network Issue", description: "Connectivity problems" }
];

export const mockTickets = [
  {
    id: "T001",
    title: "Monthly Inspection - Central Plaza",
    description: "Scheduled monthly inspection",
    type: "planned",
    status: "open",
    priority: "P2",
    site: "Central Plaza",
    assignedToName: "John Smith",
    createdAt: "2025-01-20",
    dueDate: "2025-01-25",
    completedSteps: []
  },
  {
    id: "T002",
    title: "Routine Cleaning - Shopping Mall B",
    description: "Preventive maintenance",
    type: "preventive",
    status: "accepted",
    priority: "P3",
    site: "Shopping Mall B",
    assignedToName: "Sarah Johnson",
    createdAt: "2025-01-18",
    dueDate: "2025-01-22",
    completedSteps: ["step1"]
  },
  {
    id: "T003",
    title: "Emergency Repair - Airport Terminal E",
    description: "Urgent repair needed",
    type: "corrective",
    status: "inProgress",
    priority: "P1",
    site: "Airport Terminal E",
    assignedToName: "Michael Chen",
    createdAt: "2025-01-21",
    dueDate: "2025-01-21",
    completedSteps: ["step1", "step2"]
  }
];
