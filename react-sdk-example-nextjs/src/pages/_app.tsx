import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DataShopLoggerProvider } from "@/lib/DataShopLoggerContext";

// Use proxy in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const loggerConfig = {
  log_service_url: isDevelopment 
    ? "/datashop-proxy"  // Use Next.js rewrite in development
    : "https://pslc-qa.andrew.cmu.edu/log/server",  // Direct in production
  dataset_name: "eason-test-0720",
  problem_name: "NextJS_SDK_Quiz_Example",
  // user_guid will be auto-generated and persisted in localStorage
  dataset_level_name1: "SDK_Type",
  dataset_level_type1: "sdk_type",
  dataset_level_name2: "NextJS_SDK",
  dataset_level_type2: "section"
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DataShopLoggerProvider
      config={loggerConfig}
      autoInitialize={true}
      persistSession={true}
    >
      <Component {...pageProps} />
    </DataShopLoggerProvider>
  );
}
