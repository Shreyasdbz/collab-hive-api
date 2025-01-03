// #!/usr/bin/env node
// import * as fs from "fs";
// import * as path from "path";
// import process from "process";

// // Get the api version from the command line
// const apiVersion = process.argv[2];
// if (!apiVersion) {
//     console.error(
//         "Please provide an api version: yarn create-resource v1 / yarn create-resource v2"
//     );
//     process.exit(1);
// }
// // Get the resource name from the command line
// const resourceName = process.argv[3];
// if (!resourceName) {
//     console.error(
//         "Please provide a resource name: yarn create-resource v1 users / yarn create-resource v2 posts"
//     );
//     process.exit(1);
// }

// // Define the folder and file structure
// const __dirname = path.dirname(new URL(import.meta.url).pathname);
// // File 1: Route - defines the routes for the resource
// // File 2: Controller - defines the controller for the resource
// // File 3: Service - defines the service for the resource
// // File 4: Types - defines the types for the resource
// const files = [
//     {
//         name: `${resourceName}.routes.ts`,
//         path: path.join(__dirname, "../routes", apiVersion),
//         content: `export const ${resourceName}Routes = [];`,
//     },
//     {
//         name: `${resourceName}.controller.ts`,
//         path: path.join(__dirname, "../controllers"),
//         content: `class ${capitalize(
//             resourceName
//         )}Controller {}\n export default new ${capitalize(
//             resourceName
//         )}Controller();`,
//     },
//     {
//         name: `${resourceName}.service.ts`,
//         path: path.join(__dirname, "../services"),
//         content: `export class ${capitalize(resourceName)}Service {}`,
//     },
//     {
//         name: `${resourceName}.d.ts`,
//         path: path.join(__dirname, "../types"),
//         content: `export type ${capitalize(resourceName)} = {}`,
//     },
// ];

// // Helper to capitalize resource name
// function capitalize(name) {
//     return name.charAt(0).toUpperCase() + name.slice(1);
// }

// // Create each file
// files.forEach((file) => {
//     const filePath = path.join(file.path, file.name);
//     fs.writeFileSync(filePath, file.content);
//     console.log(`Created ${filePath}`);
// });

// console.log(`Resource ${resourceName} created successfully.`);
