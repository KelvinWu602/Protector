const Login = function () {

    //Forgive me for doing it the react way

    let userName = "";
    let userPassword = "";

    let registerUserName = "";
    let registerPassword = "";
    let registerPasswordConfirm = "";

    function init() {
        /**
         * ==========================================
         * LOGIN
         * ==========================================
         */

        //Username Listener
        document.getElementById("usernameInput").addEventListener("input", (e) => {
            userName = e.target.value;
            //console.log(userName)
        })

        //Password Listener
        document.getElementById("passwordInput").addEventListener("input", (e) => {
            userPassword = e.target.value;
        })

        // Handling Login
        document.getElementById("LoginButton").onclick = () => {
            doSignin();
        }

        document.querySelector("#SignInWarning").style.display = "none";

        /**
         * ==========================================
         * REGISTER
         * ==========================================
         */

        document.getElementById("usernameInput").addEventListener("input", (e) => {
            registerUserName = e.target.value;
        })

        document.getElementById("passwordRegister").addEventListener("input", (e) => {
            registerPassword = e.target.value;
        })

        document.getElementById("passwordRegisterConfirm").addEventListener("input", (e) => {
            registerPasswordConfirm = e.target.value;
        })

        document.getElementById("RegisterButton").onclick = () => {
            console.log("dsjakhlbjfdv")
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

    }

    /**
     * Function called when user press "Sign In" button
     * Sends an AJAX request to express server
     */
    async function doSignin() {

        hide(); 
        loading.show();
        
        let signin = {
            username: userName,
            password: userPassword, 
        }

        loading.changeText("Processing your signin request");

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

        // await fetch("/signin", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: signin
        // }).then((res) => {
        //     return(res.json())
        // }).then((json) => {
        //     if (json.status == "success") {
        //         gameStart();
        //     } else if(json.status == "error"){
        //         showWarning("signin", json.error);
        //     }
        // }).catch((err) => {
        //     console.log("Error on Signin Ajax");
        //     showWarning("signin", "An unknown error occured")
        // })

        //Dummy delay, delete later
        await new Promise(function (resolve) {
            setTimeout(() => resolve("done!"), 500);
        });

        loading.playerMatch();
    }

    /**
     * Function called when user press "Register" button
     * Sends an AJAX request to express server
     */
    async function doRegister(){
        console.log("Do register");
        
        if(registerPassword != registerPasswordConfirm){
            this.showWarning("register", "The two passwords does not match!");
            return;
        }

        let register = {
            username: registerUserName,
            password: registerPassword, 
        }

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
        // fetch("/register", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: register
        // }).then((res) => {
        //     return(res.json())
        // }).then((json) => {
        //     if (json.status == "success") {
        //         //Bad implementation. Improve later.
        //         showWarning("register", "Creation Successful, please signin now");
        //     } else if(json.status == "error"){
        //         showWarning("register", json.error);
        //     }
        // }).catch((err) => {
        //     console.log("Error on register Ajax");
        //     showWarning("register", "An unknown error occured")
        // })

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

    function removeLoadingScreen() {
    }

    function show() {
        document.querySelector(".homebody").style.display = "flex";
    }

    function hide() {
        document.querySelector(".homebody").style.display = "none";
        document.querySelector(".homebodyBig").style.display = "none";
    }

    function gameStart() {
        loading.hide(); 
        document.querySelector("canvas").style.display = "block";
    }

    removeLoadingScreen();

    return{hide}

}()