/**
 * Realtime Service (3007)
 * Handles WebSocket connections, live notifications, and chat
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3007;
const DB_PATH = path.join(__dirname, '../leader_academy.db');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Database connection
let db = new sqlite3.Database(DB_PATH);

// Store active connections
const clients = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'realtime', port: PORT, active_connections: clients.size });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}`;
  clients.set(clientId, ws);
  
  console.log(`✅ Client connected: ${clientId} (Total: ${clients.size})`);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: data.type,\n            sender: clientId,\n            timestamp: new Date().toISOString(),\n            payload: data.payload\n          }));\n        }\n      });\n    } catch (error) {\n      console.error('Message error:', error);\n    }\n  });\n  \n  ws.on('close', () => {\n    clients.delete(clientId);\n    console.log(`❌ Client disconnected: ${clientId} (Total: ${clients.size})`);
  });\n});\n\n// Get notifications\napp.get('/api/notifications/user/:userId', (req, res) => {\n  db.all(\n    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',\n    [req.params.userId],\n    (err, rows) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: rows });\n    }\n  );\n});\n\n// Send notification\napp.post('/api/notifications', (req, res) => {\n  const { notification_id, user_id, title_ar, title_en, message_ar, message_en, type } = req.body;\n  db.run(\n    'INSERT INTO notifications (notification_id, user_id, title_ar, title_en, message_ar, message_en, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, "unread")',\n    [notification_id, user_id, title_ar, title_en, message_ar, message_en, type],\n    (err) => {\n      if (err) return res.status(500).json({ error: err.message });\n      \n      // Broadcast to connected clients\n      wss.clients.forEach((client) => {\n        if (client.readyState === WebSocket.OPEN) {\n          client.send(JSON.stringify({\n            type: 'notification',\n            user_id,\n            title: title_ar,\n            message: message_ar\n          }));\n        }\n      });\n      \n      res.json({ success: true, message: 'Notification sent' });\n    }\n  );\n});\n\n// Mark notification as read\napp.put('/api/notifications/:notificationId', (req, res) => {\n  db.run(\n    'UPDATE notifications SET status = "read" WHERE notification_id = ?',\n    [req.params.notificationId],\n    (err) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, message: 'Notification marked as read' });\n    }\n  );\n});\n\n// Get unread count\napp.get('/api/notifications/unread/:userId', (req, res) => {\n  db.get(\n    'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND status = "unread"',\n    [req.params.userId],\n    (err, row) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, data: row });\n    }\n  );\n});\n\n// Get active connections count\napp.get('/api/realtime/connections', (req, res) => {\n  res.json({\n    success: true,\n    data: {\n      active_connections: clients.size,\n      timestamp: new Date().toISOString()\n    }\n  });\n});\n\n// Send broadcast message\napp.post('/api/realtime/broadcast', (req, res) => {\n  const { message, type } = req.body;\n  \n  wss.clients.forEach((client) => {\n    if (client.readyState === WebSocket.OPEN) {\n      client.send(JSON.stringify({\n        type: type || 'broadcast',\n        message,\n        timestamp: new Date().toISOString()\n      }));\n    }\n  });\n  \n  res.json({ success: true, message: 'Broadcast sent', recipients: clients.size });\n});\n\n// Start server\nserver.listen(PORT, () => {\n  console.log(`\\n✅ Realtime Service running on http://localhost:${PORT}`);\n  console.log(`🔔 WebSocket: ws://localhost:${PORT}`);\n  console.log(`📡 Endpoints: /health, /api/notifications, /api/realtime/broadcast\\n`);\n});\n\nmodule.exports = { app, server };
