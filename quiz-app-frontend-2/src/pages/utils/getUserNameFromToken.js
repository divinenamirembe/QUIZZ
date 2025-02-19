const getUserNameFromToken = (token) => {
  if (!token) return "Guest";

  try {
    const base64Url = token.split('.')[1]; // Get JWT payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64)); // Decode JWT payload

    console.log("🔹 Decoded Token Payload:", decodedPayload);

    return decodedPayload.name || "Guest"; // ✅ Return name if exists
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return "Guest"; // Fallback
  }
};

export default getUserNameFromToken;
