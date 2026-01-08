import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

// Create the API sub-application
const api = new Hono();

// Health check endpoint
api.get('/health', (c) => {
  return c.json({ status: "ok" });
});

// Get all tickets (with pagination)
api.get('/tickets', async (c) => {
  try {
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const tickets = await kv.getByPrefix("ticket:");
    // Sort by createdAt desc
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const paginatedTickets = tickets.slice(offset, offset + limit);
    return c.json(paginatedTickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json({ error: "Failed to fetch tickets" }, 500);
  }
});

// Create a ticket
api.post('/tickets', async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `WO-${Math.floor(Math.random() * 10000)}`;
    const ticket = { ...body, id, createdAt: body.createdAt || new Date().toISOString() };
    
    await kv.set(`ticket:${id}`, ticket);
    return c.json(ticket, 201);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return c.json({ error: "Failed to create ticket" }, 500);
  }
});

// Update a ticket
api.put('/tickets/:id', async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`ticket:${id}`);
    if (!existing) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`ticket:${id}`, updated);
    
    return c.json(updated);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return c.json({ error: "Failed to update ticket" }, 500);
  }
});

// Seed initial data (Safe to run multiple times, will overwrite if IDs match)
api.post('/seed', async (c) => {
  try {
    const MOCK_TICKETS = [
      {
        id: "WO-2024",
        title: "Station #405 Offline - Downtown Plaza",
        description: "Station is reporting offline status for more than 2 hours. Remote reset failed. Likely network module issue or power cut.",
        status: "open",
        priority: "critical",
        type: "corrective",
        requester: "System Monitor",
        createdAt: "2023-10-27T14:30:00Z",
        tags: ["offline", "network", "urgent"],
        location: "Downtown Plaza, Bay 4",
        steps: [
          { id: '1', label: 'Initial Inspection', completed: false },
          { id: '2', label: 'Check Power Supply', completed: false },
          { id: '3', label: 'Network Diagnostic', completed: false },
          { id: '4', label: 'Module Replacement', completed: false },
          { id: '5', label: 'Final Verification', completed: false },
        ]
      },
      {
        id: "WO-2025",
        title: "Connector B Damage - Highway Rest Stop 12",
        description: "Customer reported CCS connector locking mechanism is broken. Visual inspection required. Spare part #CCS-Type2-L might be needed.",
        status: "assigned",
        priority: "high",
        type: "corrective",
        requester: "Customer Report",
        createdAt: "2023-10-27T10:00:00Z",
        assignee: "Mike Technician",
        tags: ["hardware", "connector", "safety"],
        location: "Highway 101, Rest Stop 12",
        steps: [
          { id: '1', label: 'Visual Assessment', completed: false },
          { id: '2', label: 'Lock Mechanism Test', completed: false },
          { id: '3', label: 'Replace Connector Head', completed: false },
          { id: '4', label: 'Safety Check', completed: false },
        ]
      },
      {
        id: "WO-2026",
        title: "Routine Maintenance - Mall of City (Level 2)",
        description: "Quarterly preventive maintenance for cluster A. Check cables, clean screens, test voltage output.",
        status: "open",
        priority: "medium",
        type: "preventive",
        requester: "Ops Manager",
        createdAt: "2023-10-26T16:20:00Z",
        tags: ["maintenance", "routine"],
        location: "Mall of City, P2 Green Zone",
        steps: [
          { id: '1', label: 'Check the MDB cabinet and charging station cabinet for rust, leaks, and the condition of the door handles.', completed: false },
          { id: '2', label: 'Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.', completed: false },
          { id: '3', label: 'Check the ground condition, drainage, and cleaning.', completed: false },
          { id: '4', label: 'Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.', completed: false },
          { id: '5', label: 'Check if the charging input line is normal.', completed: false },
          { id: '6', label: "Check that all terminals on the charging station's mainboard are securely plugged in and that all cables are loose.", completed: false },
          { id: '7', label: 'Check if the display screen is intact and verify that all parameter settings are correct.', completed: false },
          { id: '8', label: 'Check if the indicator lights on the charging station are functioning properly.', completed: false },
          { id: '9', label: 'Check if all communication functions of the charging station are normal.', completed: false },
          { id: '10', label: 'Check that the emergency stop button is intact and that it functions properly.', completed: false },
          { id: '11', label: 'Check if the charging module is operating normally and if the power indicator light is flashing. There should be no red alarm light illuminated.', completed: false },
          { id: '12', label: 'Check that the surge protector is in good working order and has not been damaged.', completed: false },
          { id: '13', label: 'Check if the dust screen needs cleaning.', completed: false },
          { id: '14', label: 'Check all historical records of the charging station for any abnormal fault data.', completed: false },
          { id: '15', label: 'Check if the communication between the charging station and the backend is normal and if the data is being sent normally.', completed: false },
          { id: '16', label: 'Check if the charger contactor is functioning properly and On-site test of charging action', completed: false },
        ]
      },
      {
        id: "WO-2027",
        title: "Scheduled Modem Upgrade - Westside Park",
        description: "Replace 3G modems with 4G LTE units for Stations 1-4 as part of the Q4 connectivity upgrade plan.",
        status: "open",
        priority: "medium",
        type: "planned",
        requester: "Network Planning",
        createdAt: "2023-10-25T09:15:00Z",
        tags: ["upgrade", "connectivity", "planned"],
        location: "Westside Park, Stations 1-4",
        steps: [
           { id: '1', label: 'Remove Old Modem', completed: false },
           { id: '2', label: 'Install 4G Unit', completed: false },
           { id: '3', label: 'Signal Test', completed: false },
        ]
      },
      {
        id: "WO-2028",
        title: "Payment Terminal Jammed - Central Station",
        description: "Credit card reader is not accepting cards. Physical obstruction detected in the slot.",
        status: "open",
        priority: "low",
        type: "corrective",
        requester: "Site Security",
        createdAt: "2023-10-24T11:00:00Z",
        tags: ["payment", "hardware"],
        location: "Central Station, Main Entrance",
        steps: [
          { id: '1', label: 'Inspect Slot', completed: false },
          { id: '2', label: 'Remove Obstruction', completed: false },
          { id: '3', label: 'Test Card Read', completed: false },
        ]
      },
      {
        id: "WO-2029",
        title: "Recurring Power Fluctuation - Sector 7",
        description: "Multiple users reporting power output instability. Requires deep analysis and long-term monitoring strategy.",
        status: "assigned",
        priority: "high",
        type: "problem",
        requester: "Regional Director",
        createdAt: "2023-10-24T09:00:00Z",
        assignee: "Mike Technician",
        tags: ["power", "investigation"],
        location: "Sector 7, Industrial Zone"
      }
    ];

    // Generate more random tickets for infinite scroll testing
    const statuses = ["open", "assigned", "completed", "review"];
    const priorities = ["low", "medium", "high", "critical"];
    const types = ["corrective", "preventive", "planned", "problem"];

    for (let i = 0; i < 100; i++) {
      const id = `WO-${3000 + i}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      
      MOCK_TICKETS.push({
        id,
        title: `Auto-Generated Ticket #${i + 1}`,
        description: "This is an auto-generated ticket for testing infinite scroll.",
        status,
        priority,
        type,
        requester: "System Bot",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
        assignee: status !== 'open' ? "Mike Technician" : undefined,
        tags: ["test", "auto"],
        location: `Test Location ${i + 1}`
      });
    }

    const keys = MOCK_TICKETS.map(t => `ticket:${t.id}`);
    await kv.mset(keys, MOCK_TICKETS);
    
    return c.json({ message: "Seed data created" });
  } catch (error) {
    console.error("Error seeding data:", error);
    return c.json({ error: "Failed to seed data" }, 500);
  }
});

// Main application
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Mount API at different possible prefixes to handle path routing robustly
// 1. Original prefix style
app.route('/make-server-41554e89', api);
// 2. Full path style (if Deno sees /functions/v1/...)
app.route('/functions/v1/make-server-41554e89', api);
// 3. Fallback root (if everything is stripped)
app.route('/', api);

Deno.serve(app.fetch);
