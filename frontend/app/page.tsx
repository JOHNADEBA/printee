"use client";

import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAppContext } from "./context";
import { CLOSE_SIDEBAR, QUEUE, SET_USER } from "./actions";
import { User } from "./types";
import api from "./services/api";
import Documents from "./components/Documents";
import Loader from "./components/Loader";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { dispatch } = useAppContext();
  const { redirectToSignIn } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn && !user) {
      redirectToSignIn(); // Redirects instead of opening modal
    } else {
      verifyUser();
    }
  }, [isSignedIn, user, isLoaded]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const verifyUser = async () => {
    const res = await api.post<{ user: User; token: string }>(`/user`, {
      clerkUserId: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.primaryEmailAddress?.emailAddress,
    });
    if (!res.data) return;

    dispatch({ type: SET_USER, payload: res.data.user });
    localStorage.setItem("token", res.data.token);
  };

  if (!isLoaded && !user) return <Loader />;
  if (isSignedIn)
    return (
      <div
        className="min-h-[calc(100vh-4rem)]"
        onClick={() => dispatch({ type: CLOSE_SIDEBAR })}
      >
        <Documents type={QUEUE} />
      </div>
    );
}
