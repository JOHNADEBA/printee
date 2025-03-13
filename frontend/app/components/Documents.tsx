import { use, useEffect, useState } from "react";
import { CLOSE_SIDEBAR, HISTORY, QUEUE, SET_DOCUMENT, SET_USER } from "../actions";
import { useAppContext } from "../context";
import api from "../services/api";
import { Document, User } from "../types";
import Loader from "./Loader";
import Error from "./Error";
import Link from "next/link";
import { FaDownload, FaEye, FaPrint, FaTrash } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";

interface PrintQueueProps {
  type: string;
}

const Documents: React.FC<PrintQueueProps> = ({ type }) => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { user } = useUser();

  useEffect(() => {
    if (!state.user.clerkUserId) {
      return;
    }
    fetchDocuments();
  }, [state.user.clerkUserId]);

  const fetchDocuments = async () => {
    const response = await api.get<Document[]>(
      "/documents/queue",
      {},
      setLoading
    );
    if (response.data) {
      dispatch({ type: SET_DOCUMENT, payload: response.data });
    } else {
      setError(response.error || "Failed to fetch documents");
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.delete(`/documents/${id}`);
      if (response.data) {
        dispatch({
          type: SET_DOCUMENT,
          payload: state.documents.filter((doc) => doc.id !== id),
        });
      } else {
        setError(response.error || "Failed to delete document");
      }
    } catch (error) {
      setError("Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const printResponse = await api.post(`/documents/print/${id}`, {});
      if (!printResponse.data) {
        setError(printResponse.error || "Failed to print document");
        return;
      }
      await fetchDocuments();

      const userResponse = await api.get<User>(`/user/${state.user.id}`);
      if (userResponse.data) {
        dispatch({ type: SET_USER, payload: userResponse.data });
      } else {
        setError(userResponse.error || "Failed to fetch user data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to print document");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (fileUrl: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${fileUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (id: number, filename: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/download/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setError(
          `Failed to download file: ${
            errorData?.message || response.statusText
          }`
        );
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Error message={error} />;

  if (state.documents.length === 0) {
    return (
      <div className="p-6">
        <p>
          No documents uploaded yet.{" "}
          <Link href="/add-document" className="text-blue-500">
            ADD A DOCUMENT
          </Link>
        </p>
      </div>
    );
  }

  // Filter documents to show only those where isPrinted is false
  let formattedDocuments;
  let tittle;
  if (type === HISTORY) {
    formattedDocuments = state.documents;
    tittle = "History";
  } else if (type === QUEUE) {
    formattedDocuments = state.documents.filter((doc) => !doc.isPrinted);
    tittle = "Print Queue";
  }
  return (
    <div className="p-6 max-w-[70%] min-w-[100%] md:min-w-0 mx-auto">
      {error && <Error message={error} />}
      <h1 className="text-lg font-bold mb-4">{tittle}</h1>
      <div
        className="overflow-x-auto "
        style={{
          scrollbarWidth: "thin", // Firefox scrollbar
          scrollbarColor: "#4A5568 #2D3748", // Firefox colors
        }}
      >
        <table className="w-full border border-white text-left mb-2">
          <thead>
            <tr className="border-b border-white">
              <th className="p-2">Filename</th>
              <th className="p-2">Page Count</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formattedDocuments?.map((doc) => (
              <tr key={doc.id} className="border-b border-white">
                <td className="p-2">{doc.filename}</td>
                <td className="p-2">{doc.pageCount || "N/A"}</td>
                <td className="p-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleView(doc.fileUrl)}
                    className="px-3 py-1 text-white rounded cursor-pointer"
                  >
                    <FaEye className="text-blue-400 hover:text-blue-700" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.filename)}
                    className="px-3 py-1 text-white rounded cursor-pointer"
                  >
                    <FaDownload className="text-green-400 hover:text-green-700" />
                  </button>
                  <button
                    onClick={() => handlePrint(doc.id)}
                    className="px-3 py-1 rounded text-white cursor-pointer"
                  >
                    <FaPrint className="text-yellow-400 hover:text-yellow-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-1 text-white rounded cursor-pointer"
                  >
                    <FaTrash className="text-red-700 hover:text-red-900" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Documents;
