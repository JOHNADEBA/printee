'use client';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Loader from "../Loader"; 
import Error from "../Error"; 
import AddCoinsForm from "./AddCoinsForm";
import Success from "../Success";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const AddCoins: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isLoaded) return <Loader />;
  if (!isSignedIn) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Please sign in to buy coins.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Buy Coins</h1>
      {error && <Error message={error} onDismiss={() => setError(null)} />}
      {success && <Success message='Transaction Successfull' onDismiss={() => setSuccess(null)} />}
      <Elements stripe={stripePromise}>
        <AddCoinsForm setError={setError} setSuccess={setSuccess} />
      </Elements>
    </div>
  );
};

export default AddCoins;