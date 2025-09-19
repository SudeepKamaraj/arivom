// External Providers integration (Coursera / Udemy)
// Note: Real Udemy Instructor API requires OAuth client credentials and instructor scope.
// For demo, we provide public-catalog fetchers and graceful fallbacks with curated samples.

export interface ExternalCourseItem {
  id: string;
  title: string;
  description: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  skills?: string[];
  instructor?: string;
  thumbnail?: string;
  provider: 'Coursera' | 'Udemy';
  url: string; // external URL for redirection
  previewVideoUrl?: string; // optional promo/preview video
}

// Simple mapper to our internal level strings from provider metadata
function mapLevel(input?: string): 'Beginner' | 'Intermediate' | 'Advanced' | undefined {
  if (!input) return undefined;
  const s = input.toLowerCase();
  if (s.includes('beginner')) return 'Beginner';
  if (s.includes('intermediate')) return 'Intermediate';
  if (s.includes('advanced')) return 'Advanced';
  return undefined;
}

export async function fetchCourseraCatalog(search: string): Promise<ExternalCourseItem[]> {
  try {
    // Public Coursera catalog search (unofficial, subject to change). For production, integrate Partner APIs.
    const res = await fetch(`https://www.coursera.org/api/courses.v1?q=search&query=${encodeURIComponent(search)}&limit=10`);
    if (!res.ok) throw new Error('Coursera catalog fetch failed');
    const data = await res.json();
    const elements = data?.elements || [];
    return elements.map((c: any) => ({
      id: `coursera-${c.id}`,
      title: c.name,
      description: c.description || 'Course on Coursera',
      level: mapLevel(c.courseLevel),
      skills: Array.isArray(c.skills) ? c.skills : [],
      instructor: (c.instructorIds && c.instructorIds.length) ? 'Coursera Instructor' : 'Coursera',
      thumbnail: c.photoUrl,
      provider: 'Coursera',
      url: `https://www.coursera.org/learn/${c.slug || c.id}`,
    })).slice(0, 10);
  } catch (e) {
    console.warn('Coursera fetch failed, using fallback.', e);
    return [
      {
        id: 'coursera-fallback-react',
        title: 'React Basics',
        description: 'Learn the fundamentals of React on Coursera.',
        level: 'Beginner',
        skills: ['React', 'JavaScript', 'Frontend'],
        instructor: 'Coursera',
        thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200',
        provider: 'Coursera',
        url: 'https://www.coursera.org/',
        previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
    ];
  }
}

export async function fetchUdemyCatalog(search: string, udemyToken?: string): Promise<ExternalCourseItem[]> {
  try {
    // Public catalog preview (CORS and headers may apply). For instructor API, pass udemyToken and use authenticated endpoint.
    const url = `https://www.udemy.com/api-2.0/courses/?search=${encodeURIComponent(search)}&page_size=10`;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (udemyToken) {
      headers['Authorization'] = `Bearer ${udemyToken}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Udemy catalog fetch failed');
    const data = await res.json();
    const results = data?.results || [];
    return results.map((c: any) => ({
      id: `udemy-${c.id}`,
      title: c.title,
      description: c.headline || 'Course on Udemy',
      level: mapLevel(c.instructional_level),
      skills: [],
      instructor: (c.visible_instructors && c.visible_instructors[0]?.display_name) || 'Udemy Instructor',
      thumbnail: c.image_480x270 || c.image_240x135,
      provider: 'Udemy',
      url: `https://www.udemy.com${c.url}`,
      previewVideoUrl: c.preview_url || undefined,
    })).slice(0, 10);
  } catch (e) {
    console.warn('Udemy fetch failed, using fallback.', e);
    return [
      {
        id: 'udemy-fallback-node',
        title: 'Node.js Masterclass',
        description: 'Master Node.js with hands-on projects on Udemy.',
        level: 'Intermediate',
        skills: ['Node.js', 'Express', 'Backend'],
        instructor: 'Udemy',
        thumbnail: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200',
        provider: 'Udemy',
        url: 'https://www.udemy.com/',
        previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      },
    ];
  }
}

export function generateAssessmentFromExternal(course: ExternalCourseItem) {
  const topics = [
    ...(course.skills || []),
    ...(course.title ? [course.title] : []),
  ];
  const base = topics.length > 0 ? topics : ['Core Concepts'];
  return Array.from({ length: 8 }, (_, i) => {
    const topic = base[i % base.length];
    const correct = (i + course.id.length) % 4;
    const stem = `Which statement best reflects ${topic} in "${course.title}"?`;
    const options = [
      `A best-practice application of ${topic}.`,
      `An unrelated statement about ${topic}.`,
      `A partially correct statement about ${topic}.`,
      `A common mistake when applying ${topic}.`
    ];
    const accurate = options[0];
    const rotated = [accurate, ...options.slice(1)];
    while (rotated.indexOf(accurate) !== correct) rotated.push(rotated.shift() as string);
    return { question: stem, options: rotated, correctAnswer: correct };
  });
}


