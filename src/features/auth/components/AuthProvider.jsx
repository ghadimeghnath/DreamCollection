"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "../authSlice";

export default function AuthProvider({ children }) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(setCredentials(session.user));
    }
  }, [session, dispatch]);

  return <>{children}</>;
}