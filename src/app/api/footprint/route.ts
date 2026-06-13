import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user session safely (optional/best effort)
    let user: any = null;
    try {
      const supabase = await createClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (!authError && data?.user) {
        user = data.user;
      }
    } catch (authErr) {
      console.warn("Supabase auth check bypassed/failed:", authErr);
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const testIp = searchParams.get("testIp");
    const queryEmail = searchParams.get("email");

    // 3. Resolve client IP
    const forwarded = request.headers.get("x-forwarded-for");
    let ip = testIp || (forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1");

    // Local IP helper
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

    // 4. Geolocation Audit
    let geoData: any = {
      status: "fail",
      message: "Local or private IP address range",
      query: ip,
      country: "Unknown",
      countryCode: "N/A",
      regionName: "N/A",
      city: "Localhost",
      zip: "N/A",
      isp: "Local Loopback Network",
      org: "N/A",
      lat: 0.0,
      lon: 0.0,
      timezone: "UTC"
    };

    // If local and we want to resolve something real, we can try to fetch the server's public IP
    let resolvedIp = ip;
    if (isLocalIp(ip)) {
      try {
        const ipifyRes = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
        if (ipifyRes.ok) {
          const ipifyData = await ipifyRes.json();
          if (ipifyData && ipifyData.ip) {
            resolvedIp = ipifyData.ip;
          }
        }
      } catch (err) {
        console.warn("Failed to resolve server public IP:", err);
      }
    }

    // Call geolocation API with resolved IP (if not local)
    if (!isLocalIp(resolvedIp)) {
      try {
        const fields = "status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,query";
        const geoRes = await fetch(`http://ip-api.com/json/${resolvedIp}?fields=${fields}`, {
          next: { revalidate: 3600 } // cache for 1 hour
        });
        if (geoRes.ok) {
          geoData = await geoRes.json();
        }
      } catch (err) {
        console.error("Failed to fetch geolocation from API:", err);
      }
    }

    // 5. Data Breach Audit (Real integration using XposedOrNot)
    const emailToCheck = queryEmail || user?.email || "";
    let leaksFound: any[] = [];
    let isRealData = false;

    if (emailToCheck && emailToCheck.includes("@")) {
      try {
        // Fetch from XposedOrNot breach-analytics API
        const xposedRes = await fetch(
          `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(emailToCheck)}`,
          {
            headers: {
              "User-Agent": "VersionOfMe-Security-Audit/1.0"
            },
            next: { revalidate: 300 } // cache for 5 mins
          }
        );

        if (xposedRes.ok) {
          const xposedData = await xposedRes.json();
          isRealData = true;
          
          if (xposedData && xposedData.ExposedBreaches && xposedData.ExposedBreaches.breaches) {
            const rawBreaches = xposedData.ExposedBreaches.breaches;
            leaksFound = rawBreaches.map((b: any) => {
              const xposedDataStr = b.xposed_data || "";
              const xposedDataArray = xposedDataStr
                .split(";")
                .map((s: string) => s.trim())
                .filter(Boolean);

              // Determine severity
              let severity = "Low";
              if (
                xposedDataArray.some((d: string) => d.toLowerCase().includes("password")) ||
                b.password_risk === "easytocrack"
              ) {
                severity = "High";
              } else if (
                xposedDataArray.some((d: string) =>
                  d.toLowerCase().includes("phone") ||
                  d.toLowerCase().includes("address") ||
                  d.toLowerCase().includes("ssn") ||
                  d.toLowerCase().includes("national id") ||
                  d.toLowerCase().includes("credit card")
                )
              ) {
                severity = "Medium";
              }

              return {
                name: b.breach || "Unknown Breach",
                domain: b.domain || "N/A",
                date: b.xposed_date || "Unknown",
                description: b.details || "No details provided.",
                dataClasses: xposedDataArray.length > 0 ? xposedDataArray : ["Email addresses"],
                severity: severity
              };
            });
          }
        } else if (xposedRes.status === 404) {
          // XposedOrNot returns 404 or specific responses if not found. Let's make sure it's handled.
          isRealData = true;
          leaksFound = [];
        } else {
          console.warn(`XposedOrNot returned status ${xposedRes.status}. Falling back to simulation.`);
        }
      } catch (err) {
        console.error("Failed to query real breach API:", err);
      }
    }

    // Fallback/simulation if no real data was obtained (e.g. rate limit, offline, invalid email, or sandbox check)
    if (!isRealData) {
      const mockBreachesList = [
        {
          name: "Adobe (2013)",
          domain: "adobe.com",
          date: "2013-10-04",
          description: "In October 2013, Adobe suffered a massive security breach exposing email addresses and password hashes.",
          dataClasses: ["Email addresses", "Passwords", "Password hints"],
          severity: "Medium"
        },
        {
          name: "Canva (2019)",
          domain: "canva.com",
          date: "2019-05-24",
          description: "In May 2019, the graphic design tool Canva suffered a data breach exposing user account information.",
          dataClasses: ["Email addresses", "Names", "Usernames", "Passwords"],
          severity: "High"
        },
        {
          name: "LinkedIn (2021)",
          domain: "linkedin.com",
          date: "2021-06-22",
          description: "An archive containing data scraped from 700 million LinkedIn users was posted for sale on a hacker forum.",
          dataClasses: ["Email addresses", "Full names", "Phone numbers", "Job titles"],
          severity: "Low"
        },
        {
          name: "Twitter/X (2023)",
          domain: "twitter.com",
          date: "2023-01-04",
          description: "In January 2023, a data set containing 200 million Twitter profiles was leaked, including emails and creation dates.",
          dataClasses: ["Email addresses", "Usernames", "Created at dates"],
          severity: "Medium"
        },
        {
          name: "MySpace (2016)",
          domain: "myspace.com",
          date: "2016-05-31",
          description: "A historic breach of MySpace containing logins and passwords from older registrations was uploaded to dark web markets.",
          dataClasses: ["Email addresses", "Usernames", "Passwords"],
          severity: "High"
        }
      ];

      const emailLower = emailToCheck.toLowerCase();

      if (emailLower.includes("pwned") || emailLower.includes("leak") || emailLower.includes("compromised")) {
        leaksFound.push(...mockBreachesList);
      } else if (emailLower.includes("safe") || emailLower.includes("secure") || emailLower.includes("clean")) {
        // No leaks
      } else {
        // Deterministic triggers
        if (emailLower.includes("adobe")) leaksFound.push(mockBreachesList[0]);
        if (emailLower.includes("canva")) leaksFound.push(mockBreachesList[1]);
        if (emailLower.includes("linkedin")) leaksFound.push(mockBreachesList[2]);
        
        if (leaksFound.length === 0 && emailToCheck) {
          if (emailLower.length % 2 === 0) {
            leaksFound.push(mockBreachesList[0]);
            leaksFound.push(mockBreachesList[3]);
          }
          if (emailLower.length % 3 === 0) {
            leaksFound.push(mockBreachesList[1]);
            leaksFound.push(mockBreachesList[4]);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      email: emailToCheck,
      ip: geoData.query,
      geoloc: {
        countryCode: geoData.countryCode || "N/A",
        country: geoData.country || "Unknown",
        regionName: geoData.regionName || "N/A",
        city: geoData.city || "Localhost",
        zip: geoData.zip || "N/A",
        isp: geoData.isp || "Local Loopback Network",
        org: geoData.org || "N/A",
        lat: geoData.lat,
        lon: geoData.lon,
        timezone: geoData.timezone || ""
      },
      breaches: {
        emailAudited: emailToCheck,
        totalLeaks: leaksFound.length,
        leaks: leaksFound
      },
      isRealAudit: isRealData
    });

  } catch (error: any) {
    console.error("Error in secure footprint API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
