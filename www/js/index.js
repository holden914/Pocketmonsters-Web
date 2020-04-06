var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        console.log("App is ready");
        initPage();
    }
}

function initPage() {

    const TEST_SESSION_ID = "";
    
    if (TEST_SESSION_ID.length != 0) {
        localStorage.setItem("user", JSON.stringify(new User(session_id)));
        window.location = "map.html";
    } else {

        // if session_id not in localStorage
        if (getSessionId() ==  null) {
            $.get(get_session_url, (data) => {
                let session_id = (JSON.parse(data)).session_id;
                console.log("Retrieved session_id from server:", session_id);
                localStorage.setItem("session_id", session_id);
                localStorage.setItem("user", JSON.stringify(new User(session_id)));
                window.location = "map.html";
            })  
            .fail(function () {
                alert("Qualcosa è andato storto nella richiesta del nuvo session_id");
            });

        } else {
            window.location = "map.html";
        }
    }
}