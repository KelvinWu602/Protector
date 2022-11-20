const Login = function () {

    let userName = "";
    let userPassword = "";

    function init() {
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
            handleLogin();
        }

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

    function handleLogin() {
        //Loading
        showLoadingScreen();
        doSignin(); 
        doGame.start(); 
    }

    async function doSignin() {
        //Dummy delay, delete later
        await new Promise(function (resolve) {
            setTimeout(() => resolve("done!"), 500);
        });

        let signin = {
            username: userName,
            password: userPassword, 
        }

        // fetch("/signin", {
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
        //     }
        // }).catch((err) => {
        //     console.log("Error on Signin Ajax")
        // })
    }

    init();

    function showLoadingScreen() {
        document.querySelector(".homebody").style.display = "none";
        document.querySelector(".Loading").style.display = "flex";
    }

    function removeLoadingScreen() {
        document.querySelector(".homebody").style.display = "flex";
        document.querySelector(".Loading").style.display = "none";
    }

    function gameStart() {
        document.querySelector(".Loading").style.display = "none";
        document.querySelector("canvas").style.display = "block";
    }

    removeLoadingScreen();

}()