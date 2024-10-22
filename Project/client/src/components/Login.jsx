import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


export default function Login() {
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate=useNavigate();
    // const [message, setMessage] = useState("");
    
    function handleInputChange(identifier, value) {
        if (identifier === "email") {
            setEnteredEmail(value);
        } else {
            setEnteredPassword(value);
        }
    }
    
    const handleLogin = async () => {
        setSubmitted(true);

        const formBody=JSON.stringify({
            email:enteredEmail,
            password:enteredPassword
        })

        const result= await fetch('http://localhost:8080/user/login',{
            method:"POST",
            body:formBody,
            headers:{
                'content-type':'application/json'
            }
        });

        if(result.ok){
            const data=result.json();
            console.log(data)
            // console.log(result);

        }
        navigate('/dashboard')
    };

    const emailNotValid = submitted && !enteredEmail.includes("@");
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;

    return (
        <div id="login">
            {/* {message && <label>{message}</label>} */}
            <p style={{color:"red"}}>Learning Styling Components</p>
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
