import { writeFileSync, readdirSync, readFileSync } from "fs";

import path from "path";
import url from "url";
import { join, parse } from "path";

export const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const pathToAbiDir = path.join(__dirname, "../src/types/abi");
const pathToOutDir = path.join(__dirname, "../src/types/abi");

const generateAbiTypes = () => {
  const files = readdirSync(pathToAbiDir).filter((file) =>
    file.endsWith(".json")
  );

  files.forEach((file) => {
    const filePath = join(pathToAbiDir, file);
    const abiContent = readFileSync(filePath, "utf-8");
    const abiJson = JSON.parse(abiContent);

    // Generate TS file content
    const tsContent = `/* Auto-generated file. Do not edit manually. */
export const ${parse(file).name}Abi = ${JSON.stringify(
      abiJson.abi,
      null,
      2
    )} as const;

export type ${parse(file).name}AbiType = typeof ${parse(file).name}Abi;
`;

    const outputFilePath = join(pathToOutDir, `${parse(file).name}.ts`);

    writeFileSync(outputFilePath, tsContent);

    console.log(`✅ Generated: ${outputFilePath}`);
  });

  console.log("🎉 ABI TypeScript generation completed!");
};

generateAbiTypes();
