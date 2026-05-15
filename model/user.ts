import mongoose from "mongoose";
import {
  encryptField,
  decryptField,
  hashField,
  isEncrypted,
} from "@/app/lib/encryption";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    number: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      match: [/^[6-9][0-9]{9}$/, "Mobile must be a valid 10 digit Indian number"],
    },

    password: {
      type: String,
      required: true,
    },

    role: { type: String, default: "user" },
    createdBy: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
    createdById: { type: String },
    clientId: { type: String },
    dscId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    isVerified: { type: Boolean, default: false },
    isAadhaarVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued"],
      default: "pending",
    },

    pan: {
      type: String,
      uppercase: true,
      sparse: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
    },
    panHash: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    gender: { type: String },
    dob: { type: String },

    ekycId: { type: String },
    ekycPin: { type: String },
    bpCode: { type: String },

    address: { type: String },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, "Invalid pincode"],
    },
    city: { type: String },
    state: { type: String },

    certificateClass: { type: String },
    tokenType: { type: String },
    certType: { type: String },
    validity: { type: String },
    assistedService: {
      type: String,
      enum: ["Required", "Not Required"],
      default: "Not Required",
    },

    addressProof: { type: String },
    idProof: { type: String },
    photo: { type: String },

    internalRemarks: { type: String },

    price: {
      type: Number,
      min: [0, "Price must be positive"],
    },
    commission: {
  type: Number,
  default: 0,
},

gst: {
  type: Number,
  default: 0,
},

paymentStatus: {
  type: String,
  enum: ["paid", "pending", "unpaid"],
  default: "pending",
},

serviceType: {
  type: String,
  enum: ["dsc", "token", "assisted"],
  default: "dsc",
},

    otp: String,
    otpExpiry: Date,
    aadhaarOtp: String,
    aadhaarOtpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

/**
 * Pre-save middleware: Encrypt sensitive fields before saving
 * Only encrypts PAN if not already encrypted
 */
UserSchema.pre("save", async function () {
  try {
    if (this.pan) {
      const plainPan = isEncrypted(this.pan)
        ? decryptField(this.pan)
        : this.pan;

      this.panHash = hashField(plainPan);

      if (!isEncrypted(this.pan)) {
        this.pan = encryptField(plainPan);
      }
    } else {
      this.panHash = undefined;
    }
  } catch (error) {
    console.error("PAN encryption failed:", error);
    throw error;
  }
});

/**
 * Post-find middleware: Decrypt sensitive fields after retrieval
 * Automatically decrypts PAN for all find operations
 */
UserSchema.post("find", function (docs: Array<{ pan?: string }> | { pan?: string } | null) {
  if (!docs) return;

  const decryptDoc = (doc: { pan?: string } | null) => {
    if (doc && doc.pan && isEncrypted(doc.pan)) {
      try {
        doc.pan = decryptField(doc.pan);
      } catch (error) {
        console.error("Failed to decrypt PAN:", error);
      }
    }
  };

  if (Array.isArray(docs)) {
    docs.forEach(decryptDoc);
  } else {
    decryptDoc(docs);
  }
});

/**
 * Post-findOne middleware: Decrypt sensitive fields
 */
UserSchema.post("findOne", function (doc: { pan?: string } | null) {
  if (doc && doc.pan && isEncrypted(doc.pan)) {
    try {
      doc.pan = decryptField(doc.pan);
    } catch (error) {
      console.error("Failed to decrypt PAN:", error);
    }
  }
});

/**
 * Post-findOneAndUpdate middleware: Decrypt sensitive fields
 */
UserSchema.post("findOneAndUpdate", function (doc: { pan?: string } | null) {
  if (doc && doc.pan && isEncrypted(doc.pan)) {
    try {
      doc.pan = decryptField(doc.pan);
    } catch (error) {
      console.error("Failed to decrypt PAN:", error);
    }
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
