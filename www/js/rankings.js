document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    document.addEventListener("backbutton", onBackKeyDown, false);

    const buttons = $(".mdc-button");
    for (const button of buttons) {
        mdc.ripple.MDCRipple.attachTo(button);
    }

    progress_bar = mdc.linearProgress.MDCLinearProgress.attachTo(document.getElementById('progress-bar'));
    progress_bar.determinate = false;

    $('#close-button').click(function() {
        goBack();
    });


    requestRankings()
    .done(function(result) {
        let rankings = JSON.parse(result).ranking;

        progress_bar.determinate = true;

        for (user of rankings) {
            
            let card = $('#card-user').clone();

            if (user.username != null) 
                $(card).find("#user-name").text(user.username);

            if (user.img != null) 
                $('#user-image').attr("src", "data:image/png;base64," + user.img);

            $(card).find("#user-lp").text(user.lp);
            $(card).find("#user-xp").text(user.xp);
            $(card).appendTo("#users-list").show();

            console.log(user);


        }
    });
};


function onBackKeyDown() {
    goBack();
}

