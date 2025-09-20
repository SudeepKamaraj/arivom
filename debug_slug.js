const title = "C++";
const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
console.log(`Title: "${title}"`);
console.log(`Generated slug: "${slug}"`);

// Also test the actual course title from the API response
const actualTitle = "C++";
const actualSlug = actualTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
console.log(`Actual title: "${actualTitle}"`);
console.log(`Actual slug: "${actualSlug}"`);