import { getMappingKeys } from '@utils/get-mapping-keys';

export const ProjectSearchSortByMapping = new Map<string, string>([
    ['a7bfc9da-1c89-4567-900b-c93b4ff3c1b2', 'Newest'],
    ['17db2d89-6c6e-4b88-9e20-cbf9b07d19a2', 'Oldest'],
    ['6e0a5b89-9f93-49e3-b2d8-497a786e1d8a', 'Most favorites'],
]);
export const ProjectSearchSortByMappingKeys = getMappingKeys(
    ProjectSearchSortByMapping,
);

export const ProjectComplexitiesMapping = new Map<string, string>([
    ['a7bfc9da-1c89-4567-900b-c93b4ff3c1b2', 'Small'],
    ['17db2d89-6c6e-4b88-9e20-cbf9b07d19a2', 'Medium'],
    ['6e0a5b89-9f93-49e3-b2d8-497a786e1d8a', 'Large'],
    ['d93a9f80-8f2d-4b27-91b2-5eafe3b2cf4d', 'Huge'],
]);
export const ProjectComplexitiesMappingKeys = getMappingKeys(
    ProjectComplexitiesMapping,
);

export const ProjectRolesMapping = new Map<string, string>([
    ['d8f9174c-8f3b-47d1-8719-2c1f7b3d8b0d', 'AI Researcher'],
    ['b0fd7c9a-1b4f-4e2f-bd82-1f9de8a5eecd', 'Back-end Developer'],
    ['74f91ac3-5dbd-46e8-9219-c4f1af93d92a', 'Cloud Engineer'],
    ['a7bfc9da-1c89-4567-900b-c93b4ff3c1b2', 'Data Engineer'],
    ['7cd9e124-b2b8-490e-a69e-914ef8e18376', 'Data Scientist'],
    ['17db2d89-6c6e-4b88-9e20-cbf9b07d19a2', 'DevOps Engineer'],
    ['d93a9f80-8f2d-4b27-91b2-5eafe3b2cf4d', 'Front-end Developer'],
    ['6e0a5b89-9f93-49e3-b2d8-497a786e1d8a', 'Full-stack Developer'],
    ['3e7cb981-78d8-481e-bf7d-7e1a8b32d1d5', 'Game Developer'],
    ['73c9d2e7-4e91-4a19-9f8b-4b9f1c7d3e9c', 'Game Designer'],
    ['2a19bf3a-e9e2-44d4-9342-76d3d6c22b45', 'Machine Learning Engineer'],
    ['c7af3a8b-1b89-48d4-bb88-74e3f92bc1e4', 'Mobile App Developer'],
    ['a5b8f2d1-6c7e-4c98-93d2-8e7b1f9c50c8', 'Network Engineer'],
    ['41a8b7c2-8e3c-4f93-b40c-45f8d9adcb88', 'Product Manager'],
    ['1f97cb7e-95f8-4d77-a77e-0a8f8e93dbbd', 'QA Engineer'],
    ['b17f983a-6db9-4b4d-a7e9-3c8f1b5b3c2e', 'Scrum Master'],
    ['5cb9c97e-4d97-4191-843f-b8f2e7afc39b', 'Security Engineer'],
    ['ef7c193b-98f8-4877-8c0e-1b1d2c7f8b9d', 'Systems Architect'],
    ['50b3d96a-915c-4f91-9d37-1f78b1d2c09e', 'Technical Writer'],
    ['e91d97ab-4d3e-476d-9ba4-63d7aaff2c92', 'UI/UX Designer'],
]);
export const ProjectRolesMappingKeys = getMappingKeys(ProjectRolesMapping);

