import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState(null);

    const callUserInfo = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_KEY +"/dashboard", {
                method: "GET",
                credentials: 'include',
                headers: {
                    "content-type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            const result = await response.json();
            console.log(result);
            setUserInfo(result);  // Store the user info in state
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    useEffect(() => {
        callUserInfo(); // Fetch user info on component mount
    }, []); // Empty dependency array to run once when the component mounts

    return (
        <div id="dashboard">
            <h1>Welcome! </h1>
            {/* <div>User ID: {Cookies.get("USER_ID")}</div> */}

            {userInfo ? (
                <div>
                    <h2>User Info:</h2>
                    <pre>{JSON.stringify(userInfo, null, 2)}</pre>
                </div>
            ) : (
                <div>Loading user info...</div>
            )}
        </div>
    );
}
