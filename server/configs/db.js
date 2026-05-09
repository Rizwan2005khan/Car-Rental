import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing from the environment");
    }

    mongoose.connection.on("connected", () => console.log("Database Connected"));
    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error.message);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "car-rental",
        serverSelectionTimeoutMS: 10000,
    });
};

export default connectDB;
