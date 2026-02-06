import { NextRequest, NextResponse } from "next/server";

const TAMBO_BASE_URL =
  process.env.TAMBO_URL || "https://api.tambo.co";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.TAMBO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TAMBO_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetPath = path.join("/");
  const targetUrl = `${TAMBO_BASE_URL}/${targetPath}`;

  try {
    const body = await request.text();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // Forward relevant headers
    const acceptHeader = request.headers.get("accept");
    if (acceptHeader) {
      headers["Accept"] = acceptHeader;
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tambo API Error:", response.status, targetUrl);
      console.error("Error Details:", errorText);
      try {
        return NextResponse.json(JSON.parse(errorText), { status: response.status });
      } catch {
        return new NextResponse(errorText, { status: response.status });
      }
    }
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Tambo proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to Tambo" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.TAMBO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TAMBO_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${TAMBO_BASE_URL}/${targetPath}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Tambo proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to Tambo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.TAMBO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TAMBO_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetPath = path.join("/");
  const targetUrl = `${TAMBO_BASE_URL}/${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Tambo proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to Tambo" },
      { status: 500 }
    );
  }
}
