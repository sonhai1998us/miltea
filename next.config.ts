import type { NextConfig } from "next";

const path = require("path");

/* Package Application */
/** @type {import('next').NextConfig} */
require("dotenv").config({
  path: path.join(
    __dirname,
    ".env" +
    (process.env.NODE_ENV as "production" | "staging" | "development" | "test" === "production" ||
      process.env.NODE_ENV as "production" | "staging" | "development" | "test" === "staging"
      ? "." + process.env.NODE_ENV
      : ".development")
  ),
});

const enviroment = {
  API_URL: process.env.API_URL,
  PREFIX_API: process.env.PREFIX_API,
  GG_CLIENT_ID : process.env.GG_CLIENT_ID ,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  CDN_URL_S3: process.env.CDN_URL_S3,
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  PASSPORT_URL: process.env.PASSPORT_URL,
  DOMAIN_URL: process.env.DOMAIN_URL,
}

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  env: {...enviroment},
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'img.vietqr.io',
      pathname: '/image/**'
    }],
  },
};

export default nextConfig;
