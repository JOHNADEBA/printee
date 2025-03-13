import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { SET_USER } from "@/app/actions";
import { useAppContext } from "@/app/context";
import api from "@/app/services/api";
import { AddCoinsFormProps, User } from "@/app/types";

const AddCoinsForm: React.FC<AddCoinsFormProps> = ({
  setError,
  setSuccess,
}) => {
  const { user, isSignedIn } = useUser();
  const { dispatch, state } = useAppContext();
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState<boolean>(false);

  const cardElementOptions = {
    style: {
      base: {
        color: "#ffffff", // White text
        "::placeholder": {
          color: "#a0aec0", // Light gray placeholder
        },
      },
      invalid: {
        color: "#ef4444", // Red for errors
      },
    },
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === "" ? "" : parseInt(value, 10));
    setError("");
    setSuccess("");
  };

  const updateUser = async () => {
    const userResponse = await api.get<User>(`/user/${state.user.id}`);
    if (userResponse.data) {
      dispatch({ type: SET_USER, payload: userResponse.data });
    } else {
      setError(userResponse.error || "Failed to fetch user data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter a positive amount.");
      return;
    }
    if (!stripe || !elements || !isSignedIn || !user) {
      setError("Payment system not ready or user not signed in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create payment intent
      const response = await api.post<{ clientSecret: string }>(
        "/user/create-payment-intent",
        { amount }
      );
      if (!response.data) {
        throw new Error(response.error || "Failed to create payment intent");
      }

      // Step 2: Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        // Step 3: Confirm on backend and update coins
        const confirmResponse = await api.post<{ coins: number }>(
          "/user/confirm-payment",
          { paymentIntentId: paymentIntent.id }
        );

        if (confirmResponse.data) {
          setSuccess(
            `Added ${amount} coins! New balance: ${confirmResponse.data.coins}`
          );
          setAmount("");
          updateUser();
        } else {
          throw new Error(confirmResponse.error || "Failed to update coins");
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred during payment");
      } else {
        setError("An error occurred during payment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-400 mb-1"
        >
          Amount of Coins to Buy (€1 = 1 coin)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          min="1"
          className="block w-full p-2 border border-gray-300 rounded  focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount (e.g., 10)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Card Details
        </label>
        <CardElement
          options={cardElementOptions}
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !amount || !stripe || !elements}
        className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Buy Coins"}
      </button>
    </form>
  );
};

export default AddCoinsForm;
