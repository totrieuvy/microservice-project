import { useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type { Message } from "stompjs";

function useRealtime(callback?: (message: Message) => void) {
  const WS_URL = "http://localhost:8085/websocket";

  const socket = new SockJS(WS_URL);
  const stomp = Stomp.over(socket);

  useEffect(() => {
    const onConnected = () => {
      console.log("WebSocket connected");

      stomp.subscribe("/topic/grooming", (message: Message) => {
        console.log("message received: ", message);
        if (callback) {
          callback(message);
        }
      });
    };

    stomp.connect({}, onConnected, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}

export default useRealtime;
