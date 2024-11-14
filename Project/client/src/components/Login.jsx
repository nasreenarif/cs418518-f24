import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const refRecaptch=useRef(null);

    function handleInputChange(identifier, value) {
        if (identifier === "email") {
            setEnteredEmail(value);
        } else {
            setEnteredPassword(value);
        }
    }

    const handleLogin = async (event) => {

        event.preventDefault();

        const currentValue=refRecaptch.current.getValue();
        if(!currentValue){
            alert("Please verify you are not bot!")
        }
        else{

        setSubmitted(true);

        const formBody = JSON.stringify({
            email: enteredEmail,
            password: enteredPassword,
        });

         await fetch(import.meta.env.VITE_API_KEY +"/user/login", {
            method: "POST",
            body: formBody,
            headers: {
                "content-type": "application/json",
            },
        }).then((response) => response.json())
        .then((result) => {
          if(result.status == 200){
            console.log(result.data);
            console.log(result);
            navigate("/dashboard");            
           } else {
            setMessage("Invalid Credentials");
           }
        });      
    }  
    };

    const emailNotValid = submitted && !enteredEmail.includes("@");
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;

    return (
        <div id="login">
            {message && <label>{message}</label>}
            <p style={{ color: "red" }}>Learning Styling Components</p>
            <div className="controls">
                <p>
                    <label>Email</label>
                    <input
                        type="email"
                        className={emailNotValid ? "invalid" : undefined}
                        onChange={(event) => handleInputChange("email", event.target.value)}
                    />
                </p>
                <p>
                    <label>Password</label>
                    <input
                        type="password"
                        className={passwordNotValid ? "invalid" : undefined}
                        onChange={(event) =>
                            handleInputChange("password", event.target.value)
                        }
                    />
                </p>
                <ReCAPTCHA sitekey={import.meta.env.VITE_SITE_KEY} ref={refRecaptch} ></ReCAPTCHA>
            </div>
            <div className="actions">
                <button type="button" className="text-button">
                    Create a new account
                </button>
                <button className="button" onClick={handleLogin}>
                    Sign In
                </button>
            </div>
        </div>
    );
}
