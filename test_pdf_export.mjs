import { exportConversationAsPDF } from './server/exportConversation.ts';

const testData = {
  title: "Test Conversation",
  messages: [
    { role: "user", content: "Hello", timestamp: Date.now() },
    { role: "assistant", content: "Hi there! This is a test.", timestamp: Date.now() }
  ],
  createdAt: new Date()
};

try {
  const buf = await exportConversationAsPDF(testData);
  console.log("SUCCESS - PDF size:", buf.length, "bytes");
} catch (e) {
  console.error("ERROR:", e.message);
  console.error("STACK:", e.stack);
}
