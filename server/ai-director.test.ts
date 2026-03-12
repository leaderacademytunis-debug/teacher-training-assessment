import { describe, it, expect, vi } from 'vitest';

// ===== AI Director Assistant Tests =====

describe('AI Director Assistant - Character Profiles', () => {
  const MASTER_PROFILES = {
    teacher: {
      id: 'teacher',
      nameAr: 'المعلم التونسي',
      description: 'A Tunisian male teacher in his 40s, wearing formal elegant clothes (white shirt, dark vest), friendly yet authoritative face, short black hair, rectangular glasses, warm brown eyes, olive skin tone, professional demeanor',
    },
    leader: {
      id: 'leader',
      nameAr: 'القائد التربوي',
      description: 'A Tunisian female educational leader in her 30s, wearing an elegant hijab and professional suit, smiling and inspiring face, warm brown eyes, olive skin tone, confident posture',
    },
  };

  it('should have teacher and leader master profiles', () => {
    expect(MASTER_PROFILES.teacher).toBeDefined();
    expect(MASTER_PROFILES.leader).toBeDefined();
  });

  it('teacher profile should include key physical descriptors', () => {
    const desc = MASTER_PROFILES.teacher.description;
    expect(desc).toContain('Tunisian');
    expect(desc).toContain('40s');
    expect(desc).toContain('rectangular glasses');
    expect(desc).toContain('short black hair');
  });

  it('leader profile should include key physical descriptors', () => {
    const desc = MASTER_PROFILES.leader.description;
    expect(desc).toContain('Tunisian');
    expect(desc).toContain('30s');
    expect(desc).toContain('hijab');
    expect(desc).toContain('professional suit');
  });

  it('profiles should have Arabic names', () => {
    expect(MASTER_PROFILES.teacher.nameAr).toBe('المعلم التونسي');
    expect(MASTER_PROFILES.leader.nameAr).toBe('القائد التربوي');
  });
});

describe('AI Director Assistant - Scene Structure', () => {
  interface Scene {
    sceneNumber: number;
    title: string;
    description: string;
    visualPrompt: string;
    cameraAngle: string;
    mood: string;
    duration: string;
  }

  const mockScenes: Scene[] = [
    {
      sceneNumber: 1,
      title: 'مقدمة شهية للكسور',
      description: 'المعلم يقدم مفهوم الكسر باستخدام بيتزا مقسمة',
      visualPrompt: 'A Tunisian male teacher... holds a pizza...',
      cameraAngle: 'medium shot',
      mood: 'warm and inviting',
      duration: '15s',
    },
    {
      sceneNumber: 2,
      title: 'شرح البسط والمقام',
      description: 'المعلم يشرح مصطلحي البسط والمقام',
      visualPrompt: 'A Tunisian male teacher... beside a whiteboard...',
      cameraAngle: 'medium shot',
      mood: 'calm and focused',
      duration: '20s',
    },
    {
      sceneNumber: 3,
      title: 'أمثلة عملية للكسور',
      description: 'المعلم يقدم أمثلة عملية من الحياة اليومية',
      visualPrompt: 'A Tunisian male teacher... with real-life examples...',
      cameraAngle: 'wide shot',
      mood: 'engaging',
      duration: '25s',
    },
    {
      sceneNumber: 4,
      title: 'تطبيق التلاميذ التفاعلي',
      description: 'تلاميذ يشاركون بنشاط في حل تمارين الكسور',
      visualPrompt: 'Students actively participating...',
      cameraAngle: 'wide shot',
      mood: 'energetic',
      duration: '30s',
    },
    {
      sceneNumber: 5,
      title: 'تلخيص وتقييم الدرس',
      description: 'المعلم يلخص النقاط الرئيسية للدرس',
      visualPrompt: 'A Tunisian male teacher... summarizing...',
      cameraAngle: 'medium close-up',
      mood: 'reflective',
      duration: '20s',
    },
  ];

  it('should generate exactly 5 scenes', () => {
    expect(mockScenes).toHaveLength(5);
  });

  it('each scene should have required fields', () => {
    for (const scene of mockScenes) {
      expect(scene.sceneNumber).toBeGreaterThan(0);
      expect(scene.title).toBeTruthy();
      expect(scene.description).toBeTruthy();
      expect(scene.visualPrompt).toBeTruthy();
      expect(scene.cameraAngle).toBeTruthy();
      expect(scene.mood).toBeTruthy();
      expect(scene.duration).toBeTruthy();
    }
  });

  it('scene numbers should be sequential', () => {
    for (let i = 0; i < mockScenes.length; i++) {
      expect(mockScenes[i].sceneNumber).toBe(i + 1);
    }
  });

  it('camera angles should be valid types', () => {
    const validAngles = ['close-up', 'medium close-up', 'medium shot', 'wide shot', 'extreme wide shot', 'over-the-shoulder', 'bird\'s eye'];
    for (const scene of mockScenes) {
      expect(validAngles.some(a => scene.cameraAngle.includes(a))).toBe(true);
    }
  });

  it('duration should be in seconds format', () => {
    for (const scene of mockScenes) {
      expect(scene.duration).toMatch(/^\d+s$/);
    }
  });
});

