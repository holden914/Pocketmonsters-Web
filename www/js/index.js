var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        console.log("App is ready");
        initPage();
    }
};

function initPage() {

    const TEST_SESSION_ID = "";
    let session_id = "";
    
    if (TEST_SESSION_ID != "")
        session_id = TEST_SESSION_ID;
    else 
        session_id = getSessionId();

    if (session_id != null)
        window.location = "map.html";

    let url = "https://ewserver.di.unimi.it/mobicomp/mostri/register.php";
    $.get(url, (data) => {
        session_id = (JSON.parse(data)).session_id;
        console.log("Retrieved session_id from server:", session_id);
        localStorage.setItem("session_id", session_id);
        localStorage.setItem("user", JSON.stringify(new User(session_id)));
        window.location = "map.html";
    })
    .fail(function () {
        alert("Qualcosa è andato storto");
    });
}