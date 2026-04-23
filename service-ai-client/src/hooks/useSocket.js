import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../services/socket";
import { updateStep, fetchPR } from "../store/slices/prSlice";

export const useSocket = (prId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!prId) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.emit("join:pr", prId);

    socket.on("pr:step", (data) => {
      dispatch(updateStep({ prId, ...data }));
      
      // Auto-refresh the full PR details (including the generated diff and analysis) when complete
      if (data.step === "generate_review" && data.status === "completed") {
        setTimeout(() => dispatch(fetchPR(prId)), 500); // short delay to ensure DB sync
      }
    });

    return () => {
      socket.off("pr:step");
      socket.disconnect();
    };
  }, [prId, dispatch]);
};
