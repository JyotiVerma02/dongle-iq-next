import mongoose from "mongoose";
import { Document } from "mongoose";
import {
  encryptField,
  decryptField,
  hashField,
  isEncrypted,
} from "@/lib/encryption";
import { APPLICATION_STATUSES } from "@/lib/applicationWorkflow";
import { ADMIN_ROLES } from "@/lib/adminRoles";
export interface IUser extends Document {
  pan?: string;
  panHash?: string;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

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
      trim: true,
    },

    number: {
      type: String,
      required: [true, "Number is required"],
      unique: true,
      trim: true,
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

    isVerified: { type: Boolean, default: false },
    isAadhaarVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "pending",
    },

   pan: {
  type: String,
  uppercase: true,
  sparse: true,
  trim: true,
  validate: {
    validator(value: string) {
      if (!value) return true;
      if (isEncrypted(value)) return true;
      return PAN_REGEX.test(value);
    },
    message: "Invalid PAN format",
  },
},

panHash: {
  type: String,
  index: true,
  select: false,
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
    remarksViewed: { type: Boolean, default: false },
    resubmissionDocs: {
      photo: { type: Boolean, default: false },
      idProof: { type: Boolean, default: false },
      addressProof: { type: Boolean, default: false },
    },
    actionHistory: [
      {
        action: { type: String },
        performedBy: { type: String },
        timestamp: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
    statusHistory: [
      {
        fromStatus: { type: String, enum: APPLICATION_STATUSES },
        toStatus: { type: String, enum: APPLICATION_STATUSES },
        changedById: { type: String },
        changedByName: { type: String },
        changedByEmail: { type: String },
        changedByRole: { type: String, enum: ADMIN_ROLES },
        remarks: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    auditTrail: [
      {
        action: { type: String, required: true },
        actorId: { type: String, required: true },
        actorName: { type: String, required: true },
        actorEmail: { type: String, required: true },
        actorRole: { type: String, enum: ADMIN_ROLES, required: true },
        timestamp: { type: Date, default: Date.now },
        changes: [
          {
            field: { type: String, required: true },
            previousValue: { type: mongoose.Schema.Types.Mixed },
            newValue: { type: mongoose.Schema.Types.Mixed },
          },
        ],
        fromStatus: { type: String, enum: APPLICATION_STATUSES },
        toStatus: { type: String, enum: APPLICATION_STATUSES },
        remarks: { type: String },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],

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
 * Safe helper function to decrypt PAN without throwing errors
 */
function safeDecryptPAN(encryptedPan: string | undefined): string | undefined {
  if (!encryptedPan) return encryptedPan;

  try {
    // Check if it's already a valid PAN format (plain text)
    if (PAN_REGEX.test(encryptedPan)) {
      return encryptedPan;
    }

    // Check if it's encrypted
    if (isEncrypted(encryptedPan)) {
      return decryptField(encryptedPan);
    }

    // Return as-is if neither
    return encryptedPan;
  } catch (error) {
    console.error("Failed to decrypt PAN:", error);
    return "[Encrypted - Data needs migration]";
  }
}

/**
 * Pre-save middleware: Encrypt sensitive fields before saving
 */
UserSchema.pre<IUser>("validate", function () {
  try {
    if (this.pan) {
      // Get plain PAN safely
      let plainPan = this.pan;

      // Only try to decrypt if it looks encrypted
      if (isEncrypted(this.pan)) {
        try {
          plainPan = decryptField(this.pan);
        } catch {
          console.warn("Could not decrypt PAN, treating as plain text");
          // Keep as-is
        }
      }

      // Create hash from plain PAN
      this.panHash = hashField(plainPan);

      // Only encrypt if it's not already encrypted
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
 * Transform function to safely handle decryption when sending data to client
 * This replaces the problematic post-find middleware
 */
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = ret as any;
    // Safely decrypt PAN when sending to client
    if (r.pan) {
      r.pan = safeDecryptPAN(r.pan);
    }
    // Remove sensitive fields
    delete r.password;
    delete r.panHash;
    delete r.otp;
    delete r.otpExpiry;
    delete r.aadhaarOtp;
    delete r.aadhaarOtpExpiry;
    delete r.resetToken;
    delete r.resetTokenExpiry;
    return r;
  },
});

UserSchema.set("toObject", {
  transform: function (doc, ret) {
    if (ret.pan) {
      ret.pan = safeDecryptPAN(ret.pan);
    }
    return ret;
  },
});

// Add a method to manually decrypt PAN when needed
UserSchema.methods.getDecryptedPAN = function () {
  return safeDecryptPAN(this.pan);
};

// Add a method to manually encrypt PAN
UserSchema.methods.setEncryptedPAN = function (plainPAN: string) {
  if (!plainPAN) {
    this.pan = undefined;
    this.panHash = undefined;
    return;
  }
  this.pan = encryptField(plainPAN);
  this.panHash = hashField(plainPAN);
};

// Create indexes for better performance

UserSchema.index({ dscId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });


if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  mongoose.deleteModel("User");
}

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
