document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    document.addEventListener("backbutton", onBackKeyDown, false);

    const buttons = $(".mdc-button");

    for (const button of buttons) {
        mdc.ripple.MDCRipple.attachTo(button);
    }

    progress_bar = mdc.linearProgress.MDCLinearProgress.attachTo(document.getElementById('progress-bar'));
    progress_bar.progress = 0;

    $('#profile-button').click(function () {
        window.location = "profile.html";
    });

    $('#rankings-button').click(function () {
        window.location = "rankings.html";
    });

    $('#close-button').click(function () {
        //window.location = "map.html";
        goBack();
    });

    const id = new URLSearchParams(window.location.search).get('id');
    object = getMapObjectWithId(id);
    user = getUser();
    initUI();
    startFight();
}

function initUI() {
    $('#object-image').attr("src", "data:image/png;base64," + object.base64image);
    $('#object-name').text(object.name);
    $('#object-size').text("Dimensione: " + object.size);

    if (user.base64image != null)
        $('#user-image').attr("src", "data:image/png;base64," + user.base64image);

    $('#user-name').text(user.name);
    $('#user-lp').text("Dimensione: " + user.lp);
    $('#user-xp').text("Dimensione: " + user.xp);
}

function startFight() {
    requestFightEatResult(object.id)
        .done(function (result) {
            stats = JSON.parse(result);
            console.log(stats);

            updateUserStatsLocal(stats);
            if (!stats.died)
                removeMapObjectWithId(object.id);
            updateUI(stats);
        });
}

function updateUI(stats) {
    if (stats.died) {

        shake($('#card-user'));

        $('#fight-result').text("Sei morto!");
        $('#fight-result-info').text("Tornerai in vita con 100 punti vitsa ma perdi tutti i punti esperienza acquisiti")
        $('#user-lp').text("Punti vita: 0");
        $('#user-xp').text("Punti esperienza: 0");
    } else {

        shake($('#card-monster'));

        $('#fight-result').text("Hai sconfitto il mostro!");
        $('#user-lp').text("Punti vita: " + stats.lp);
        $('#user-xp').text("Punti esperienza: " + stats.xp);
        $('#object-lp').text("Punti vita: 0");

        $('#lp-lost').text("Hai perso " + (user.lp - stats.lp) + " punti vita");
        $('#xp-gain').text("Hai guadagnato " + (stats.xp - user.xp) + " punti esperienza!");
    }

    progress_bar.progress = 1;
    $('#rankings-button').show();
    $('#profile-button').show();
}

function shake(card) {
    $(card).effect( "shake", {times:2}, 400, function() {
        $(card).addClass("opacity-layer");
    });
}

function onBackKeyDown() {
    goBack();
}