import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleGoogleResponse = async () => {
            const query = new URLSearchParams(window.location.search);
            const token = query.get("token");

            if (!token) {
                console.error("Google login failed: No token received");
                navigate("/joinus");
                return;
            }

            localStorage.setItem("token", token);
            navigate("/");
        };

        handleGoogleResponse();
    }, [navigate]);

    return <div>Processing Google Login...</div>;
};

export default GoogleCallback;