document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(function () {
    initUI();
});

// starts when google maps API responds
function initMap() {

    console.log("inizializzo mappa");

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 45.46, lng: 9.19 },
        disableDefaultUI: true,
        clickableIcons: false,
        minZoom: 1,
        maxZoom: 20,
        zoom: 10
    });

    map.addListener('click', function () {
        hideModal();
    });

    // these methods depend on map functionality. They fire only when map is loaded
    initMapControls();

    map_objects = [];
    markers = [];

    if (getMapObjects() == null)
        initMapObjects();
    else
        checkMapObjectsAvailability();
}

function initUI() {
    const buttons = $(".mdc-button");
    for (const button of buttons) {
        mdc.ripple.MDCRipple.attachTo(button);
    }

    progress_bar = mdc.linearProgress.MDCLinearProgress.attachTo(document.getElementById('progress-bar'));
    snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.getElementById('snackbar'));

    $('#profile-button').click(function () {
        window.location = "profile.html";
    });

    $("#close-modal").click(function () {
        hideModal();
    });

    $('#fighteat-button').click(function () {
        fightEat();
    });

    updateUserUI(getUser());
}


function updateUserUI(user) {
    $('#user-lp').fadeOut(100, function () {
        if (user.lp < 25)
            $(this).css('color', 'red');

        if (user.lp >= 25 && user.lp < 75)
            $(this).css('color', 'orange');

        if (user.lp >= 75 && user.lp <= 100)
            $(this).css('color', 'green');

        $(this).text(user.lp).fadeIn(100);
    });

    $('#user-xp').text(user.xp);
}

function initMapObjects() {
    requestMap()
        .done(function (result) {

            map_objects = JSON.parse(result).mapobjects;

            // request images for all map_objects received from server
            for (let i = 0; i < map_objects.length; i++) {

                let object = map_objects[i];

                requestImage(object)
                    .done(function (result) {

                        // update the object and add the marker to map
                        object.base64image = JSON.parse(result).img;
                        console.log("ho settato l'immagine dell'oggetto", object);
                        addMarker(object);

                        // save the updated object to localStorage
                        if (getMapObjects() == null) {
                            localStorage.setItem("map_objects", JSON.stringify([object]));
                        } else {
                            let old_entries = getMapObjects();
                            old_entries.push(object);
                            localStorage.setItem("map_objects", JSON.stringify(old_entries));
                        }
                    })
                    .fail(function () {
                        console.log("Qualcosa è andato storto nella richiesta dell'immagine dell'oggetto", map_objects[i]);
                    });
            }
        })
        .fail(function () {
            alert("Qualcosa è andato storto nella richiesta della mappa");
        });
}

function checkMapObjectsAvailability() {
    if (getMapObjects().length == 0 || getMonstersCount() == 0) {
        initMapObjects();
    } else {
        map_objects = getMapObjects();
        for (object of map_objects) {
            addMarker(object);
        }
    }
}

function showModal(target) {

    if (typeof userLocation != "undefined") {
        $('.modal').removeClass('slide-down');
        $('.modal').addClass('slide-up');
        $('#map').addClass('opacity-layer');

        // disable map zoom and pan
        map.set('gestureHandling', 'none');
        updateModalUI(target);
    } else {

        if (geolocationPermission)
            showSnackbar("Attiva la geolocalizzazione per giocare", "Ok");
        else 
            showSnackbar("Consenti l'uso della geolocalizzazione per giocare", "Ok");
    }
}

function hideModal() {
    if ($('.modal').hasClass('slide-up')) {
        $('.modal').addClass('slide-down');
        $('.modal').removeClass('slide-up');
        $('#map').removeClass('opacity-layer');

        // enable map zoom and pan
        map.set('gestureHandling', 'greedy');

        // reset modal progress bar and distance message
        progress_bar.determinate = true;
        progress_bar.progress = 0;
        $('#object-distance-message').text("");
    }
}

function addMarker(map_object) {

    let object_icon;

    if (map_object.type == "MO") {
        object_icon = {
            path: 'M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z',
            fillColor: '#35e538',
            fillOpacity: 0.9,
            scale: 1.5,
            strokeWeight: 1.5
        };
    } else {
        object_icon = {
            path: 'M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z',
            fillColor: '#e53835',
            fillOpacity: 0.9,
            scale: 1.5,
            strokeWeight: 1.5
        };
    }

    let marker = new google.maps.Marker({
        position: { lat: Number(map_object.lat), lng: Number(map_object.lon) },
        title: map_object.id,
        icon: object_icon
    });

    markers.push(marker);
    marker.setMap(map);

    marker.addListener('click', function () {
        if ($(".modal").hasClass("slide-down"))
            showModal(this.title);
        else
            hideModal();
    });
}

function removeMarker(object_id) {
    for (marker of markers) {
        if (marker.title == object_id) {
            marker.setMap(null);
        }
    }
}

function observeGeolocationChanges() {
    geoLocationOptions = {
        enableHighAccuracy: true
    };

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(geolocationChanged, geolocationError, geoLocationOptions);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}


