import { useEffect } from "react";
import { socket } from "../index"; // Import WebSocket instance
import axios from "./axiosInstance";
const API_URL = process.env.REACT_APP_API_URL; // Backend URL
const waitForUserIP = () =>
    new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const userIP = localStorage.getItem("userIP");
        if (userIP) {
          clearInterval(checkInterval);
          resolve(userIP);
        }
      }, 100); // ✅ Check every 100ms
    });
const useAntiBot = () => {
    useEffect(() => {
      const checkBlockedUser = async () => {
        try {
        const userIP = await waitForUserIP();
        const { data } = await axios.get(`/api/is-rest-bot`, {
            params: { ip: userIP },
          });
            if (data.blocked) {
            window.location.href = "https://google.com";
          }
        } catch (error) {
          console.error("❌ Failed to fetch IP:", error);
        }
      };
      checkBlockedUser();
    }, []);
  };
  
// ✅ Function to Block a User and Trigger WebSocket
export const blockUser = async (ip, clientSessionID) => {
  if (!ip || !clientSessionID) return;

  try {
    socket.emit("redirectUser", { clientSessionID, url: "https://google.com" });
    const { data } = await axios.post(`/api/audit/review`, { ip });
    console.log(data.message);

    // ✅ WebSocket Broadcast to Redirect Blocked User in Real-Time
  } catch (error) {
    console.error("❌ Error blocking user:", error);
  }
};

export default useAntiBot;
