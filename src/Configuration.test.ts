import { describe, expect, it, vi } from "vitest"
import { Configuration } from "./Configuration.js"

const content = `frontendTest: 42
jwtSecret: my-secret
backend:
  backendTest: 815
`

function getMockFs() {
  return {
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue(content),
  }
}

describe("Configuration", () => {
  it("should return frontend configuration info", () => {
    const { frontendConfiguration } = Configuration("/conf/config.yaml", getMockFs())
    expect(frontendConfiguration).toContain({ frontendTest: 42 })
  })

  it("should not include backendConfiguration in frontendCondiguration", () => {
    const { frontendConfiguration } = Configuration("/conf/config.yaml", getMockFs())
    expect(frontendConfiguration).not.toHaveProperty("backend")
  })

  it("should return backend configuration info", () => {
    const { backendConfiguration } = Configuration("/conf/config.yaml", getMockFs())
    expect(backendConfiguration).toContain({ backendTest: 815 })
  })

  it("should return the default configuration if the file doesn't exist", () => {
    const { frontendConfiguration } = Configuration("non-existing.yaml")
    expect(frontendConfiguration).toContain({ isDefault: true })
  })
})
