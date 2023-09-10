import fs from "fs";
import { resolve } from "path";
import yaml from "yamljs";
export function Configuration(configFile = resolve(process.cwd(), "config.yaml"), { existsSync, readFileSync } = fs) {
    const configuration = existsSync(configFile)
        ? yaml.parse(readFileSync(configFile).toString())
        : { isDefault: true };
    const { backend: backendConfiguration, ...frontendConfiguration } = configuration;
    return { backendConfiguration, frontendConfiguration };
}
//# sourceMappingURL=Configuration.js.map