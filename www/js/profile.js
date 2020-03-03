document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    document.addEventListener("backbutton", onBackKeyDown, false);

    mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));
    snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.getElementById('snackbar'));
    
    const buttons = $(".mdc-button");
    for (const button of buttons) {
        mdc.ripple.MDCRipple.attachTo(button);
    }
    
    updateUI();
    
    $('#rankings-button').click(function() {
        window.location.href = "rankings.html";
    });

    $('#close-button').click(function() {
        goBack();
    });

    $('#textfield-username').on("keyup", function() {
        $('#save-button').prop('disabled', false);
    });

    $('#user-image-button').click(function() {
        getPhoto(Camera.PictureSourceType.PHOTOLIBRARY);
    });

    $('#save-button').click(function() {

        let user = getUser();

        if (user != null) {

            if (checkUserName()) {

                let username = $('#textfield-username').val();
                if (username.length == 0)
                    username == null;

                let user_image = $('#user-image').attr("src");
                if (!user_image.includes("round_person")) 
                    user_image = user_image.split("base64,")[1];
                else 
                    user_image = null;

                updateUserInfoRemote(username, user_image)
                .done(function(result) {
                    console.log(result);
                    showSnackbar("Modifiche salvate", "Ok");
                    updateUserInfoLocal(username, user_image);
                    updateUI();
                })
                .fail(function(result) {
                    console.log(result);
                    showSnackbar("Qualcosa è andato storto", "Ok");
                });
            } else {
                showSnackbar("Qualcosa è andato storto", "Ok");
            }
        } else {
            showSnackbar("Utente non disponibile", "Ok");
        }
    });

    $('#edit-button').click(function() {

        if ($(this).text() == "edit")
            $(this).text("close");
        else
            $(this).text("edit");

        if ($('.customize-container').is(":visible")) {
            $('.customize-container').slideUp("fast", function() {
                $('.navigation-container').fadeIn("fast");
            });
        } else {
            $('.customize-container').slideDown("fast");
            $('.navigation-container').fadeOut("fast");
        }
    });

};


function checkUserName() {
    let username = $("#textfield-username").val();
    return (username.length > 0 && username.length > 2);
}

function updateUI() {
    let user = getUser();
    if (user != null) {

        $('#user-lp').text("Punti vita: " + user.lp);
        $('#user-xp').text("Punti esperienza: " + user.xp);

        if (user.name != null) {
            $('#user-name').text(user.name);
        }
        
        if (user.base64image != null) {
            $("#user-image").attr("src", "data:image/jpg;base64," + user.base64image);
        }

    } else {
        console.log("User is null");
    }
}

function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onSuccess, onFail, {
      sourceType: source });
}

function onSuccess(imageData) {

    console.log(imageData);

    user_image = imageData;

    $("#user-image").attr("src", "data:image/jpg;base64," + imageData);
    $('#save-button').prop('disabled', false);
}

function onFail(error) {
    console.log(error);
    $('#save-button').prop('disabled', true);
}

function onBackKeyDown() {
    goBack();
}

function showSnackbar(labelText, actionButtonText) {

    snackbar.labelText = labelText;
    snackbar.actionButtonText = actionButtonText;
    snackbar.open();
}