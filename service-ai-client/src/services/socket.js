import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;
