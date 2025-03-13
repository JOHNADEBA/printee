"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import api from "../services/api";
import Loader from "./Loader";
import Error from "./Error";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const Upload: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 20MB limit.");
      setFile(null);
    } else {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!isSignedIn || !user) {
      setError("You must be signed in to upload a file.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clerkUserId", user.id);

    try {
      const response = await api.upload(
        "/documents/upload",
        formData,
        {},
        setLoading
      );
      if (response.data) {
        router.push("/");
      } else {
        setError(response.error || "Failed to upload file");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError((err as Error).message || "An error occurred during upload");
      } else {
        setError("An error occurred during upload");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <Loader />;
  if (!isSignedIn) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Please sign in to upload a file.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload a Document</h1>
      {loading && <Loader />}
      {error && <Error message={error} />}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Select a file to upload (Max 20MB)
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default Upload;
