// Shared CORS headers for all Supabase Edge Functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper to create CORS preflight response
export function createCorsResponse(): Response {
  return new Response("ok", { headers: corsHeaders });
}

// Helper to create JSON response with CORS headers
export function createJsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    },
  );
}

// Helper to create error response with CORS headers
export function createErrorResponse(
  error: unknown,
  status = 500,
): Response {
  const message = error instanceof Error
    ? error.message
    : "Internal Server Error";

  return createJsonResponse(
    {
      success: false,
      error: message,
    },
    status,
  );
}
