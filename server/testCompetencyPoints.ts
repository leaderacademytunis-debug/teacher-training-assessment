/**
 * Test script to verify competency points tracking in EDUGPT
 * Run with: npx ts-node server/testCompetencyPoints.ts
 */

import { getDb } from "./db";
import { competencyPoints, competencyTransactions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function testCompetencyPointsTracking() {
  console.log("🧪 Starting competency points tracking test...\n");

  const database = (await getDb())!;

  try {
    // 1. Get a test user (or use the first teacher)
    console.log("📋 Step 1: Finding test user...");
    const [testUser] = await database
      .select()
      .from(users)
      .where(eq(users.role, "teacher"))
      .limit(1);

    if (!testUser) {
      console.error("❌ No teacher user found in database");
      return;
    }

    console.log(`✅ Found test user: ${testUser.name} (ID: ${testUser.id})\n`);

    // 2. Check current competency points
    console.log("📊 Step 2: Checking current competency points...");
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [currentPoints] = await database
      .select()
      .from(competencyPoints)
      .where(
        eq(competencyPoints.userId, testUser.id)
      )
      .limit(1);

    if (currentPoints) {
      console.log(`Current points: ${currentPoints.totalPoints}`);
      console.log(`Current level: ${currentPoints.level}`);
      console.log(`Month: ${currentPoints.monthYear}\n`);
    } else {
      console.log("No competency points record found yet\n");
    }

    // 3. Check recent transactions
    console.log("📝 Step 3: Checking recent transactions...");
    const recentTransactions = await database
      .select()
      .from(competencyTransactions)
      .where(eq(competencyTransactions.userId, testUser.id))
      .limit(10);

    if (recentTransactions.length > 0) {
      console.log(`Found ${recentTransactions.length} recent transactions:`);
      recentTransactions.forEach((tx, index) => {
        console.log(
          `  ${index + 1}. ${tx.type}: +${tx.points} points (${new Date(tx.createdAt).toLocaleString()})`
        );
      });
    } else {
      console.log("No transactions found yet");
    }

    console.log("\n✅ Test completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("1. Go to /teacher-analytics in the app");
    console.log("2. Trigger a content adaptation in EDUGPT");
    console.log("3. Check if +3 points appear in the analytics");
    console.log("4. Re-run this script to verify the points were recorded\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  process.exit(0);
}

// Run the test
testCompetencyPointsTracking();
