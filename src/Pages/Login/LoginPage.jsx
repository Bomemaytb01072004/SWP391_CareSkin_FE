import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import image2 from '../../assets/image-login-2.jpg'
import image1 from '../../assets/image-login-1.jpg'
import bgImage from '../../assets/bg-login.png';
import styles from './LoginPage.module.css';


const LoginPage = () => {
    const [rightPanelActive, setRightPanelActive] = useState(false);

    const togglePassword = (inputId, iconElement) => {
        const passwordField = document.getElementById(inputId);
    
        if (passwordField.type === "password") {
            passwordField.type = "text";
            iconElement.classList.remove("fa-eye");
            iconElement.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            iconElement.classList.remove("fa-eye-slash");
            iconElement.classList.add("fa-eye");
        }
    };
    

    return (
        <div 
            style={{
                height: '100vh',
                backgroundImage: `url(${bgImage})`,
                display: 'grid',
                placeContent: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }}
        >
            <div className={`${styles.container_LoginPage} ${rightPanelActive ?  styles.rightPanelActive : ''}`} id="container">
                <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
                <form>
                    <h1>Create Account</h1>
                    <div className={styles.socialContainer}>
                        <a href="#" className={styles.social}><i className="fa-brands fa-facebook" style={{ color: '#2AA4F4' }}></i></a>
                        <a href="#" className={styles.social}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg></a>
                    </div>
                    <span>or use your email for registration</span>
                    <div className={styles.infield_LoginPage}>
                        <input type="email" placeholder="Email" name="emailSignUp" required />
                    </div>
                    <div className={styles.infield_LoginPage}>
                        <input type="text" placeholder="Username" name="usernameSignUp" required />
                    </div>
                    <div className={styles.infield_LoginPage}>
                        <input type="password" id="passwordLogin" placeholder="Password" name="password" required />
                        <i className={`fa-solid fa-eye ${styles.togglePassword}`}  onClick={(e) => togglePassword('passwordLogin', e.target)}></i>
                    </div>
                    <button>Sign Up</button>
                </form>
            </div>

            <div className={`${styles.formContainer} ${styles.signInContainer}`}>
                <form>
                    <h1>Sign in</h1>
                    <div className={styles.socialContainer}>
                        <a href="#" className={styles.social}><i className="fa-brands fa-facebook" style={{ color: '#2AA4F4' }}></i></a>
                        <a href="#" className={styles.social}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg></a>
                    </div>
                    <span>or use your account</span>
                    <div className={styles.infield_LoginPage}>
                        <input type="text" placeholder="Username" name="username" required />
                    </div>
                    <div className={styles.infield_LoginPage}>
                        <input type="password" id="passwordRegister" placeholder="Password" name="passwordSignUp" required />
                        <i className={`fa-solid fa-eye ${styles.togglePassword}`}  onClick={(e) => togglePassword('passwordRegister', e.target)}></i>
                    </div>
                    <a href="#" className={styles.forgot}>Forgot your password?</a>
                    <button>Sign In</button>
                </form>
            </div>

            <div className={styles.overlayContainer} id="overlayCon">
                <div className={styles.overlay}>
                    <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                        <img src={image1} alt="" />
                        <button onClick={() => setRightPanelActive(false)}>Sign In</button>
                    </div>
                    <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                        <img src={image2} alt="" />
                        <button onClick={() => setRightPanelActive(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
            </div>
        </div>
        
    );
};

export default LoginPage;