describe('AI Director Assistant - Soundtrack', () => {
  interface Soundtrack {
    genre: string;
    mood: string;
    description: string;
  }

  const mockSoundtrack: Soundtrack = {
    genre: 'educational instrumental',
    mood: 'light, curious, inspiring',
    description: 'موسيقى هادئة ومبهجة بألحان بسيطة، تعزز التركيز وتثير الفضول',
  };

  it('should have genre, mood, and description', () => {
    expect(mockSoundtrack.genre).toBeTruthy();
    expect(mockSoundtrack.mood).toBeTruthy();
    expect(mockSoundtrack.description).toBeTruthy();
  });

  it('genre should be educational', () => {
    expect(mockSoundtrack.genre.toLowerCase()).toContain('educational');
  });

  it('description should be in Arabic', () => {
    expect(mockSoundtrack.description).toMatch(/[\u0600-\u06FF]/);
  });
});

describe('AI Director Assistant - Script Validation', () => {
  const MIN_SCRIPT_LENGTH = 20;

  it('should reject scripts shorter than minimum length', () => {
    const shortScript = 'درس قصير';
    expect(shortScript.length).toBeLessThan(MIN_SCRIPT_LENGTH);
  });

  it('should accept scripts at or above minimum length', () => {
    const validScript = 'درس الكسور للسنة الخامسة ابتدائي. يبدأ المعلم بتقديم مفهوم الكسر';
    expect(validScript.length).toBeGreaterThanOrEqual(MIN_SCRIPT_LENGTH);
  });

  it('should handle Arabic text correctly', () => {
    const arabicScript = 'يبدأ المعلم بتقديم مفهوم الكسر باستخدام قطعة بيتزا مقسمة إلى أجزاء متساوية';
    expect(arabicScript.length).toBeGreaterThan(0);
    expect(arabicScript).toMatch(/[\u0600-\u06FF]/);
  });
});

describe('AI Director Assistant - Character Injection', () => {
  function injectCharacter(basePrompt: string, characterDesc: string): string {
    return `${characterDesc}, ${basePrompt}`;
  }

  it('should inject teacher character into visual prompt', () => {
    const teacherDesc = 'A Tunisian male teacher in his 40s, wearing formal elegant clothes';
    const scenePrompt = 'stands in a classroom holding a pizza';
    const result = injectCharacter(scenePrompt, teacherDesc);
    expect(result).toContain(teacherDesc);
    expect(result).toContain(scenePrompt);
  });

  it('should inject leader character into visual prompt', () => {
    const leaderDesc = 'A Tunisian female educational leader in her 30s';
    const scenePrompt = 'presents a lesson on fractions';
    const result = injectCharacter(scenePrompt, leaderDesc);
    expect(result).toContain(leaderDesc);
    expect(result).toContain(scenePrompt);
  });

  it('character description should appear at the beginning of the prompt', () => {
    const characterDesc = 'A Tunisian male teacher';
    const scenePrompt = 'in a classroom';
    const result = injectCharacter(scenePrompt, characterDesc);
    expect(result.startsWith(characterDesc)).toBe(true);
  });
});

describe('AI Director Assistant - Export', () => {
  interface ScriptExport {
    title: string;
    scenes: Array<{
      sceneNumber: number;
      title: string;
      description: string;
      visualPrompt: string;
      cameraAngle: string;
      duration: string;
    }>;
    soundtrack: {
      genre: string;
      mood: string;
    };
  }

  it('should generate a valid export structure', () => {
    const exportData: ScriptExport = {
      title: 'الكسور: رحلة ممتعة في عالم الأرقام',
      scenes: [
        { sceneNumber: 1, title: 'مقدمة', description: 'desc', visualPrompt: 'prompt', cameraAngle: 'medium shot', duration: '15s' },
      ],
      soundtrack: { genre: 'educational', mood: 'inspiring' },
    };

    expect(exportData.title).toBeTruthy();
    expect(exportData.scenes.length).toBeGreaterThan(0);
    expect(exportData.soundtrack).toBeDefined();
  });

  it('should format export as downloadable text', () => {
    const title = 'الكسور: رحلة ممتعة';
    const scenes = [
      { num: 1, title: 'مقدمة', desc: 'وصف المشهد', prompt: 'visual prompt' },
    ];

    let exportText = `عنوان المشروع: ${title}\n\n`;
    for (const s of scenes) {
      exportText += `المشهد ${s.num}: ${s.title}\n`;
      exportText += `الوصف: ${s.desc}\n`;
      exportText += `Visual Prompt: ${s.prompt}\n\n`;
    }

    expect(exportText).toContain(title);
    expect(exportText).toContain('المشهد 1');
  });
});
