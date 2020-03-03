const get_map_url = "https://ewserver.di.unimi.it/mobicomp/mostri/getmap.php";
const get_image_url = "https://ewserver.di.unimi.it/mobicomp/mostri/getimage.php";
const set_profile_url = "https://ewserver.di.unimi.it/mobicomp/mostri/setprofile.php";
const request_fight_result_url = "https://ewserver.di.unimi.it/mobicomp/mostri/fighteat.php";
const request_rankings_url = "https://ewserver.di.unimi.it/mobicomp/mostri/ranking.php";

// PAGES HISTORY

console.log(location.pathname);

if (sessionStorage.getItem("pages_history") == null) {
    let pages_history = new Array();
    pages_history.push(location.pathname);
    sessionStorage.setItem("pages_history", JSON.stringify(pages_history));
} else {
    let pages_history = JSON.parse(sessionStorage.getItem("pages_history"));

    if (pages_history[pages_history.length - 1] != location.pathname) 
        pages_history.push(location.pathname);
        
    sessionStorage.setItem("pages_history", JSON.stringify(pages_history));
}


// LOCAL

function getMapObjectWithId(id) {

    let map_objects = JSON.parse(localStorage.getItem("map_objects"));

    for (object of map_objects) {
        if (parseInt(object.id) == id) {
            return object;
        }
    }

    return null;
}

function getMapObjects() {
    return JSON.parse(localStorage.getItem("map_objects"));
}

function getMonstersCount() {
    let map_objects = JSON.parse(localStorage.getItem("map_objects"));
    let count = 0;
    for (object of map_objects) {
        if (object.type == "MO")
            count++;
    }
    return count;
}

function removeMapObjectWithId(id) {

    let map_objects = JSON.parse(localStorage.getItem("map_objects"));

    var filtered = map_objects.filter(function(value, index, arr){
        return value.id != id;
    });

    localStorage.setItem("map_objects", JSON.stringify(filtered));
}

function getSessionId() {
    return localStorage.getItem("session_id");
}

function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function updateUserInfoLocal(username, userimage) {
    
    let user = getUser();
    user.name = username;
    user.base64image = userimage;

    localStorage.setItem("user", JSON.stringify(user));
}

function updateUserStatsLocal(stats) {

    let user = getUser();

    if (!stats.died) {
        user.lp = stats.lp;
        user.xp = stats.xp;
    } else {
        user.lp = 100;
        user.xp = 0;
    }

    localStorage.setItem("user", JSON.stringify(user));
} 


// REMOTE 

function requestMap() {
    return $.ajax({
        method: "POST",
        url: get_map_url,
        data: JSON.stringify({ "session_id": getSessionId() })
    });
}

function updateUserInfoRemote(name, image) {
    return $.ajax({
        method: "POST",
        url: set_profile_url,
        data: JSON.stringify({ "session_id": getUser().session_id, "username": name, "img": image})
    });
}

function requestImage(map_object) {
    return $.ajax({
        method: "POST",
        url: get_image_url,
        data: JSON.stringify({ "session_id": getSessionId(), "target_id": map_object.id })
    });
}

function requestFightEatResult(target_id) {
    return $.ajax({
        method: "POST",
        url: request_fight_result_url,
        data: JSON.stringify({ "session_id": getUser().session_id, "target_id": target_id })
    });
}

function requestRankings() {
    return $.ajax({
        method: "POST",
        url: request_rankings_url,
        data: JSON.stringify({ "session_id": getUser().session_id })
    });
}

function goBack() {
    // Handle the back button
    let pages_history = JSON.parse(sessionStorage.getItem("pages_history"));
    let previous_page = pages_history[pages_history.length - 2];

    if (previous_page.includes("fight"))
        window.location = "map.html";
    else 
        window.location = previous_page;

    pages_history.pop();
    sessionStorage.setItem("pages_history", JSON.stringify(pages_history));
}