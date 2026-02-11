import { drizzle } from "drizzle-orm/mysql2";
import { videos } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Sample YouTube videos for testing
const testVideos = [
  {
    courseId: 2, // Arabic teachers course
    titleAr: "1. تعلمية العربية الحصة الاولى",
    descriptionAr: "مقدمة في تعليم اللغة العربية للمرحلة الابتدائية",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample URL
    duration: 600,
    orderIndex: 1,
    isRequired: true,
    isActive: true,
  },
  {
    courseId: 2,
    titleAr: "2. تعلمية العربية الحصة الثانية",
    descriptionAr: "استراتيجيات تدريس القراءة والكتابة",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 720,
    orderIndex: 2,
    isRequired: true,
    isActive: true,
  },
  {
    courseId: 2,
    titleAr: "3. تعلمية العربية الحصة الثالثة",
    descriptionAr: "تقييم مهارات اللغة العربية",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 540,
    orderIndex: 3,
    isRequired: true,
    isActive: true,
  },
];

async function addVideos() {
  console.log("Adding test videos...");
  
  for (const video of testVideos) {
    await db.insert(videos).values(video);
    console.log(`Added: ${video.titleAr}`);
  }
  
  console.log("Done!");
  process.exit(0);
}

addVideos().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