function onDeviceReady() {
    permissions = cordova.plugins.permissions;
    geolocationPermission = false;

    permissions.hasPermission(permissions.ACCESS_FINE_LOCATION, function (status) {
        if (status.hasPermission) {
            geolocationPermission = true;
            observeGeolocationChanges();
        } else {
            permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, locationPermissionSuccess, locationPermissionError);
        }
    });

    document.addEventListener("backbutton", function (e) {

        e.preventDefault();
        navigator.app.exitApp();

    }, false);

    function locationPermissionSuccess(status) {

        if (!status.hasPermission) {
            locationPermissionError();
            return;
        }
            
        geolocationPermission = true;
        observeGeolocationChanges();
    }

    function locationPermissionError() {
        geolocationPermission = false;
    }

}

function initMapControls() {
    let locationControlDiv = document.createElement('div');
    locationControlDiv.id = "location-control-div";
    locationControlDiv.index = 1;
    let locationControl = new LocationControl();
    locationControlDiv.appendChild(locationControl);

    locationControlDiv.addEventListener('click', function () {

        if (geolocationPermission) {
            if (typeof userLocation == "undefined")
                showSnackbar("Whoops, dove sei? Attiva la geolocalizzazione", "Ok");
            else
                map.setCenter(userLocation);
        } else {
            showSnackbar("Consenti l'uso della geolocalizzazione per giocare", "Ok");
        }
    });

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationControlDiv);
}

function LocationControl() {
    let controlUI = document.createElement("i");
    controlUI.classList.add("material-icons");
    controlUI.innerText = "my_location";
    controlUI.title = 'Click to recenter the map';
    controlUI.style.textAlign = "middle";
    return controlUI;
}

function updateUserMarker(userLocation) {

    if (typeof user_marker == "undefined") {

        console.log("creo user marker");

        user_marker = new google.maps.Marker({
            position: userLocation,
            animation: google.maps.Animation.BOUNCE,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: 'blue',
                fillOpacity: 0.8,
                scale: 12,
                strokeColor: 'white',
                strokeWeight: 4
            }
        });

        user_marker.setMap(map);

    } else {
        console.log("aggiorno user marker");
        user_marker.setPosition(userLocation);
    }

    setTimeout(function() {
        user_marker.setAnimation(null);
    }, 2000);
}

function updateModalUI(target) {
    // update modal UI
    let object = getMapObjectWithId(target);

    console.log(object);

    let origin = userLocation;
    let destination = { lat: parseFloat(object.lat), lng: parseFloat(object.lon) };

    let distance = parseInt(haversine_distance(origin, destination));

    if (distance <= 50) {
        $('#fighteat-button').prop('disabled', false);
        $('#object-distance').css('color', 'green');
    } else {
        $('#fighteat-button').prop('disabled', true);
        $('#object-distance').css('color', 'red');
        $('#object-distance-message').text("Avvicinati per interagire");
    }

    if (distance >= 1000)
        $('#object-distance').text(parseInt((distance / 1000)) + " km");
    else
        $('#object-distance').text(distance + " m");

    $('#object-id').text(object.id);
    $('#object-name').text(object.name);
    $('#object-image').attr("src", "data:image/png;base64," + object.base64image);
    $('#object-size').text("Dimensione: " + object.size);

    if (object.type == "MO")
        $('#fighteat-button').find('span.mdc-button__label').text("Combatti");
    else
        $('#fighteat-button').find('span.mdc-button__label').text("Mangia");
}

function haversine_distance(origin, destination) {
    var R = 6371e3; // radius of the Earth in metres
    var φ1 = origin.lat * (Math.PI / 180);
    var φ2 = destination.lat * (Math.PI / 180);
    var Δφ = (destination.lat - origin.lat) * (Math.PI / 180);
    var Δλ = (destination.lng - origin.lng) * (Math.PI / 180);

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}







function fightEat() {

    progress_bar.determinate = false;

    let object_id = $("#object-id").text();
    if ($('#fighteat-button').find("span").text() == "Combatti") {
        window.location = "fight.html?id=" + object_id;
    } else {
        requestFightEatResult(object_id)
            .done(function (result) {
                stats = JSON.parse(result);
                updateUserStatsLocal(stats);

                let object_image = $("#object-image");
                let lp_container_pos = $("#user-lp").position();
                object_image.animate({
                    left: lp_container_pos.left - object_image.position().left,
                    top: -1000,
                    height: "toggle",
                    width: "toggle"
                }, 500, "swing", function () {
                    $('#user-lp').fadeOut(100, function () {
                        $(this).text(getUser().lp).fadeIn(200);
                    });

                    updateUserUI(getUser());
                    $(this).removeAttr('style');
                });

                progress_bar.determinate = true;
                progress_bar.progress = 1;

                hideModal();
                removeMapObjectWithId(object_id);
                removeMarker(object_id);
                checkMapObjectsAvailability();
            });
    }
}

function geolocationChanged(position) {
    myLat = position.coords.latitude;
    myLon = position.coords.longitude;
    userLocation = { lat: myLat, lng: myLon };
    updateUserMarker(userLocation);
}

function geolocationError(error) {
    console.log(error);
}

function showSnackbar(labelText, actionButtonText) {
    snackbar.labelText = labelText;
    snackbar.actionButtonText = actionButtonText;
    snackbar.open();
}