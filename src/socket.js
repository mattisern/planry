import io from "socket.io-client";

const socket = (id) => io.connect("", {query: "room=" + id});

export default socket;