export const ProjectTechnologiesMapping = new Map<string, string>([
    // **Languages**
    ['1f9a7c3e-2b8d-4e91-83d7-c2f9e8b3d7a4', 'C'],
    ['20e8a7b3-3f4d-4f91-83d7-c2e1a9b03f9d', 'Clojure'],
    ['2c9b8e3f-3a7d-4f91-8b9c-f1e7a92b0d8e', 'C++'],
    ['3e7a9d2c-4b8f-4f91-9c7b-e8a2c7f3b04d', 'C#'],
    ['19d7b9e3-2f4d-4f91-9b8d-c7e1a9b03f4f', 'Elixir'],
    ['4a9e8d3b-7f2c-4f91-83b9-d7c1e92b3a01', 'Go'],
    ['18c8b7e3-4f1d-4f91-83d9-e1c9a7b03f4d', 'Haskell'],
    ['5b9c7e3f-8a4d-4f91-83f7-c2e1a9b0d7f3', 'Java'],
    ['6c8e9a3b-2f7d-4f91-9b8c-e7a3d92b0f4e', 'JavaScript'],
    ['7d9b8a3c-3f1e-4f91-8b7d-c2e7a9b03d4f', 'Kotlin'],
    ['17b9e7a3-3f4d-4f91-83d7-c2e1a9b03f9d', 'Objective-C'],
    ['14e9b7c3-4f1d-4f91-83d7-c2e1a9b03f4d', 'PHP'],
    ['15f8a7b3-3f4d-4f91-83d9-e1c9a7b03f9d', 'Perl'],
    ['8e7c9a3b-9f4d-4f91-83b7-c1e9a7b2d04e', 'Python'],
    ['16a7c9e3-2f4d-4f91-9b8d-c7e1a9b03f4f', 'R'],
    ['9f8b7c3e-2a4d-4f91-9b8d-c7e2a9b3d0f4', 'Ruby'],
    ['10e8b7a3-d4c9-4f91-83d7-b9c1e7a03f9d', 'Rust'],
    ['11c7a9e3-9d2f-4f91-83b9-d2f8e1a9b07f', 'Scala'],
    ['12a9c8b7-3f1d-4f91-9b8e-f7c2e1a9b3d4', 'Swift'],
    ['13d8a7b9-2f3e-4f91-9b7c-c1e9a7f03d4b', 'TypeScript'],
    // **Web Technologies**
    ['69e8b7a3-4f1d-4f91-83d9-c2e1a9b03f4d', '.NET'],
    ['14e7b9c3-2a4d-4f91-83d9-c7f8a9b3d0e1', 'Angular'],
    ['30e9b7c3-3f4d-4f91-83d9-c7e1a9b03f4d', 'ASP.NET'],
    ['34c9b7e3-3f4d-4f91-83d9-c7e1a9b03f4d', 'Backbone.js'],
    ['38a9b7e3-3f4d-4f91-83d9-c7e1a9b03f4d', 'Blitz.js'],
    ['15a9e7b3-3f4d-4f91-9b8d-c2e1a9b03f9d', 'Bootstrap'],
    ['65a7b9e3-4f1d-4f91-83d9-c7e1a9b03f4d', 'Bun'],
    ['68d8b7a3-4f1d-4f91-83d9-c2e1a9b03f4d', 'Deno'],
    ['16c8b7a9-4f1e-4f91-83d7-e9a2c7b03f4d', 'Django'],
    ['17f9e7a3-2b4d-4f91-9c7b-e1c9a7b03f8d', 'Express.js'],
    ['18b7a9c3-3d4e-4f91-83d9-c7f1a9b03e4d', 'Flask'],
    ['19d7b9e3-9f4c-4f91-83b7-c2e8a1b03d4f', 'Gatsby'],
    ['20a7c9e3-2d4b-4f91-9b8e-f7c1e9a03d4f', 'GraphQL'],
    ['66b8e7a3-3f4d-4f91-83d7-c2e1a9b03f9d', 'Hono'],
    ['27b8e7a3-4f1d-4f91-83d9-c2e1a9b03f4d', 'Laravel'],
    ['67c9b7e3-2f4d-4f91-9b8d-c7e1a9b03f4f', 'Node.js'],
    ['21b9e7a3-3c4d-4f91-83d9-c2e1a7b03f9d', 'Next.js'],
    ['22c8b7e3-4f1d-4f91-83d7-e9a2c7b03f4d', 'Nuxt.js'],
    ['23d7b9e3-9f4c-4f91-83b7-c2e9a1b03d4f', 'React'],
    ['29d8b7a3-4f1d-4f91-83d9-c2e1a9b03f4d', 'Spring Boot'],
    ['24e7b9c3-3a4d-4f91-9b8d-c7f8a9b03e1f', 'Svelte'],
    ['25f9e7b3-2d4c-4f91-83d9-c2e1a7b03f8d', 'Tailwind CSS'],
    ['65d8b7a3-4f1d-4f91-83d9-c2e1a9b03f4d', 'Tauri'],
    ['26a7c9e3-3f4d-4f91-9c8d-c7e1a9b03d0f', 'Vue.js'],
    // **Mobile Technologies**
    ['27b7a9e3-2f4d-4f91-83d9-e7c1a9b03f9d', 'Flutter'],
    ['28c7b9e3-3d4f-4f91-9b8e-f1e9a7b03c4d', 'Ionic'],
    ['29d8b7a9-4f1c-4f91-83d7-c9e7a2b03f4d', 'React Native'],
    ['30e7c9a3-9f4b-4f91-83b9-d7e2a1b03f9d', 'SwiftUI'],
    ['31f8b7c3-2a4d-4f91-9b8d-c7e9a1b03d4f', 'Xamarin'],
    // **Cloud and DevOps**
    ['32a7b9e3-3f4c-4f91-83d7-c2e9a7b03f9d', 'AWS'],
    ['33b7c9a3-4d2f-4f91-83d9-e1a9b7c03f4d', 'Azure'],
    ['34c8b7a3-9f4d-4f91-83d7-c7e9a1b03f4d', 'Docker'],
    ['35d9b7e3-2f4c-4f91-9b8d-c1e7a9b03f9d', 'Firebase'],
    ['36e7c9b3-3d4f-4f91-83b9-c7f1a9b03d4f', 'Google Cloud'],
    ['37f8b7e3-4a2c-4f91-83d9-c9e1a7b03f4d', 'Heroku'],
    ['38a9c8b3-3f4d-4f91-83b9-d7e1a9b03f4f', 'Kubernetes'],
    ['39b8e7a3-2d4f-4f91-9b8c-c7e1a9b03f9d', 'Terraform'],
    // **Databases**
    ['46c8b7e3-4f1d-4f91-83d9-c2e1a9b03f4d', 'Cassandra'],
    ['48e7b9a3-4f1d-4f91-83d9-e1c9a7b03n4d', 'DynamoDB'],
    ['40c7b9e3-4f1d-4f91-83d9-c9e2a1b03f4f', 'MariaDB'],
    ['41d7b9e3-9f4d-4f91-83b7-c7e1a9b03d0f', 'MongoDB'],
    ['42e7b9a3-3d4f-4f91-83d9-e1c9a7b03f4d', 'MySQL'],
    ['43f8b7c3-2a4d-4f91-9b8e-f7c1a9b03e4d', 'PostgreSQL'],
    ['44a8b7c3-4f1d-4f91-83d9-c1e9a7b03f9d', 'Redis'],
    ['45b7c9a3-3f4d-4f91-83d7-e9a2c7b03f4d', 'SQLite'],
    // **AI/ML Tools**
    ['46c7b9a3-9f4d-4f91-83b7-d2e1a9b03f4d', 'Hugging Face'],
    ['47d9b7a3-2f4d-4f91-9b8c-f7e1a9b03f4d', 'Pandas'],
    ['48e7b9a3-3f4d-4f91-83d9-e1c9a7b03f9d', 'Scikit-learn'],
    ['49f8b7c3-4f1d-4f91-83b9-c7e1a9b03d4f', 'TensorFlow'],
    ['50a8b7e3-2f4c-4f91-9b8d-c9e7a1b03f4f', 'PyTorch'],
    ['51b7c9a3-3f4d-4f91-83d9-f7e1a9b03f9d', 'Keras'],
    ['52c8b7e3-4d1f-4f91-83b9-c1e9a7b03f9d', 'NumPy'],
    // **Testing**
    ['53d8b7e3-3f4d-4f91-83d7-c7e1a9b03d0f', 'Cypress'],
    ['54e7b9a3-4f1d-4f91-83d9-e1c7a9b03f4d', 'Jest'],
    ['55f8b7a3-2f4d-4f91-9b8e-c7e1a9b03f4f', 'Mocha'],
    ['56a9b7c3-3f4d-4f91-83d9-e9a1c7b03f4f', 'Playwright'],
    ['57b9c8b3-4f1d-4f91-83d9-c1e7a9b03f4d', 'Selenium'],
    // **Design and Prototyping**
    ['58c7b9e3-9f4d-4f91-83b7-c7e1a9b03f9d', 'Figma'],
    ['59d9b8e3-2f4d-4f91-83d7-c9e1a7b03f9d', 'Sketch'],
    ['60e7b9c3-3f4d-4f91-9b8d-c7e1a9b03e4d', 'Adobe XD'],
    ['61f8b7a3-4f1d-4f91-83d7-e9a1c7b03f4f', 'InVision'],
    // **Payment Platforms**
    ['62a7b9e3-3f4d-4f91-9b8c-f7e1a9b03f9d', 'PayPal API'],
    ['63b8e7a3-2f4d-4f91-9b8d-c7e1a9b03f4f', 'Stripe'],
    ['64c9b7e3-4d1f-4f91-83b7-e1a7c9b03f4d', 'Square API'],
]);
export const ProjectTechnologiesMappingKeys = getMappingKeys(
    ProjectTechnologiesMapping,
);
