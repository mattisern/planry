import axios from "axios";

const client = axios.create({
    baseURL: (process.env.NODE_ENV !== "production") ? process.env.REACT_APP_API + "/api/" : "/api/",
    timeout: 1000
});

export default client;
