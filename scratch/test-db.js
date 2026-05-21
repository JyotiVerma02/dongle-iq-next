import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://jyotivermafeb9_db_user:Test1234@cluster0.5pemp4z.mongodb.net/dongleIQ?retryWrites=true&w=majority';

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
    const Admin = mongoose.models.Admin || mongoose.model('Admin', userSchema, 'admins');

    const userCount = await User.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log("User count:", userCount);
    console.log("Admin count:", adminCount);

    const users = await User.find().limit(3);
    console.log("Users snippet:", JSON.stringify(users, null, 2));

    const admins = await Admin.find().limit(3);
    console.log("Admins snippet:", JSON.stringify(admins, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected!");
  }
}

run();
