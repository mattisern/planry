import io from "socket.io-client";

const socket = (id) => io.connect("localhost:5000", {query: "room=" + id});

export default socket;