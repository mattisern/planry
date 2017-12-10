import axios from "axios";

const client = axios.create({
    baseURL: process.env.REACT_APP_API + "/api/",
    timeout: 1000
});

export default client;
