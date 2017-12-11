import io from "socket.io-client";

const socket = (id) => io.connect(process.env.REACT_APP_API, {query: "room=" + id});

export default socket;