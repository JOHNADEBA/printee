'use client';

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Loader from "../Loader"; 
import Error from "../Error"; 
import AddCoinsForm from "./AddCoinsForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const AddCoins: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

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
      {error && <Error message={error} />}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <p className="text-white text-sm mb-4">Using live mode - enter your real card details.</p>
      <Elements stripe={stripePromise}>
        <AddCoinsForm setError={setError} setSuccess={setSuccess} error={error} success={success} />
      </Elements>
    </div>
  );
};

export default AddCoins;