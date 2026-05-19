import { calculatePricing } from "../src/lib/pricing";

// Helper for testing
let passedTests = 0;
let failedTests = 0;

function describe(name: string, fn: () => void) {
  console.log(`\n\x1b[35m=== ${name} ===\x1b[0m`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  \x1b[32m✔ Passed:\x1b[0m ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  \x1b[31m✘ Failed:\x1b[0m ${name}`);
    console.error(`    Error: ${error.message}`);
    failedTests++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected: any) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected ${b} but got ${a}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) {
        throw new Error(`Expected greater than ${expected} but got ${actual}`);
      }
    }
  };
}

// 1. UNIT TESTS
describe("Unit Tests: calculatePricing", () => {
  it("should calculate correct base pricing for signature type", () => {
    const result = calculatePricing({ certType: "signature" });
    expect(result.certificate).toBe(800);
    expect(result.total).toBe(800);
  });

  it("should add USB Token charge if requested", () => {
    const result = calculatePricing({ certType: "signature", tokenType: "USB Token" });
    expect(result.token).toBe(500);
    expect(result.total).toBe(1300);
  });

  it("should add Assisted Service charge if requested", () => {
    const result = calculatePricing({ certType: "signature", assistedService: "Required" });
    expect(result.assisted).toBe(355);
    expect(result.total).toBe(1155);
  });

  it("should calculate correct 2 Years signing & encryption cert pricing", () => {
    const result = calculatePricing({
      certType: "signing & encryption",
      validity: "2 Years",
      tokenType: "USB Token",
      assistedService: "Required"
    });
    expect(result.certificate).toBe(1779);
    expect(result.token).toBe(500);
    expect(result.assisted).toBe(355);
    expect(result.total).toBe(1779 + 500 + 355);
  });
});

// 2. INTEGRATION TESTS (MOCK LIFECYCLE)
describe("Integration Tests: User Application Lifecycle Simulation", () => {
  let mockUser = {
    mobile: "9876543210",
    name: "John Doe",
    email: "john@example.com",
    status: "pending",
    paymentSettled: false,
    resubmissionDocs: { photo: false, idProof: false, addressProof: false },
    actionHistory: [] as any[]
  };

  it("Step 1: Create application draft in pending status", () => {
    expect(mockUser.status).toBe("pending");
    expect(mockUser.paymentSettled).toBe(false);
    mockUser.actionHistory.push({
      action: "submitted",
      performedBy: "user",
      timestamp: new Date().toISOString(),
      remarks: "Initial submission"
    });
    expect(mockUser.actionHistory.length).toBe(1);
  });

  it("Step 2: Submit payment and mark settled", () => {
    mockUser.paymentSettled = true;
    mockUser.actionHistory.push({
      action: "paid",
      performedBy: "user",
      timestamp: new Date().toISOString(),
      remarks: "Payment verified successfully"
    });
    expect(mockUser.paymentSettled).toBe(true);
    expect(mockUser.actionHistory.length).toBe(2);
  });

  it("Step 3: Admin rejects application for document resubmission", () => {
    mockUser.status = "rejected";
    mockUser.resubmissionDocs.photo = true; // Photo needs resubmission
    mockUser.actionHistory.push({
      action: "rejected",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      remarks: "Photo is blurry. Please upload clear photo."
    });
    expect(mockUser.status).toBe("rejected");
    expect(mockUser.resubmissionDocs.photo).toBe(true);
    expect(mockUser.resubmissionDocs.idProof).toBe(false);
  });

  it("Step 4: User uploads corrected photo and resubmits", () => {
    mockUser.status = "pending";
    mockUser.actionHistory.push({
      action: "resubmitted",
      performedBy: "user",
      timestamp: new Date().toISOString(),
      remarks: "Uploaded high-resolution photo."
    });
    expect(mockUser.status).toBe("pending");
    expect(mockUser.actionHistory.length).toBe(4);
  });

  it("Step 5: Admin approves and issues certificate", () => {
    mockUser.status = "issued";
    mockUser.actionHistory.push({
      action: "issued",
      performedBy: "admin",
      timestamp: new Date().toISOString(),
      remarks: "Certificate generated successfully"
    });
    expect(mockUser.status).toBe("issued");
    expect(mockUser.actionHistory.length).toBe(5);
  });
});

console.log(`\n\x1b[36m=== Test Execution Summary ===\x1b[0m`);
console.log(`Total Passed: \x1b[32m${passedTests}\x1b[0m`);
console.log(`Total Failed: \x1b[31m${failedTests}\x1b[0m`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("\n\x1b[32;1mAll tests completed successfully!\x1b[0m\n");
  process.exit(0);
}
