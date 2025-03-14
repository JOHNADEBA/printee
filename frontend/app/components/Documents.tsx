import { useEffect, useState } from "react";
import Link from 'next/link';
import { HISTORY, QUEUE, SET_DOCUMENT, SET_USER } from "../actions";
import { useAppContext } from "../context";
import api from "../services/api";
import { Document, User } from "../types";
import Loader from "./Loader";
import Error from "./Error";
import { FaDownload, FaEye, FaPrint, FaTrash } from "react-icons/fa";

interface PrintQueueProps {
  type: string;
}

const Documents: React.FC<PrintQueueProps> = ({ type }) => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.user.clerkUserId) {
      return;
    }
    fetchDocuments();
  }, [state.user.clerkUserId]); // eslint-disable-next-line react-hooks/exhaustive-deps

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
      if (error instanceof Error) {
        setError((error as Error).message || "Failed to delete document");
      } else {
        setError("Failed to delete document");
      }
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
    } catch (err) {
      if (err instanceof Error) {
        setError((err as Error).message || "Failed to print document");
      } else {
        setError("Failed to print document");
      }
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
    } catch (err) {
      if (err instanceof Error) {
        setError((err as Error).message || "Failed to download file");
      } else {
        setError("Failed to download file");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

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
      {error && <Error message={error} onDismiss={() => setError(null)} />}
      <div className="flex justify-between items-center mb-4">
      <h1 className="text-lg font-bold">{tittle}</h1>
      <div className="flex gap-4">
        {type === QUEUE ? <Link
          href="/add-coins"
          className="border border-solid rounded-lg py-1.5 px-3 text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Buy Coins
        </Link>
       : <Link
          href="/add-document"
          className="border border-solid rounded-lg py-1.5 px-3 text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Add Document
        </Link>}
      </div>
    </div>
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
