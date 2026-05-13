import fs from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    number: String,
    password: String,
    role: { type: String, default: "user" },
    createdBy: { type: String, default: "admin" },
    createdById: String,
    clientId: String,
    isVerified: Boolean,
    isAadhaarVerified: Boolean,
    status: String,
    pan: String,
    gender: String,
    dob: String,
    ekycId: String,
    ekycPin: String,
    bpCode: String,
    address: String,
    pincode: String,
    city: String,
    state: String,
    certificateClass: String,
    tokenType: String,
    certType: String,
    validity: String,
    addressProof: String,
    idProof: String,
    photo: String,
    internalRemarks: String,
    price: Number,
    commission: Number,
    gst: Number,
    paymentStatus: String,
    serviceType: String,
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Krishna", "Ishaan",
  "Anaya", "Diya", "Saanvi", "Kiara", "Myra",
  "Rohan", "Nikhil", "Kunal", "Siddharth", "Arjun",
  "Priya", "Neha", "Kavya", "Isha", "Ritika",
  "Rahul", "Vikas", "Tarun", "Manish", "Deepak",
  "Sneha", "Pooja", "Riya", "Megha", "Naina",
  "Abhishek", "Harsh", "Mohit", "Shreya", "Tanvi",
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Yadav", "Patel",
  "Mehta", "Mishra", "Jain", "Kumar", "Singh",
  "Agarwal", "Tiwari", "Saxena", "Bansal", "Pandey",
];

const cities = [
  ["Mumbai", "Maharashtra", "400001"],
  ["Delhi", "Delhi", "110001"],
  ["Pune", "Maharashtra", "411001"],
  ["Jaipur", "Rajasthan", "302001"],
  ["Lucknow", "Uttar Pradesh", "226001"],
  ["Indore", "Madhya Pradesh", "452001"],
  ["Bhopal", "Madhya Pradesh", "462001"],
  ["Ahmedabad", "Gujarat", "380001"],
  ["Surat", "Gujarat", "395003"],
  ["Nagpur", "Maharashtra", "440001"],
];

const certificateTypes = ["Signature", "Encryption", "Signing & Encryption"];
const validityOptions = ["1 Year", "2 Years", "3 Years"];
const tokenTypes = ["Not Required", "USB Token"];
const statuses = ["pending", "approved", "rejected"];
const paymentStatuses = ["pending", "paid", "unpaid"];
const serviceTypes = ["dsc", "token", "assisted"];

function makePan(index) {
  const alpha = String.fromCharCode(65 + (index % 26));
  const beta = String.fromCharCode(65 + ((index + 5) % 26));
  return `DONG${alpha}${String(1000 + index)}${beta}`;
}

function makeUser(index, hashedPassword) {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const [city, state, pincode] = cities[index % cities.length];
  const certType = certificateTypes[index % certificateTypes.length];
  const validity = validityOptions[index % validityOptions.length];
  const tokenType = tokenTypes[index % tokenTypes.length];
  const status = statuses[index % statuses.length];
  const paymentStatus = paymentStatuses[index % paymentStatuses.length];
  const serviceType = serviceTypes[index % serviceTypes.length];
  const price = 1499 + index * 125;
  const commission = 180 + index * 12;
  const gst = Math.round(price * 0.18);
  const mobile = `9${String(876543210 + index).padStart(9, "0")}`.slice(0, 10);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.com`;

  return {
    name: `${firstName} ${lastName}`,
    email,
    number: mobile,
    password: hashedPassword,
    role: "user",
    createdBy: "admin",
    createdById: "dummy-seed-script",
    clientId: `CLIENT-${String(index + 1).padStart(3, "0")}`,
    isVerified: index % 2 === 0,
    isAadhaarVerified: index % 3 !== 0,
    status,
    pan: makePan(index),
    gender: index % 2 === 0 ? "Male" : "Female",
    dob: `${String((index % 28) + 1).padStart(2, "0")}-${String((index % 12) + 1).padStart(2, "0")}-199${index % 10}`,
    ekycId: `ekyc${index + 1}@dongleiq`,
    ekycPin: String(100000 + index),
    bpCode: `BP${String(index + 1).padStart(4, "0")}`,
    address: `${12 + index}, ${lastName} Residency, Sector ${((index % 9) + 1) * 2}`,
    pincode,
    city,
    state,
    certificateClass: "Class III",
    tokenType,
    certType,
    validity,
    addressProof: `https://placehold.co/1200x800/png?text=Address+Proof+${index + 1}`,
    idProof: `https://placehold.co/1200x800/png?text=ID+Proof+${index + 1}`,
    photo: `https://placehold.co/600x600/png?text=Photo+${index + 1}`,
    internalRemarks:
      status === "approved"
        ? "Documents verified and approved by admin."
        : status === "rejected"
          ? "Please re-upload clearer proof and correct profile details."
          : "Waiting for review from the admin team.",
    price,
    commission,
    gst,
    paymentStatus,
    serviceType,
  };
}

async function seedDummyUsers() {
  await mongoose.connect(MONGODB_URI, {
    ssl: true,
    authSource: "admin",
  });

  const hashedPassword = await bcrypt.hash("temp123", 10);
  const totalUsers = 35;
  let insertedOrUpdated = 0;

  for (let index = 0; index < totalUsers; index += 1) {
    const user = makeUser(index, hashedPassword);

    await User.updateOne(
      {
        $or: [{ email: user.email }, { number: user.number }],
      },
      {
        $set: user,
      },
      { upsert: true },
    );

    insertedOrUpdated += 1;
  }

  const storedCount = await User.countDocuments({ role: { $ne: "admin" } });

  console.log(`Seeded ${insertedOrUpdated} dummy users.`);
  console.log(`Total non-admin users in MongoDB: ${storedCount}`);

  await mongoose.disconnect();
}

seedDummyUsers().catch(async (error) => {
  console.error("Dummy user seed failed:", error);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exitCode = 1;
});
