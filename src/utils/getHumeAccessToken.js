// utils/getHumeAccessToken.js
'use server';

import { fetchAccessToken } from "hume";

export const getHumeAccessToken = async () => {
  try {
    console.log("Fetching Hume access token...");
    
    const accessToken = await fetchAccessToken({
      apiKey: String(process.env.HUME_API_KEY),
      secretKey: String(process.env.HUME_SECRET_KEY),
    });
    
    console.log("Token fetch result:", !!accessToken);
    
    if (accessToken === "undefined") {
      return null;
    }
    
    return accessToken ?? null;
  } catch (error) {
    console.error("Error fetching Hume token:", error);
    return null;
  }
};