import fs from "fs"
import { resolve } from "path"
import yaml from "yamljs"

type FileSystem = {
  existsSync: (fileName: string) => boolean
  readFileSync: (fileName: string) => Buffer
}

export function Configuration(
  configFile = resolve(process.cwd(), "config.yaml"),
  { existsSync, readFileSync }: FileSystem = fs,
) {
  const configuration = existsSync(configFile)
    ? yaml.parse(readFileSync(configFile).toString())
    : { isDefault: true }

  const { backend: backendConfiguration, ...frontendConfiguration } = configuration

  return { backendConfiguration, frontendConfiguration }
}
