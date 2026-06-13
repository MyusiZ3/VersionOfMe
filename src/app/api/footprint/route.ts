import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // For safety and control, only authenticated users can trigger self-footprint audits
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in to check your footprint." },
        { status: 401 }
      );
    }

    // 2. Parse query params for custom test audit simulation
    const { searchParams } = new URL(request.url);
    const testIp = searchParams.get("testIp");
    const queryEmail = searchParams.get("email");

    // 3. Resolve client IP address from headers or test parameters
    const forwarded = request.headers.get("x-forwarded-for");
    let ip = testIp || (forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1");

    // Fallback if local or private is detected and no testIp is provided
    const isLocalIp = (ipAddress: string) => {
      return (
        ipAddress === "127.0.0.1" || 
        ipAddress === "::1" || 
        ipAddress.startsWith("192.168.") || 
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("172.16.") ||
        ipAddress.startsWith("172.31.")
      );
    };

    // 4. Server-side request delegation (Backend Proxying)
    // Query a geolocation provider on the server side to protect user browser metadata
    let geoData = {
      status: "fail",
      message: "Local or private IP address range",
      query: ip,
      country: "Unknown",
      city: "Localhost",
      isp: "Local Loopback Network"
    };

    if (!isLocalIp(ip)) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,isp,query`, {
          next: { revalidate: 3600 } // cache for 1 hour
        });
        if (geoRes.ok) {
          geoData = await geoRes.json();
        }
      } catch (err) {
        console.error("Failed to fetch geolocation from API:", err);
      }
    }

    // 5. Mock Data Breach Audit (Dynamic Self-Audit check)
    // In a real-world integration, this queries HIBP (HaveIBeenPwned) API server-side using HIBP_API_KEY.
    const emailToCheck = queryEmail || user.email || "";
    const mockBreachesList = [
      {
        name: "Adobe (2013)",
        domain: "adobe.com",
        date: "2013-10-04",
        description: "In October 2013, Adobe suffered a massive security breach exposing email addresses and password hashes.",
        compromisedData: ["Email addresses", "Passwords", "Password hints"],
        severity: "Medium"
      },
      {
        name: "Canva (2019)",
        domain: "canva.com",
        date: "2019-05-24",
        description: "In May 2019, the graphic design tool Canva suffered a data breach exposing user account information.",
        compromisedData: ["Email addresses", "Names", "Usernames", "Passwords"],
        severity: "High"
      },
      {
        name: "LinkedIn (2021)",
        domain: "linkedin.com",
        date: "2021-06-22",
        description: "An archive containing data scraped from 700 million LinkedIn users was posted for sale on a hacker forum.",
        compromisedData: ["Email addresses", "Full names", "Phone numbers", "Job titles"],
        severity: "Low"
      },
      {
        name: "Twitter/X (2023)",
        domain: "twitter.com",
        date: "2023-01-04",
        description: "In January 2023, a data set containing 200 million Twitter profiles was leaked, including emails and creation dates.",
        compromisedData: ["Email addresses", "Usernames", "Created at dates"],
        severity: "Medium"
      },
      {
        name: "MySpace (2016)",
        domain: "myspace.com",
        date: "2016-05-31",
        description: "A historic breach of MySpace containing logins and passwords from older registrations was uploaded to dark web markets.",
        compromisedData: ["Email addresses", "Usernames", "Passwords"],
        severity: "High"
      }
    ];

    // Dynamic simulation logic for demonstration
    const emailLower = emailToCheck.toLowerCase();
    const leaksFound = [];

    if (emailLower.includes("pwned") || emailLower.includes("leak") || emailLower.includes("compromised")) {
      // Include all leaks for testing/demo
      leaksFound.push(...mockBreachesList);
    } else if (emailLower.includes("safe") || emailLower.includes("secure") || emailLower.includes("clean")) {
      // 0 leaks for safe check
    } else {
      // Deterministic triggers based on email contents
      if (emailLower.includes("adobe")) leaksFound.push(mockBreachesList[0]);
      if (emailLower.includes("canva")) leaksFound.push(mockBreachesList[1]);
      if (emailLower.includes("linkedin")) leaksFound.push(mockBreachesList[2]);
      
      // Fallback parity logic if no keyword triggers
      if (leaksFound.length === 0) {
        if (emailLower.length % 2 === 0) {
          leaksFound.push(mockBreachesList[0]); // Adobe
          leaksFound.push(mockBreachesList[3]); // Twitter/X
        }
        if (emailLower.length % 3 === 0) {
          leaksFound.push(mockBreachesList[1]); // Canva
          leaksFound.push(mockBreachesList[4]); // MySpace
        }
      }
    }

    // 6. Construct secure payload
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      email: emailToCheck,
      ip: geoData.query,
      location: {
        country: geoData.country,
        city: geoData.city,
        isp: geoData.isp
      },
      breaches: {
        totalLeaks: leaksFound.length,
        details: leaksFound
      }
    });

  } catch (error: any) {
    console.error("Error in secure footprint API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
