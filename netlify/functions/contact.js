const { sendContactEmail } = require("../../contact-email");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: JSON.stringify({ message: "Method not allowed." })
    };
  }

  let body;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body;
    body = JSON.parse(rawBody || "");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Please send a valid JSON request." })
    };
  }

  try {
    await sendContactEmail(body);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Your message was sent successfully." })
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error.message || "Unable to send your message right now."
      })
    };
  }
};
