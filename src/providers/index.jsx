"use client";

import { ClassProvider } from "./class.provider";
import { CompanionProvider } from "./companion.provider";
import GoogleAuthProvider from "./google-auth.provider";
import { LocaleProvider } from "./locale.provider";
import QueryProvider from "./query.provider";
import { ThemeProvider } from "./theme.provider";

export default function Providers({ bands = [], children }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ClassProvider bands={bands}>
          <CompanionProvider>
            <GoogleAuthProvider>
              <QueryProvider>{children}</QueryProvider>
            </GoogleAuthProvider>
          </CompanionProvider>
        </ClassProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}