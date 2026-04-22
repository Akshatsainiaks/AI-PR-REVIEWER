import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../services/socket";
import { updateStep } from "../store/slices/prSlice";

export const useSocket = (prId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!prId) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.emit("join:pr", prId);

    socket.on("pr:step", (data) => {
      dispatch(updateStep({ prId, ...data }));
    });

    return () => {
      socket.off("pr:step");
      socket.disconnect();
    };
  }, [prId, dispatch]);
};
