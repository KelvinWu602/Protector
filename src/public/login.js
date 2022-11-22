const Login = function () {

    //Forgive me for doing it the react way

    //Input field caches
    let userName = "";
    let userPassword = "";

    let registerUserName = "";
    let registerPassword = "";
    let registerPasswordConfirm = "";

    //Login information, record the username if logged in, can be read by other modules 
    let username_logged_in = "";

    function init() {
        /**
         * ==========================================
         * LOGIN
         * ==========================================
         */

        //Username Listener
        document.getElementById("usernameInput").addEventListener("input", (e) => {
            userName = e.target.value;
            console.log(userName)
        })

        //Password Listener
        document.getElementById("passwordInput").addEventListener("input", (e) => {
            userPassword = e.target.value;
        })

        // Handling Login
        document.getElementById("LoginButton").onclick = () => {
            console.log("setup login onclick event");
            doSignin();
        }

        document.querySelector("#SignInWarning").style.display = "none";

        /**
         * ==========================================
         * REGISTER
         * ==========================================
         */

        document.getElementById("usernameRegister").addEventListener("input", (e) => {
            registerUserName = e.target.value;
            console.log(registerUserName);
        })

        document.getElementById("passwordRegister").addEventListener("input", (e) => {
            registerPassword = e.target.value;
        })

        document.getElementById("passwordRegisterConfirm").addEventListener("input", (e) => {
            registerPasswordConfirm = e.target.value;
        })

        document.getElementById("RegisterButton").onclick = () => {
            console.log("setup register onclick event")
            doRegister();
        }

        document.querySelector("#RegisterWarning").style.display = "none";

        /**
         * ==========================================
         * LOGIN
         * ==========================================
         */

        //Handling signin/register add logic
        document.getElementById("CreateAccount").onclick = () => {
            document.querySelector("#SignInLeft").style.display = "none";
            document.querySelector("#CreateAccountLeft").style.display = "block";
        }
    
        document.getElementById("CreateAccountBack").onclick = () => {
            document.querySelector("#SignInLeft").style.display = "block";
            document.querySelector("#CreateAccountLeft").style.display = "none";
        }

        doValidate();
    }

    /**
     * Function called when the website finished loading
     * Sends an AJAX request to express server
     */
    async function doValidate() {
        

        /**
         * ===========================================
         * TODO: 
         * Start the server and check that this fetch is done correctly. 
         * (i.e. Check datatype etc...)
         * 
         * Also make sure the return error message is good cuz I'll render that message directly
         * 
         * When ready, uncomment the fetch and comment all code below this line
         * ===========================================
         */
        await fetch("/validate")
        .then((res) => {
            return(res.json())
        }).then((json) => {
            if (json.status == "success") {
                console.log("Logged in last time, auto signed in");
                username_logged_in = userName;
                console.log("logged in as: " + username_logged_in);
                //hide the login page
                hide();
                //show the game mode selection screen
                GameMode.show(username_logged_in);
            } 
        })
    }


    /**
     * Function called when user press "Sign In" button
     * Sends an AJAX request to express server
     */
    async function doSignin() {
        
        let signin = JSON.stringify({
            username: userName,
            password: userPassword, 
        });
        console.log("Sign in: " + signin);

        // loading.changeText("Processing your signin request");

        /**
         * ===========================================
         * TODO: 
         * Start the server and check that this fetch is done correctly. 
         * (i.e. Check datatype etc...)
         * 
         * Also make sure the return error message is good cuz I'll render that message directly
         * 
         * When ready, uncomment the fetch and comment all code below this line
         * ===========================================
         */
        await fetch("/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: signin
        }).then((res) => {
            return(res.json())
        }).then((json) => {
            if (json.status == "success") {
                username_logged_in = userName;
                console.log("logged in as: " + username_logged_in);
                hide(); 
                GameMode.show(username_logged_in);
            } else if(json.status == "error"){
                showWarning("signin", json.error);
            }
        }).catch((err) => {
            console.log("Error on Signin Ajax");
            showWarning("signin", "An unknown error occured")
        })

        // await new Promise(function (resolve) {
        //     setTimeout(() => resolve("done!"), 500);
        // });

        // hide();

        // GameMode.show("Saber Athena");


    }

    /**
     * Function called when user press "Register" button
     * Sends an AJAX request to express server
     */
    async function doRegister(){        
        if(registerPassword != registerPasswordConfirm){
            this.showWarning("register", "The two passwords does not match!");
            return;
        }

        let register = JSON.stringify({
            username: registerUserName,
            password: registerPassword, 
        });

        console.log("Register: " + register);

        /**
         * ===========================================
         * TODO: 
         * Start the server and check that this fetch is done correctly. 
         * (i.e. Check datatype etc...)
         * 
         * Also make sure the return error message is good cuz I'll render that message directly
         * 
         * When ready, uncomment the fetch and comment all code below this line
         * ===========================================
         */
        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: register
        }).then((res) => {
            return(res.json())
        }).then((json) => {
            if (json.status == "success") {
                //Bad implementation. Improve later.
                showWarning("register", "Creation Successful, please signin now");
            } else if(json.status == "error"){
                showWarning("register", json.error);
            }
        }).catch((err) => {
            console.log("Error on register Ajax");
            showWarning("register", "An unknown error occured")
        })

        //Dummy delay, delete later
        await new Promise(function (resolve) {
            setTimeout(() => resolve("done!"), 500);
        });

        showWarning("register", "Creation Successful, please signin now");
    }

    function showWarning(place, text){
        if(place == "signin"){
            document.querySelector("#SignInWarning").style.display = "block";
            document.querySelector("#SignInWarning").textContent = text; 
        } else if(place == "register") {
            document.querySelector("#RegisterWarning").style.display = "block";
            document.querySelector("#RegisterWarning").textContent = text; 
        }
    }

    init();

    function show() {
        document.querySelector(".homebody").style.display = "flex";
    }

    function hide() {
        document.querySelector(".homebody").style.display = "none";
        document.querySelector(".homebodyBig").style.display = "none";
    }

    function getLoggedInUser() {
        return username_logged_in;
    }

    return{hide,getLoggedInUser}

}()