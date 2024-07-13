let homeLocation = null;
let workLocation = null;
let currentZone = "Placing";

function setHome() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            homeLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            localStorage.setItem('homeLocation', JSON.stringify(homeLocation));
            alert('집 위치가 설정되었습니다.');
            updateCurrentZone(position.coords.latitude, position.coords.longitude);
        });
    }
}

function setWork() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            workLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            localStorage.setItem('workLocation', JSON.stringify(workLocation));
            alert('직장 위치가 설정되었습니다.');
            updateCurrentZone(position.coords.latitude, position.coords.longitude);
        });
    }
}

function updateCurrentLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('currentLocation').textContent = `현재 위치: 위도 ${lat.toFixed(6)}, 경도 ${lon.toFixed(6)}`;
            updateCurrentZone(lat, lon);
        });
    }
}

function updateCurrentZone(lat, lon) {
    homeLocation = JSON.parse(localStorage.getItem('homeLocation'));
    workLocation = JSON.parse(localStorage.getItem('workLocation'));
    
    if (homeLocation) {
        const distanceToHome = calculateDistance(lat, lon, homeLocation.lat, homeLocation.lon);
        if (distanceToHome <= 10) currentZone = "집";
        else if (distanceToHome <= 15) currentZone = "집 Overlay";
        else if (distanceToHome <= 3015) currentZone = "집 주변";
    }
    
    if (workLocation) {
        const distanceToWork = calculateDistance(lat, lon, workLocation.lat, workLocation.lon);
        if (distanceToWork <= 30) currentZone = "직장";
        else if (distanceToWork <= 35) currentZone = "직장 Overlay";
        else if (distanceToWork <= 3035) currentZone = "직장 주변";
    }
    
    document.getElementById('currentZone').textContent = `현재 영역: ${currentZone}`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

document.getElementById('setHome').addEventListener('click', setHome);
document.getElementById('setWork').addEventListener('click', setWork);
document.getElementById('goToLogging').addEventListener('click', () => {
    window.location.href = 'logging.html';
});

setInterval(updateCurrentLocation, 60000); // 1분마다 위치 업데이트
updateCurrentLocation(); // 초기 위치 설정
